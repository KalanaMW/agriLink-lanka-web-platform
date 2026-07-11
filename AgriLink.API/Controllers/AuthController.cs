using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using AgriLink.API.Data;
using AgriLink.API.Models;
using AgriLink.API.DTOs;
using AgriLink.API.Services;

namespace AgriLink.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AgriLinkDbContext _context;
        private readonly IAuthService _authService;
        private readonly IConfiguration _configuration;
        private readonly ICloudinaryService _cloudinaryService;

        public AuthController(
            AgriLinkDbContext context,
            IAuthService authService,
            IConfiguration configuration,
            ICloudinaryService cloudinaryService)
        {
            _context = context;
            _authService = authService;
            _configuration = configuration;
            _cloudinaryService = cloudinaryService;
        }

        [HttpPost("register")]
        public async Task<ActionResult> Register([FromForm] RegisterDto dto)
        {
            // Check if email already exists
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            {
                return BadRequest(new { message = "Email already registered" });
            }

            // Validate role
            var validRoles = new[] { "Admin", "Farmer", "Exporter" };
            if (!validRoles.Contains(dto.Role))
            {
                return BadRequest(new { message = "Invalid role. Must be Admin, Farmer, or Exporter" });
            }

            // Handle farmer ID proof file upload
            string? farmerIdProofUrl = null;
            if (dto.FarmerIdProof != null && dto.FarmerIdProof.Length > 0)
            {
                try
                {
                    farmerIdProofUrl = await _cloudinaryService.UploadImageAsync(dto.FarmerIdProof, "farmer-id-proofs");
                }
                catch (ArgumentException ex)
                {
                    return BadRequest(new { message = ex.Message });
                }
            }

            // Create new user
            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PasswordHash = _authService.HashPassword(dto.Password),
                Role = dto.Role,
                District = dto.District,
                Address = dto.Address,
                PhoneNumber = dto.PhoneNumber,
                CompanyName = dto.CompanyName,
                FarmerIdProofUrl = farmerIdProofUrl,
                IsVerified = dto.Role == "Admin", // Farmers and Exporters need admin approval
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Generate JWT token
            var token = _authService.GenerateJwtToken(user);
            var expiryMinutes = Convert.ToInt32(_configuration["JwtSettings:ExpiryInMinutes"]);

            return Ok(new 
            {
                token = token,
                expiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes),
                user = new
                {
                    id = user.Id,
                    fullName = user.FullName,
                    email = user.Email,
                    role = user.Role,
                    district = user.District,
                    address = user.Address,
                    phoneNumber = user.PhoneNumber,
                    companyName = user.CompanyName,
                    isVerified = user.IsVerified,
                    isActive = user.IsActive,
                    profileImageUrl = user.ProfileImageUrl,
                    createdAt = user.CreatedAt
                }
            });
        }

        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] LoginDto dto)
        {
            // Find user by email
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            // Verify password
            if (!_authService.VerifyPassword(dto.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            // Check if user is active
            if (!user.IsActive)
            {
                return Unauthorized(new { message = "Account is deactivated. Please contact administrator." });
            }

            // Generate JWT token
            var token = _authService.GenerateJwtToken(user);
            var expiryMinutes = Convert.ToInt32(_configuration["JwtSettings:ExpiryInMinutes"]);

            return Ok(new 
            {
                token = token,
                expiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes),
                user = new
                {
                    id = user.Id,
                    fullName = user.FullName,
                    email = user.Email,
                    role = user.Role,
                    district = user.District,
                    address = user.Address,
                    phoneNumber = user.PhoneNumber,
                    companyName = user.CompanyName,
                    isVerified = user.IsVerified,
                    isActive = user.IsActive,
                    profileImageUrl = user.ProfileImageUrl,
                    createdAt = user.CreatedAt
                }
            });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized();
            }

            var userId = int.Parse(userIdClaim.Value);
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(new UserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                District = user.District,
                Address = user.Address,
                PhoneNumber = user.PhoneNumber,
                CompanyName = user.CompanyName,
                IsVerified = user.IsVerified,
                IsActive = user.IsActive,
                ProfileImageUrl = user.ProfileImageUrl,
                CreatedAt = user.CreatedAt
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("verify-user/{userId}")]
        public async Task<ActionResult> VerifyUser(int userId)
        {
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            if (user.Role == "Admin")
            {
                return BadRequest(new { message = "Cannot verify an Admin" });
            }

            user.IsVerified = true;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "User verified successfully" });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("unverified-users")]
        public async Task<ActionResult<List<UserDto>>> GetUnverifiedUsers()
        {
            var users = await _context.Users
                .Where(u => u.Role != "Admin" && !u.IsVerified)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = u.Role,
                    District = u.District,
                    Address = u.Address,
                    PhoneNumber = u.PhoneNumber,
                    CompanyName = u.CompanyName,
                    IsVerified = u.IsVerified,
                    IsActive = u.IsActive,
                    FarmerIdProofUrl = u.FarmerIdProofUrl,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("users")]
        public async Task<ActionResult<List<UserDto>>> GetAllUsers([FromQuery] string? role = null)
        {
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrEmpty(role))
            {
                query = query.Where(u => u.Role == role);
            }
            else
            {
                // Exclude admins by default
                query = query.Where(u => u.Role != "Admin");
            }

            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = u.Role,
                    District = u.District,
                    Address = u.Address,
                    PhoneNumber = u.PhoneNumber,
                    CompanyName = u.CompanyName,
                    IsVerified = u.IsVerified,
                    IsActive = u.IsActive,
                    ProfileImageUrl = u.ProfileImageUrl,
                    FarmerIdProofUrl = u.FarmerIdProofUrl,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("users/{userId}/toggle-status")]
        public async Task<ActionResult> ToggleUserStatus(int userId)
        {
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            if (user.Role == "Admin")
            {
                return BadRequest(new { message = "Cannot deactivate an admin account" });
            }

            user.IsActive = !user.IsActive;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var action = user.IsActive ? "activated" : "deactivated";
            return Ok(new { message = $"User {action} successfully", isActive = user.IsActive });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("users/{userId}")]
        public async Task<ActionResult> UpdateUser(int userId, [FromBody] UserDto dto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            if (user.Role == "Admin")
            {
                return BadRequest(new { message = "Cannot edit an Admin account" });
            }

            user.FullName = dto.FullName;
            user.PhoneNumber = dto.PhoneNumber;
            user.District = dto.District;
            user.CompanyName = dto.CompanyName;
            user.Address = dto.Address;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "User updated successfully" });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("users/{userId}")]
        public async Task<ActionResult> DeleteUser(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            if (user.Role == "Admin")
            {
                return BadRequest(new { message = "Cannot delete an Admin account" });
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User deleted successfully" });
        }
    }
}
