using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

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
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
        [MaxLength(200)]
        public string Password { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? ConfirmPassword { get; set; }

        [Required]
        [RegularExpression("^(Farmer|Exporter)$", ErrorMessage = "Role must be either 'Farmer' or 'Exporter'")]
        public string Role { get; set; } = "Farmer"; // Farmer, Exporter

        [MaxLength(50, ErrorMessage = "District cannot exceed 50 characters")]
        public string? District { get; set; }

        [MaxLength(500, ErrorMessage = "Address cannot exceed 500 characters")]
        public string? Address { get; set; }

        [MaxLength(20, ErrorMessage = "Phone number cannot exceed 20 characters")]
        [RegularExpression(@"^[\d\s\+\-\(\)]+$", ErrorMessage = "Phone number can only contain digits, spaces, +, -, (, )")]
        public string? PhoneNumber { get; set; }

        [MaxLength(200, ErrorMessage = "Company name cannot exceed 200 characters")]
        public string? CompanyName { get; set; } // For exporters

        public IFormFile? FarmerIdProof { get; set; } // For farmers - file upload
    }
}
