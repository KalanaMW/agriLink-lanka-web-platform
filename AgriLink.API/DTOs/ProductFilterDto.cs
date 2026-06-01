namespace AgriLink.API.DTOs;

public class ProductFilterDto
{
    public string? VegetableName { get; set; }
    public string? District { get; set; }
    public string? Grade { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public decimal? MinQuantity { get; set; }
    public decimal? MaxQuantity { get; set; }
    public bool? IsExportReady { get; set; }
    public bool? IsOrganic { get; set; }
    public string? Status { get; set; } // Available, Sold, OutOfStock
    public DateTime? HarvestDateFrom { get; set; }
    public DateTime? HarvestDateTo { get; set; }
    
    // Pagination
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    
    // Sorting
    public string? SortBy { get; set; } // PriceAsc, PriceDesc, DateAsc, DateDesc, QuantityAsc, QuantityDesc
}
