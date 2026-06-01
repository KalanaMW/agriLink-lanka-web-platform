using System.ComponentModel.DataAnnotations;

namespace AgriLink.API.DTOs;

public class UpdateProfileDto
{
    [MaxLength(100, ErrorMessage = "Full name cannot exceed 100 characters")]
    public string? FullName { get; set; }

    [MaxLength(50, ErrorMessage = "District cannot exceed 50 characters")]
    public string? District { get; set; }

    [MaxLength(500, ErrorMessage = "Address cannot exceed 500 characters")]
    public string? Address { get; set; }

    [MaxLength(20, ErrorMessage = "Phone number cannot exceed 20 characters")]
    [RegularExpression(@"^[\d\s\+\-\(\)]+$", ErrorMessage = "Phone number can only contain digits, spaces, +, -, (, )")]
    public string? PhoneNumber { get; set; }

    [MaxLength(200, ErrorMessage = "Company name cannot exceed 200 characters")]
    public string? CompanyName { get; set; } // For exporters

    public IFormFile? ProfileImage { get; set; }
}
