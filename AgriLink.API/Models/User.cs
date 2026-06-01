using System.ComponentModel.DataAnnotations;

namespace AgriLink.API.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = string.Empty; // Admin, Farmer, Exporter

        [MaxLength(100)]
        public string? District { get; set; }

        [MaxLength(200)]
        public string? Address { get; set; }

        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        public string? FarmerIdProofUrl { get; set; } // For farmer verification document

        [MaxLength(100)]
        public string? CompanyName { get; set; } // For exporters

        public string? ProfileImageUrl { get; set; } // Profile photo

        public bool IsVerified { get; set; } = false; // Admin verification status

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public ICollection<Product> Products { get; set; } = new List<Product>();
        public ICollection<Order> OrdersAsExporter { get; set; } = new List<Order>();
    }
}
