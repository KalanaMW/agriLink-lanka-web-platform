using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AgriLink.API.Data;
using AgriLink.API.Models;
using AgriLink.API.DTOs;
using AgriLink.API.Services;
using System.Security.Claims;

namespace AgriLink.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly AgriLinkDbContext _context;
    private readonly ICloudinaryService _cloudinaryService;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(
        AgriLinkDbContext context,
        ICloudinaryService cloudinaryService,
        ILogger<ProductsController> logger)
    {
        _context = context;
        _cloudinaryService = cloudinaryService;
        _logger = logger;
    }

    // POST: api/products (Farmer only)
    [HttpPost]
    [Authorize(Roles = "Farmer")]
    public async Task<ActionResult<ProductResponseDto>> CreateProduct([FromForm] CreateProductDto dto)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var product = new Product
            {
                VegetableName = dto.VegetableName,
                Variety = dto.Variety ?? string.Empty,
                Grade = dto.Grade,
                PricePerKg = dto.PricePerKg,
                AvailableQuantityKg = dto.AvailableQuantityKg,
                HarvestDate = DateTime.SpecifyKind(dto.HarvestDate, DateTimeKind.Utc),
                District = dto.District,
                Description = dto.Description ?? string.Empty,
                IsExportReady = dto.IsExportReady,
                IsOrganic = dto.IsOrganic,
                FarmerId = userId,
                Status = "Pending" // Requires admin approval
            };

            // Upload product image if provided
            if (dto.ProductImage != null)
            {
                product.ImageUrl = await _cloudinaryService.UploadImageAsync(dto.ProductImage, "products");
            }

            // Upload certification document if provided
            if (dto.CertificationDocument != null)
            {
                product.CertificationUrl = await _cloudinaryService.UploadImageAsync(dto.CertificationDocument, "certifications");
            }

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            var farmer = await _context.Users.FindAsync(userId);
            
            var response = MapToResponseDto(product, farmer!);
            
            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating product");
            return BadRequest(new { message = "Failed to create product", error = ex.Message });
        }
    }

    // GET: api/products (All authenticated users with filters)
    [HttpGet]
    public async Task<ActionResult<object>> GetProducts([FromQuery] ProductFilterDto filter)
    {
        try
        {
            var query = _context.Products
                .Include(p => p.Farmer)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(filter.VegetableName))
            {
                query = query.Where(p => p.VegetableName.Contains(filter.VegetableName));
            }

            if (!string.IsNullOrEmpty(filter.District))
            {
                query = query.Where(p => p.District == filter.District);
            }

            if (!string.IsNullOrEmpty(filter.Grade))
            {
                query = query.Where(p => p.Grade == filter.Grade);
            }

            if (filter.MinPrice.HasValue)
            {
                query = query.Where(p => p.PricePerKg >= filter.MinPrice.Value);
            }

            if (filter.MaxPrice.HasValue)
            {
                query = query.Where(p => p.PricePerKg <= filter.MaxPrice.Value);
            }

            if (filter.MinQuantity.HasValue)
            {
                query = query.Where(p => p.AvailableQuantityKg >= filter.MinQuantity.Value);
            }

            if (filter.MaxQuantity.HasValue)
            {
                query = query.Where(p => p.AvailableQuantityKg <= filter.MaxQuantity.Value);
            }

            if (filter.IsExportReady.HasValue)
            {
                query = query.Where(p => p.IsExportReady == filter.IsExportReady.Value);
            }

            if (filter.IsOrganic.HasValue)
            {
                query = query.Where(p => p.IsOrganic == filter.IsOrganic.Value);
            }

            if (!string.IsNullOrEmpty(filter.Status))
            {
                query = query.Where(p => p.Status == filter.Status);
            }
            else
            {
                // By default, only show Available products to non-admin users
                var role = User.FindFirst(ClaimTypes.Role)?.Value;
                if (role != "Admin")
                {
                    query = query.Where(p => p.Status == "Available");
                }
            }

            if (filter.HarvestDateFrom.HasValue)
            {
                query = query.Where(p => p.HarvestDate >= filter.HarvestDateFrom.Value);
            }

            if (filter.HarvestDateTo.HasValue)
            {
                query = query.Where(p => p.HarvestDate <= filter.HarvestDateTo.Value);
            }

            // Apply sorting
            query = filter.SortBy?.ToLower() switch
            {
                "priceasc" => query.OrderBy(p => p.PricePerKg),
                "pricedesc" => query.OrderByDescending(p => p.PricePerKg),
                "dateasc" => query.OrderBy(p => p.HarvestDate),
                "datedesc" => query.OrderByDescending(p => p.HarvestDate),
                "quantityasc" => query.OrderBy(p => p.AvailableQuantityKg),
                "quantitydesc" => query.OrderByDescending(p => p.AvailableQuantityKg),
                _ => query.OrderByDescending(p => p.CreatedAt)
            };

            // Get total count before pagination
            var totalCount = await query.CountAsync();

            // Apply pagination
            var products = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            var response = products.Select(p => MapToResponseDto(p, p.Farmer)).ToList();

            return Ok(new
            {
                products = response,
                pagination = new
                {
                    currentPage = filter.PageNumber,
                    pageSize = filter.PageSize,
                    totalCount,
                    totalPages = (int)Math.Ceiling(totalCount / (double)filter.PageSize)
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching products");
            return BadRequest(new { message = "Failed to fetch products", error = ex.Message });
        }
    }

    // GET: api/products/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductResponseDto>> GetProduct(int id)
    {
        var product = await _context.Products
            .Include(p => p.Farmer)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
        {
            return NotFound(new { message = "Product not found" });
        }

        return Ok(MapToResponseDto(product, product.Farmer));
    }

    // GET: api/products/my-products (Farmer's own products)
    [HttpGet("my-products")]
    [Authorize(Roles = "Farmer")]
    public async Task<ActionResult<List<ProductResponseDto>>> GetMyProducts()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        
        var products = await _context.Products
            .Include(p => p.Farmer)
            .Where(p => p.FarmerId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        var response = products.Select(p => MapToResponseDto(p, p.Farmer)).ToList();
        
        return Ok(response);
    }

    // PUT: api/products/{id} (Farmer can update own products)
    [HttpPut("{id}")]
    [Authorize(Roles = "Farmer")]
    public async Task<IActionResult> UpdateProduct(int id, [FromForm] UpdateProductDto dto)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var product = await _context.Products.FindAsync(id);
            
            if (product == null)
            {
                return NotFound(new { message = "Product not found" });
            }

            if (product.FarmerId != userId)
            {
                return Forbid();
            }

            // Update fields if provided
            if (!string.IsNullOrEmpty(dto.VegetableName))
                product.VegetableName = dto.VegetableName;
            
            if (dto.Variety != null)
                product.Variety = dto.Variety;
            
            if (!string.IsNullOrEmpty(dto.Grade))
                product.Grade = dto.Grade;
            
            if (dto.PricePerKg.HasValue)
                product.PricePerKg = dto.PricePerKg.Value;
            
            if (dto.AvailableQuantityKg.HasValue)
                product.AvailableQuantityKg = dto.AvailableQuantityKg.Value;
            
            if (dto.HarvestDate.HasValue)
                product.HarvestDate = dto.HarvestDate.Value;
            
            if (!string.IsNullOrEmpty(dto.District))
                product.District = dto.District;
            
            if (dto.Description != null)
                product.Description = dto.Description;
            
            if (dto.IsExportReady.HasValue)
                product.IsExportReady = dto.IsExportReady.Value;
            
            if (dto.IsOrganic.HasValue)
                product.IsOrganic = dto.IsOrganic.Value;

            // Upload new product image if provided
            if (dto.ProductImage != null)
            {
                product.ImageUrl = await _cloudinaryService.UploadImageAsync(dto.ProductImage, "products");
            }

            // Upload new certification document if provided
            if (dto.CertificationDocument != null)
            {
                product.CertificationUrl = await _cloudinaryService.UploadImageAsync(dto.CertificationDocument, "certifications");
            }

            product.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();

            return Ok(new { message = "Product updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating product");
            return BadRequest(new { message = "Failed to update product", error = ex.Message });
        }
    }

    // DELETE: api/products/{id} (Farmer and Admin can delete)
    [HttpDelete("{id}")]
    [Authorize(Roles = "Farmer,Admin")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);
        
        if (product == null)
        {
            return NotFound(new { message = "Product not found" });
        }

        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        // Farmers can only delete their own products, Admins can delete any
        if (role == "Farmer" && product.FarmerId != userId)
        {
            return Forbid();
        }

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Product deleted successfully" });
    }

    // PUT: api/products/{id}/approve (Admin only)
    [HttpPut("{id}/approve")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ApproveProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);
        
        if (product == null)
        {
            return NotFound(new { message = "Product not found" });
        }

        if (product.Status != "Pending")
        {
            return BadRequest(new { message = "Product is not pending approval" });
        }

        product.Status = "Available";
        product.UpdatedAt = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();

        return Ok(new { message = "Product approved successfully" });
    }

    // PUT: api/products/{id}/reject (Admin only)
    [HttpPut("{id}/reject")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RejectProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);
        
        if (product == null)
        {
            return NotFound(new { message = "Product not found" });
        }

        if (product.Status != "Pending")
        {
            return BadRequest(new { message = "Product is not pending approval" });
        }

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Product rejected and removed" });
    }

    // GET: api/products/pending (Admin only)
    [HttpGet("pending")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<ProductResponseDto>>> GetPendingProducts()
    {
        var products = await _context.Products
            .Include(p => p.Farmer)
            .Where(p => p.Status == "Pending")
            .OrderBy(p => p.CreatedAt)
            .ToListAsync();

        var response = products.Select(p => MapToResponseDto(p, p.Farmer)).ToList();
        
        return Ok(response);
    }

    // Helper method to map Product to ProductResponseDto
    private ProductResponseDto MapToResponseDto(Product product, User farmer)
    {
        // Calculate sold quantity from non-cancelled order items
        var soldQuantity = _context.OrderItems
            .Where(oi => oi.ProductId == product.Id && oi.Order.Status != "Cancelled")
            .Sum(oi => oi.Quantity);

        return new ProductResponseDto
        {
            Id = product.Id,
            VegetableName = product.VegetableName,
            Variety = product.Variety,
            Grade = product.Grade,
            PricePerKg = product.PricePerKg,
            AvailableQuantityKg = product.AvailableQuantityKg,
            HarvestDate = product.HarvestDate,
            District = product.District,
            Description = product.Description,
            IsExportReady = product.IsExportReady,
            IsOrganic = product.IsOrganic,
            Status = product.Status,
            ImageUrl = product.ImageUrl,
            CertificationUrl = product.CertificationUrl,
            SoldQuantityKg = soldQuantity,
            TotalQuantityKg = product.AvailableQuantityKg + soldQuantity,
            FarmerId = product.FarmerId,
            FarmerName = farmer.FullName,
            FarmerEmail = farmer.Email,
            FarmerPhone = farmer.PhoneNumber ?? "",
            CreatedAt = product.CreatedAt,
            UpdatedAt = product.UpdatedAt ?? DateTime.UtcNow
        };
    }
}
