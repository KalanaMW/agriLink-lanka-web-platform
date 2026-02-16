using System.ComponentModel.DataAnnotations;

namespace AgriLink.API.DTOs;

public class CreateProductDto
{
    [Required(ErrorMessage = "Vegetable name is required")]
    [StringLength(100, ErrorMessage = "Vegetable name cannot exceed 100 characters")]
    public string VegetableName { get; set; } = string.Empty;

    [StringLength(100, ErrorMessage = "Variety cannot exceed 100 characters")]
    public string? Variety { get; set; }

    [Required(ErrorMessage = "Grade is required")]
    [StringLength(20, ErrorMessage = "Grade cannot exceed 20 characters")]
    public string Grade { get; set; } = string.Empty;

    [Required(ErrorMessage = "Price per kg is required")]
    [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
    public decimal PricePerKg { get; set; }

    [Required(ErrorMessage = "Available quantity is required")]
    [Range(0.01, double.MaxValue, ErrorMessage = "Available quantity must be greater than 0")]
    public decimal AvailableQuantityKg { get; set; }

    [Required(ErrorMessage = "Harvest date is required")]
    public DateTime HarvestDate { get; set; }

    [Required(ErrorMessage = "District is required")]
    [StringLength(50, ErrorMessage = "District cannot exceed 50 characters")]
    public string District { get; set; } = string.Empty;

    [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
    public string? Description { get; set; }

    public bool IsExportReady { get; set; }

    public bool IsOrganic { get; set; }

    public IFormFile? ProductImage { get; set; }

    public IFormFile? CertificationDocument { get; set; }
}
