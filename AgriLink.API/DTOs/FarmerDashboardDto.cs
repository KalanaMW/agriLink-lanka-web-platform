namespace AgriLink.API.DTOs;

public class FarmerDashboardDto
{
    public int TotalProducts { get; set; }
    public int PendingProducts { get; set; }
    public int ApprovedProducts { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalRevenue { get; set; }
    public List<ProductResponseDto> RecentProducts { get; set; } = new();
}
