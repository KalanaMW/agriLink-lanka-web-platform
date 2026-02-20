using System.ComponentModel.DataAnnotations;

namespace AgriLink.API.DTOs;

public class CreateOrderDto
{
    [Required]
    public List<CreateOrderItemDto> Items { get; set; } = new();

    [MaxLength(500, ErrorMessage = "Shipping address cannot exceed 500 characters")]
    public string? ShippingAddress { get; set; }

    [MaxLength(50, ErrorMessage = "Shipping method cannot exceed 50 characters")]
    public string? ShippingMethod { get; set; }

    [MaxLength(1000, ErrorMessage = "Notes cannot exceed 1000 characters")]
    public string? Notes { get; set; }
}

public class CreateOrderItemDto
{
    [Required]
    public int ProductId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Quantity must be greater than 0")]
    public decimal Quantity { get; set; }
}
