namespace AgriLink.API.DTOs;

public class ProductResponseDto
{
    public int Id { get; set; }
    public string VegetableName { get; set; } = string.Empty;
    public string? Variety { get; set; }
    public string Grade { get; set; } = string.Empty;
    public decimal PricePerKg { get; set; }
    public decimal AvailableQuantityKg { get; set; }
    public DateTime HarvestDate { get; set; }
    public string District { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsExportReady { get; set; }
    public bool IsOrganic { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string? CertificationUrl { get; set; }
    
    // Quantity tracking
    public decimal SoldQuantityKg { get; set; }
    public decimal TotalQuantityKg { get; set; }
    
    // Farmer information
    public int FarmerId { get; set; }
    public string FarmerName { get; set; } = string.Empty;
    public string FarmerEmail { get; set; } = string.Empty;
    public string FarmerPhone { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
