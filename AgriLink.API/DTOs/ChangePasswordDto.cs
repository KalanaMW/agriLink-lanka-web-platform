using System.ComponentModel.DataAnnotations;

namespace AgriLink.API.DTOs;

public class ChangePasswordDto
{
    [Required(ErrorMessage = "Current password is required")]
    [MaxLength(200)]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "New password is required")]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters long")]
    [MaxLength(200, ErrorMessage = "Password cannot exceed 200 characters")]
    public string NewPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "Confirm password is required")]
    [MaxLength(200)]
    [Compare("NewPassword", ErrorMessage = "New password and confirmation do not match")]
    public string ConfirmPassword { get; set; } = string.Empty;
}
