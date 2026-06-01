namespace AgriLink.API.DTOs;

public class ExporterDashboardDto
{
    public int AvailableProducts { get; set; }
    public int TotalOrders { get; set; }
    public int PendingOrders { get; set; }
    public int CompletedOrders { get; set; }
    public decimal TotalSpent { get; set; }
    public List<ProductResponseDto> RecommendedProducts { get; set; } = new();
}
