using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AgriLink.API.Data;
using AgriLink.API.DTOs;
using System.Security.Claims;

namespace AgriLink.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly AgriLinkDbContext _context;
    private readonly ILogger<DashboardController> _logger;

    public DashboardController(AgriLinkDbContext context, ILogger<DashboardController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/dashboard/farmer (Farmer only)
    [HttpGet("farmer")]
    [Authorize(Roles = "Farmer")]
    public async Task<ActionResult<FarmerDashboardDto>> GetFarmerDashboard()
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var totalProducts = await _context.Products
                .Where(p => p.FarmerId == userId)
                .CountAsync();

            var pendingProducts = await _context.Products
                .Where(p => p.FarmerId == userId && p.Status == "Pending")
                .CountAsync();

            var approvedProducts = await _context.Products
                .Where(p => p.FarmerId == userId && p.Status == "Available")
                .CountAsync();

            var totalOrders = await _context.OrderItems
                .Where(oi => oi.Product.FarmerId == userId)
                .Select(oi => oi.OrderId)
                .Distinct()
                .CountAsync();

            var totalRevenue = await _context.OrderItems
                .Where(oi => oi.Product.FarmerId == userId && oi.Order.Status == "Completed")
                .SumAsync(oi => oi.Subtotal);

            var recentProducts = await _context.Products
                .Include(p => p.Farmer)
                .Where(p => p.FarmerId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .Take(5)
                .Select(p => new ProductResponseDto
                {
                    Id = p.Id,
                    VegetableName = p.VegetableName,
                    Variety = p.Variety,
                    Grade = p.Grade,
                    PricePerKg = p.PricePerKg,
                    AvailableQuantityKg = p.AvailableQuantityKg,
                    HarvestDate = p.HarvestDate,
                    District = p.District,
                    Description = p.Description,
                    IsExportReady = p.IsExportReady,
                    IsOrganic = p.IsOrganic,
                    Status = p.Status,
                    ImageUrl = p.ImageUrl,
                    CertificationUrl = p.CertificationUrl,
                    FarmerId = p.FarmerId,
                    FarmerName = p.Farmer.FullName,
                    FarmerEmail = p.Farmer.Email,
                    FarmerPhone = p.Farmer.PhoneNumber ?? "",
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt ?? DateTime.UtcNow
                })
                .ToListAsync();

            return Ok(new FarmerDashboardDto
            {
                TotalProducts = totalProducts,
                PendingProducts = pendingProducts,
                ApprovedProducts = approvedProducts,
                TotalOrders = totalOrders,
                TotalRevenue = totalRevenue,
                RecentProducts = recentProducts
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching farmer dashboard");
            return BadRequest(new { message = "Failed to fetch dashboard data", error = ex.Message });
        }
    }

    // GET: api/dashboard/exporter (Exporter only)
    [HttpGet("exporter")]
    [Authorize(Roles = "Exporter")]
    public async Task<ActionResult<ExporterDashboardDto>> GetExporterDashboard()
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var availableProducts = await _context.Products
                .Where(p => p.Status == "Available")
                .CountAsync();

            var totalOrders = await _context.Orders
                .Where(o => o.ExporterId == userId)
                .CountAsync();

            var pendingOrders = await _context.Orders
                .Where(o => o.ExporterId == userId && o.Status == "Pending")
                .CountAsync();

            var completedOrders = await _context.Orders
                .Where(o => o.ExporterId == userId && o.Status == "Completed")
                .CountAsync();

            var totalSpent = await _context.Orders
                .Where(o => o.ExporterId == userId && o.Status == "Completed")
                .SumAsync(o => o.TotalAmount);

            var recommendedProducts = await _context.Products
                .Include(p => p.Farmer)
                .Where(p => p.Status == "Available" && p.IsExportReady)
                .OrderByDescending(p => p.CreatedAt)
                .Take(6)
                .Select(p => new ProductResponseDto
                {
                    Id = p.Id,
                    VegetableName = p.VegetableName,
                    Variety = p.Variety,
                    Grade = p.Grade,
                    PricePerKg = p.PricePerKg,
                    AvailableQuantityKg = p.AvailableQuantityKg,
                    HarvestDate = p.HarvestDate,
                    District = p.District,
                    Description = p.Description,
                    IsExportReady = p.IsExportReady,
                    IsOrganic = p.IsOrganic,
                    Status = p.Status,
                    ImageUrl = p.ImageUrl,
                    CertificationUrl = p.CertificationUrl,
                    FarmerId = p.FarmerId,
                    FarmerName = p.Farmer.FullName,
                    FarmerEmail = p.Farmer.Email,
                    FarmerPhone = p.Farmer.PhoneNumber ?? "",
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt ?? DateTime.UtcNow
                })
                .ToListAsync();

            return Ok(new ExporterDashboardDto
            {
                AvailableProducts = availableProducts,
                TotalOrders = totalOrders,
                PendingOrders = pendingOrders,
                CompletedOrders = completedOrders,
                TotalSpent = totalSpent,
                RecommendedProducts = recommendedProducts
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching exporter dashboard");
            return BadRequest(new { message = "Failed to fetch dashboard data", error = ex.Message });
        }
    }

    // GET: api/dashboard/admin (Admin only)
    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<AdminDashboardDto>> GetAdminDashboard()
    {
        try
        {
            var totalUsers = await _context.Users.CountAsync();
            
            var totalFarmers = await _context.Users
                .Where(u => u.Role == "Farmer")
                .CountAsync();

            var totalExporters = await _context.Users
                .Where(u => u.Role == "Exporter")
                .CountAsync();

            var unverifiedExporters = await _context.Users
                .Where(u => u.Role == "Exporter" && !u.IsVerified)
                .CountAsync();

            var pendingProducts = await _context.Products
                .Where(p => p.Status == "Pending")
                .CountAsync();

            var totalProducts = await _context.Products.CountAsync();

            var totalOrders = await _context.Orders.CountAsync();

            var totalRevenue = await _context.Orders
                .Where(o => o.Status == "Completed")
                .SumAsync(o => o.TotalAmount);

            var recentPendingProducts = await _context.Products
                .Include(p => p.Farmer)
                .Where(p => p.Status == "Pending")
                .OrderBy(p => p.CreatedAt)
                .Take(5)
                .Select(p => new ProductResponseDto
                {
                    Id = p.Id,
                    VegetableName = p.VegetableName,
                    Variety = p.Variety,
                    Grade = p.Grade,
                    PricePerKg = p.PricePerKg,
                    AvailableQuantityKg = p.AvailableQuantityKg,
                    HarvestDate = p.HarvestDate,
                    District = p.District,
                    Description = p.Description,
                    IsExportReady = p.IsExportReady,
                    IsOrganic = p.IsOrganic,
                    Status = p.Status,
                    ImageUrl = p.ImageUrl,
                    CertificationUrl = p.CertificationUrl,
                    FarmerId = p.FarmerId,
                    FarmerName = p.Farmer.FullName,
                    FarmerEmail = p.Farmer.Email,
                    FarmerPhone = p.Farmer.PhoneNumber ?? "",
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt ?? DateTime.UtcNow
                })
                .ToListAsync();

            var recentUnverifiedExporters = await _context.Users
                .Where(u => u.Role == "Exporter" && !u.IsVerified)
                .OrderBy(u => u.CreatedAt)
                .Take(5)
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
                    ProfileImageUrl = u.ProfileImageUrl,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();

            return Ok(new AdminDashboardDto
            {
                TotalUsers = totalUsers,
                TotalFarmers = totalFarmers,
                TotalExporters = totalExporters,
                UnverifiedExporters = unverifiedExporters,
                PendingProducts = pendingProducts,
                TotalProducts = totalProducts,
                TotalOrders = totalOrders,
                TotalRevenue = totalRevenue,
                RecentPendingProducts = recentPendingProducts,
                RecentUnverifiedExporters = recentUnverifiedExporters
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching admin dashboard");
            return BadRequest(new { message = "Failed to fetch dashboard data", error = ex.Message });
        }
    }
}
