using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AgriLink.API.Data;
using AgriLink.API.DTOs;
using AgriLink.API.Services;
using System.Security.Claims;

namespace AgriLink.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly AgriLinkDbContext _context;
    private readonly ICloudinaryService _cloudinaryService;
    private readonly IAuthService _authService;
    private readonly ILogger<UserController> _logger;

    public UserController(
        AgriLinkDbContext context,
        ICloudinaryService cloudinaryService,
        IAuthService authService,
        ILogger<UserController> logger)
    {
        _context = context;
        _cloudinaryService = cloudinaryService;
        _authService = authService;
        _logger = logger;
    }

    // GET: api/user/profile
    [HttpGet("profile")]
    public async Task<ActionResult<UserDto>> GetProfile()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        
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
            ProfileImageUrl = user.ProfileImageUrl,
            CreatedAt = user.CreatedAt
        });
    }

    // PUT: api/user/profile
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromForm] UpdateProfileDto dto)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var user = await _context.Users.FindAsync(userId);
            
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Update fields if provided
            if (!string.IsNullOrEmpty(dto.FullName))
                user.FullName = dto.FullName;

            if (dto.District != null)
                user.District = dto.District;

            if (dto.Address != null)
                user.Address = dto.Address;

            if (dto.PhoneNumber != null)
                user.PhoneNumber = dto.PhoneNumber;

            if (dto.CompanyName != null && user.Role == "Exporter")
                user.CompanyName = dto.CompanyName;

            // Upload profile image if provided
            if (dto.ProfileImage != null)
            {
                user.ProfileImageUrl = await _cloudinaryService.UploadImageAsync(dto.ProfileImage, "profiles");
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Profile updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating profile");
            return BadRequest(new { message = "Failed to update profile", error = ex.Message });
        }
    }

    // POST: api/user/change-password
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var user = await _context.Users.FindAsync(userId);
            
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Verify current password
            if (!_authService.VerifyPassword(dto.CurrentPassword, user.PasswordHash))
            {
                return BadRequest(new { message = "Current password is incorrect" });
            }

            // Hash and update new password
            user.PasswordHash = _authService.HashPassword(dto.NewPassword);
            
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password changed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password");
            return BadRequest(new { message = "Failed to change password", error = ex.Message });
        }
    }

    // POST: api/user/upload-profile-image
    [HttpPost("upload-profile-image")]
    public async Task<ActionResult<object>> UploadProfileImage([FromForm] IFormFile profileImage)
    {
        try
        {
            if (profileImage == null)
            {
                return BadRequest(new { message = "No image file provided" });
            }

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var user = await _context.Users.FindAsync(userId);
            
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var imageUrl = await _cloudinaryService.UploadImageAsync(profileImage, "profiles");
            
            user.ProfileImageUrl = imageUrl;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Profile image uploaded successfully", imageUrl });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading profile image");
            return BadRequest(new { message = "Failed to upload image", error = ex.Message });
        }
    }
}
