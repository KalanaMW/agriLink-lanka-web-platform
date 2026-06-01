using AgriLink.API.Data;
using AgriLink.API.Models;
using Microsoft.EntityFrameworkCore;

namespace AgriLink.API.Services
{
    public class DatabaseSeeder
    {
        private readonly AgriLinkDbContext _context;
        private readonly IAuthService _authService;

        public DatabaseSeeder(AgriLinkDbContext context, IAuthService authService)
        {
            _context = context;
            _authService = authService;
        }

        public async Task SeedAsync()
        {
            // Check if users already exist
            if (await _context.Users.AnyAsync())
            {
                Console.WriteLine("Database already seeded. Skipping...");
                return;
            }

            Console.WriteLine("Seeding database with sample users...");

            // Create Admin User
            var admin = new User
            {
                FullName = "Admin User",
                Email = "admin@agrilink.lk",
                PasswordHash = _authService.HashPassword("admin123"),
                Role = "Admin",
                District = "Colombo",
                Address = "123 Admin Street, Colombo",
                PhoneNumber = "+94771234567",
                IsVerified = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            // Create Sample Farmer
            var farmer = new User
            {
                FullName = "Kalana Farmer",
                Email = "farmer@agrilink.lk",
                PasswordHash = _authService.HashPassword("farmer123"),
                Role = "Farmer",
                District = "Kandy",
                Address = "456 Farm Road, Kandy",
                PhoneNumber = "+94772345678",
                FarmerIdProofUrl = "https://example.com/farmer-id.pdf",
                IsVerified = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            // Create Sample Exporter (Keells)
            var exporter1 = new User
            {
                FullName = "John Exporter",
                Email = "exporter@keells.com",
                PasswordHash = _authService.HashPassword("exporter123"),
                Role = "Exporter",
                CompanyName = "Keells Super",
                District = "Colombo",
                Address = "789 Export Lane, Colombo",
                PhoneNumber = "+94773456789",
                IsVerified = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            // Create Sample Exporter (Cargills) - Unverified
            var exporter2 = new User
            {
                FullName = "Sarah Exporter",
                Email = "exporter@cargills.com",
                PasswordHash = _authService.HashPassword("exporter123"),
                Role = "Exporter",
                CompanyName = "Cargills Food City",
                District = "Gampaha",
                Address = "321 Trade Street, Gampaha",
                PhoneNumber = "+94774567890",
                IsVerified = false, // Needs admin approval
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.AddRange(admin, farmer, exporter1, exporter2);
            await _context.SaveChangesAsync();

            Console.WriteLine("✅ Database seeded successfully!");
            Console.WriteLine("\n📝 Sample User Credentials:");
            Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            Console.WriteLine("Admin:");
            Console.WriteLine($"  Email: admin@agrilink.lk");
            Console.WriteLine($"  Password: admin123");
            Console.WriteLine("\nFarmer:");
            Console.WriteLine($"  Email: farmer@agrilink.lk");
            Console.WriteLine($"  Password: farmer123");
            Console.WriteLine("\nExporter (Keells - Verified):");
            Console.WriteLine($"  Email: exporter@keells.com");
            Console.WriteLine($"  Password: exporter123");
            Console.WriteLine("\nExporter (Cargills - Unverified):");
            Console.WriteLine($"  Email: exporter@cargills.com");
            Console.WriteLine($"  Password: exporter123");
            Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        }
    }
}
