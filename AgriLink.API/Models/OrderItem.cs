using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriLink.API.Models
{
    public class OrderItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int OrderId { get; set; }

        [ForeignKey("OrderId")]
        public Order Order { get; set; } = null!;

        [Required]
        public int ProductId { get; set; }

        [ForeignKey("ProductId")]
        public Product Product { get; set; } = null!;

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Quantity { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal PricePerUnit { get; set; }

        [Required]
        [Column(TypeName = "decimal(12,2)")]
        public decimal Subtotal { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
