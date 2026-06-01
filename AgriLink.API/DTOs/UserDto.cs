namespace AgriLink.API.DTOs
{
    public class UserDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? District { get; set; }
        public string? Address { get; set; }
        public string? PhoneNumber { get; set; }
        public string? CompanyName { get; set; }
        public bool IsVerified { get; set; }
        public bool IsActive { get; set; }
        public string? ProfileImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
