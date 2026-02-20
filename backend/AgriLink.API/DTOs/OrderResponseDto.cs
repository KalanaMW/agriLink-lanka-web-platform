namespace AgriLink.API.DTOs;

public class OrderResponseDto
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public int ExporterId { get; set; }
    public string ExporterName { get; set; } = string.Empty;
    public string ExporterEmail { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public string? ShippingAddress { get; set; }
    public string? ShippingMethod { get; set; }
    public decimal? ShippingCost { get; set; }
    public string? TrackingNumber { get; set; }
    public DateTime? ShippedDate { get; set; }
    public DateTime? DeliveredDate { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<OrderItemResponseDto> Items { get; set; } = new();
    public TransactionResponseDto? Transaction { get; set; }
}

public class OrderItemResponseDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string VegetableName { get; set; } = string.Empty;
    public string Grade { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string FarmerName { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal PricePerUnit { get; set; }
    public decimal Subtotal { get; set; }
}

public class TransactionResponseDto
{
    public int Id { get; set; }
    public string TransactionId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}
