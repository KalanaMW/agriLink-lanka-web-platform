namespace AgriLink.API.DTOs;

public class AdminDashboardDto
{
    public int TotalUsers { get; set; }
    public int TotalFarmers { get; set; }
    public int TotalExporters { get; set; }
    public int UnverifiedUsers { get; set; }
    public int PendingProducts { get; set; }
    public int TotalProducts { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalRevenue { get; set; }
    public List<ProductResponseDto> RecentPendingProducts { get; set; } = new();
    public List<UserDto> RecentUnverifiedUsers { get; set; } = new();
}
