using System.ComponentModel.DataAnnotations;

namespace AgriLink.API.DTOs;

public class UpdateOrderStatusDto
{
    [Required]
    [RegularExpression("^(Confirmed|Processing|Shipped|Delivered|Cancelled)$",
        ErrorMessage = "Status must be one of: Confirmed, Processing, Shipped, Delivered, Cancelled")]
    public string Status { get; set; } = string.Empty;

    [MaxLength(100, ErrorMessage = "Tracking number cannot exceed 100 characters")]
    public string? TrackingNumber { get; set; }

    [MaxLength(1000, ErrorMessage = "Notes cannot exceed 1000 characters")]
    public string? Notes { get; set; }
}
