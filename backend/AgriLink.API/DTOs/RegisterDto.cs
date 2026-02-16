using System.ComponentModel.DataAnnotations;

namespace AgriLink.API.DTOs
{
    public class RegisterDto
    {
        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string Role { get; set; } = "Farmer"; // Farmer, Exporter, Admin

        public string? District { get; set; }
        public string? Address { get; set; }
        public string? PhoneNumber { get; set; }
        public string? CompanyName { get; set; } // For exporters
        public string? FarmerIdProofUrl { get; set; } // For farmers
    }
}
