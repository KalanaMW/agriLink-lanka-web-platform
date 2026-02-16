namespace AgriLink.API.DTOs;

public class UpdateProfileDto
{
    public string? FullName { get; set; }
    public string? District { get; set; }
    public string? Address { get; set; }
    public string? PhoneNumber { get; set; }
    public string? CompanyName { get; set; } // For exporters
    public IFormFile? ProfileImage { get; set; }
}
