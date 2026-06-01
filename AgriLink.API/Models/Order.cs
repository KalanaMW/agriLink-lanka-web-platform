using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriLink.API.Models
{
    public class Order
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string OrderNumber { get; set; } = string.Empty;

        [Required]
        public int ExporterId { get; set; }

        [ForeignKey("ExporterId")]
        public User Exporter { get; set; } = null!;

        [Required]
        [Column(TypeName = "decimal(12,2)")]
        public decimal TotalAmount { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Pending"; // Pending, Confirmed, Processing, Shipped, Delivered, Cancelled

        [MaxLength(50)]
        public string PaymentStatus { get; set; } = "Pending"; // Pending, Completed, Failed, Refunded

        public string? PaymentIntentId { get; set; } // Stripe payment intent ID

        public string? ShippingAddress { get; set; }

        [MaxLength(50)]
        public string? ShippingMethod { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal? ShippingCost { get; set; }

        public string? TrackingNumber { get; set; }

        public DateTime? ShippedDate { get; set; }

        public DateTime? DeliveredDate { get; set; }

        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public Transaction? Transaction { get; set; }
    }
}
