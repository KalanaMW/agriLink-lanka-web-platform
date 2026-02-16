using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriLink.API.Models
{
    public class Product
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int FarmerId { get; set; }

        [ForeignKey("FarmerId")]
        public User Farmer { get; set; } = null!;

        [Required]
        [MaxLength(100)]
        public string VegetableName { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Variety { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Grade { get; set; } = string.Empty; // A, B, C, etc.

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal PricePerKg { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal AvailableQuantityKg { get; set; }

        [MaxLength(50)]
        public string? Unit { get; set; } = "kg";

        public string? Description { get; set; }

        public string? ImageUrl { get; set; }

        public bool IsOrganic { get; set; } = false;

        public bool IsExportReady { get; set; } = true;

        [MaxLength(100)]
        public string? CertificationUrl { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Pending"; // Pending, Available, Sold, OutOfStock

        public DateTime HarvestDate { get; set; }

        public DateTime? ExpiryDate { get; set; }

        [Required]
        [MaxLength(50)]
        public string District { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
