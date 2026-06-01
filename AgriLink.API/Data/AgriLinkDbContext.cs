using Microsoft.EntityFrameworkCore;
using AgriLink.API.Models;

namespace AgriLink.API.Data
{
    public class AgriLinkDbContext : DbContext
    {
        public AgriLinkDbContext(DbContextOptions<AgriLinkDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Transaction> Transactions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User entity configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Role).HasDefaultValue("Farmer");
                entity.Property(e => e.IsVerified).HasDefaultValue(false);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            // Product entity configuration
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasIndex(e => e.FarmerId);
                entity.Property(e => e.Status).HasDefaultValue("Available");
                entity.Property(e => e.IsExportReady).HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                
                entity.HasOne(p => p.Farmer)
                    .WithMany(u => u.Products)
                    .HasForeignKey(p => p.FarmerId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Order entity configuration
            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasIndex(e => e.OrderNumber).IsUnique();
                entity.HasIndex(e => e.ExporterId);
                entity.Property(e => e.Status).HasDefaultValue("Pending");
                entity.Property(e => e.PaymentStatus).HasDefaultValue("Pending");
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                
                entity.HasOne(o => o.Exporter)
                    .WithMany(u => u.OrdersAsExporter)
                    .HasForeignKey(o => o.ExporterId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // OrderItem entity configuration
            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.HasIndex(e => e.OrderId);
                entity.HasIndex(e => e.ProductId);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                
                entity.HasOne(oi => oi.Order)
                    .WithMany(o => o.OrderItems)
                    .HasForeignKey(oi => oi.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);
                    
                entity.HasOne(oi => oi.Product)
                    .WithMany(p => p.OrderItems)
                    .HasForeignKey(oi => oi.ProductId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Transaction entity configuration
            modelBuilder.Entity<Transaction>(entity =>
            {
                entity.HasIndex(e => e.OrderId).IsUnique();
                entity.HasIndex(e => e.TransactionId).IsUnique();
                entity.Property(e => e.Status).HasDefaultValue("Pending");
                entity.Property(e => e.Currency).HasDefaultValue("USD");
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                
                entity.HasOne(t => t.Order)
                    .WithOne(o => o.Transaction)
                    .HasForeignKey<Transaction>(t => t.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
