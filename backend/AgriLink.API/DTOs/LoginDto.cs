using System.ComponentModel.DataAnnotations;

namespace AgriLink.API.DTOs
{
    public class LoginDto
    {
        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Password { get; set; } = string.Empty;
    }
}
