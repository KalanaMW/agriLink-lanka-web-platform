using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriLink.API.Models
{
    public class Transaction
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int OrderId { get; set; }

        [ForeignKey("OrderId")]
        public Order Order { get; set; } = null!;

        [Required]
        [MaxLength(100)]
        public string TransactionId { get; set; } = string.Empty; // Stripe transaction ID

        [Required]
        [Column(TypeName = "decimal(12,2)")]
        public decimal Amount { get; set; }

        [Required]
        [MaxLength(10)]
        public string Currency { get; set; } = "USD";

        [Required]
        [MaxLength(50)]
        public string PaymentMethod { get; set; } = "Stripe";

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Pending"; // Pending, Completed, Failed, Refunded

        public string? StripePaymentIntentId { get; set; }

        public string? StripeChargeId { get; set; }

        public string? FailureReason { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? CompletedAt { get; set; }
    }
}
