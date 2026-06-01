using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AgriLink.API.Data;
using AgriLink.API.Models;
using AgriLink.API.DTOs;
using System.Security.Claims;

namespace AgriLink.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly AgriLinkDbContext _context;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(AgriLinkDbContext context, ILogger<OrdersController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // POST: api/orders (Exporter only)
    [HttpPost]
    [Authorize(Roles = "Exporter")]
    public async Task<ActionResult<OrderResponseDto>> CreateOrder([FromBody] CreateOrderDto dto)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var exporter = await _context.Users.FindAsync(userId);
            if (exporter == null || !exporter.IsVerified)
            {
                return BadRequest(new { message = "Your account must be verified to place orders." });
            }

            if (dto.Items == null || dto.Items.Count == 0)
            {
                return BadRequest(new { message = "Order must contain at least one item." });
            }

            var orderItems = new List<OrderItem>();
            decimal totalAmount = 0;

            foreach (var item in dto.Items)
            {
                var product = await _context.Products.Include(p => p.Farmer).FirstOrDefaultAsync(p => p.Id == item.ProductId);
                if (product == null)
                {
                    return BadRequest(new { message = $"Product with ID {item.ProductId} not found." });
                }

                if (product.Status != "Available")
                {
                    return BadRequest(new { message = $"Product '{product.VegetableName}' is not available for ordering." });
                }

                if (item.Quantity > product.AvailableQuantityKg)
                {
                    return BadRequest(new { message = $"Requested quantity ({item.Quantity} kg) exceeds available stock ({product.AvailableQuantityKg} kg) for '{product.VegetableName}'." });
                }

                var subtotal = item.Quantity * product.PricePerKg;
                totalAmount += subtotal;

                orderItems.Add(new OrderItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    PricePerUnit = product.PricePerKg,
                    Subtotal = subtotal
                });

                // Reduce available stock
                product.AvailableQuantityKg -= item.Quantity;
                if (product.AvailableQuantityKg <= 0)
                {
                    product.Status = "OutOfStock";
                    product.AvailableQuantityKg = 0;
                }
                product.UpdatedAt = DateTime.UtcNow;
            }

            var order = new Order
            {
                OrderNumber = GenerateOrderNumber(),
                ExporterId = userId,
                TotalAmount = totalAmount,
                Status = "Pending",
                PaymentStatus = "Pending",
                ShippingAddress = dto.ShippingAddress,
                ShippingMethod = dto.ShippingMethod,
                Notes = dto.Notes,
                OrderItems = orderItems
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Auto-create a transaction record
            var transaction = new Transaction
            {
                OrderId = order.Id,
                TransactionId = $"TXN-{Guid.NewGuid().ToString("N")[..12].ToUpper()}",
                Amount = totalAmount,
                Currency = "LKR",
                PaymentMethod = "BankTransfer",
                Status = "Pending"
            };
            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            var response = await GetOrderResponseDto(order.Id);
            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating order");
            return BadRequest(new { message = "Failed to create order", error = ex.Message });
        }
    }

    // GET: api/orders (Role-dependent listing)
    [HttpGet]
    public async Task<ActionResult<List<OrderResponseDto>>> GetOrders()
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            IQueryable<Order> query = _context.Orders
                .Include(o => o.Exporter)
                .Include(o => o.OrderItems).ThenInclude(oi => oi.Product).ThenInclude(p => p.Farmer)
                .Include(o => o.Transaction);

            if (role == "Exporter")
            {
                query = query.Where(o => o.ExporterId == userId);
            }
            else if (role == "Farmer")
            {
                // Farmers see orders that contain their products
                query = query.Where(o => o.OrderItems.Any(oi => oi.Product.FarmerId == userId));
            }
            // Admin sees all orders

            var orders = await query.OrderByDescending(o => o.CreatedAt).ToListAsync();
            var response = orders.Select(MapToResponseDto).ToList();

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching orders");
            return BadRequest(new { message = "Failed to fetch orders", error = ex.Message });
        }
    }

    // GET: api/orders/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<OrderResponseDto>> GetOrder(int id)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            var order = await _context.Orders
                .Include(o => o.Exporter)
                .Include(o => o.OrderItems).ThenInclude(oi => oi.Product).ThenInclude(p => p.Farmer)
                .Include(o => o.Transaction)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound(new { message = "Order not found" });
            }

            // Check access
            if (role == "Exporter" && order.ExporterId != userId)
            {
                return Forbid();
            }
            if (role == "Farmer" && !order.OrderItems.Any(oi => oi.Product.FarmerId == userId))
            {
                return Forbid();
            }

            return Ok(MapToResponseDto(order));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching order");
            return BadRequest(new { message = "Failed to fetch order", error = ex.Message });
        }
    }

    // PUT: api/orders/{id}/status (Admin or Farmer can update status)
    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin,Farmer")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto dto)
    {
        try
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
                .Include(o => o.Transaction)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound(new { message = "Order not found" });
            }

            // Validate status transitions
            var validTransitions = new Dictionary<string, string[]>
            {
                ["Pending"] = new[] { "Confirmed", "Cancelled" },
                ["Confirmed"] = new[] { "Processing", "Cancelled" },
                ["Processing"] = new[] { "Shipped", "Cancelled" },
                ["Shipped"] = new[] { "Delivered" },
                ["Delivered"] = Array.Empty<string>(),
                ["Cancelled"] = Array.Empty<string>()
            };

            if (!validTransitions.ContainsKey(order.Status) || !validTransitions[order.Status].Contains(dto.Status))
            {
                return BadRequest(new { message = $"Cannot transition from '{order.Status}' to '{dto.Status}'." });
            }

            order.Status = dto.Status;
            order.UpdatedAt = DateTime.UtcNow;

            if (!string.IsNullOrEmpty(dto.TrackingNumber))
                order.TrackingNumber = dto.TrackingNumber;

            if (!string.IsNullOrEmpty(dto.Notes))
                order.Notes = dto.Notes;

            // Handle status-specific updates
            if (dto.Status == "Shipped")
            {
                order.ShippedDate = DateTime.UtcNow;
            }
            else if (dto.Status == "Delivered")
            {
                order.DeliveredDate = DateTime.UtcNow;
                order.PaymentStatus = "Completed";

                // Update transaction
                if (order.Transaction != null)
                {
                    order.Transaction.Status = "Completed";
                    order.Transaction.CompletedAt = DateTime.UtcNow;
                }

                // Mark products as Sold if fully consumed
                foreach (var item in order.OrderItems)
                {
                    if (item.Product.AvailableQuantityKg <= 0)
                    {
                        item.Product.Status = "Sold";
                    }
                }
            }
            else if (dto.Status == "Cancelled")
            {
                order.PaymentStatus = "Refunded";

                // Restore stock
                foreach (var item in order.OrderItems)
                {
                    item.Product.AvailableQuantityKg += item.Quantity;
                    if (item.Product.Status == "OutOfStock")
                    {
                        item.Product.Status = "Available";
                    }
                    item.Product.UpdatedAt = DateTime.UtcNow;
                }

                // Update transaction
                if (order.Transaction != null)
                {
                    order.Transaction.Status = "Refunded";
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = $"Order status updated to '{dto.Status}'" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating order status");
            return BadRequest(new { message = "Failed to update order status", error = ex.Message });
        }
    }

    // PUT: api/orders/{id}/confirm-payment (Exporter confirms payment)
    [HttpPut("{id}/confirm-payment")]
    [Authorize(Roles = "Exporter")]
    public async Task<IActionResult> ConfirmPayment(int id)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var order = await _context.Orders
                .Include(o => o.Transaction)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
                return NotFound(new { message = "Order not found" });

            if (order.ExporterId != userId)
                return Forbid();

            if (order.PaymentStatus != "Pending")
                return BadRequest(new { message = "Payment has already been processed." });

            // Payment can only be confirmed after farmer accepts the order
            var allowedStatuses = new[] { "Confirmed", "Processing", "Shipped" };
            if (!allowedStatuses.Contains(order.Status))
                return BadRequest(new { message = "Payment can only be confirmed after the farmer has accepted the order." });

            order.PaymentStatus = "Completed";
            order.UpdatedAt = DateTime.UtcNow;

            if (order.Transaction != null)
            {
                order.Transaction.Status = "Completed";
                order.Transaction.CompletedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Payment confirmed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error confirming payment");
            return BadRequest(new { message = "Failed to confirm payment", error = ex.Message });
        }
    }

    // DELETE: api/orders/{id} (Exporter can cancel own pending orders)
    [HttpDelete("{id}")]
    [Authorize(Roles = "Exporter,Admin")]
    public async Task<IActionResult> CancelOrder(int id)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            var order = await _context.Orders
                .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
                .Include(o => o.Transaction)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
                return NotFound(new { message = "Order not found" });

            if (role == "Exporter" && order.ExporterId != userId)
                return Forbid();

            // Exporter can only cancel Pending orders; Admin can cancel Pending or Confirmed
            if (role == "Exporter" && order.Status != "Pending")
                return BadRequest(new { message = "You can only cancel orders before the farmer accepts them." });

            if (role == "Admin" && order.Status != "Pending" && order.Status != "Confirmed")
                return BadRequest(new { message = "Only pending or confirmed orders can be cancelled." });

            // Restore stock
            foreach (var item in order.OrderItems)
            {
                item.Product.AvailableQuantityKg += item.Quantity;
                if (item.Product.Status == "OutOfStock")
                {
                    item.Product.Status = "Available";
                }
                item.Product.UpdatedAt = DateTime.UtcNow;
            }

            order.Status = "Cancelled";
            order.PaymentStatus = "Refunded";
            order.UpdatedAt = DateTime.UtcNow;

            if (order.Transaction != null)
            {
                order.Transaction.Status = "Refunded";
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Order cancelled successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling order");
            return BadRequest(new { message = "Failed to cancel order", error = ex.Message });
        }
    }

    // Helper: Get full order response DTO
    private async Task<OrderResponseDto?> GetOrderResponseDto(int orderId)
    {
        var order = await _context.Orders
            .Include(o => o.Exporter)
            .Include(o => o.OrderItems).ThenInclude(oi => oi.Product).ThenInclude(p => p.Farmer)
            .Include(o => o.Transaction)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        return order == null ? null : MapToResponseDto(order);
    }

    // Helper: Map Order to response DTO
    private static OrderResponseDto MapToResponseDto(Order order)
    {
        return new OrderResponseDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            ExporterId = order.ExporterId,
            ExporterName = order.Exporter?.FullName ?? "",
            ExporterEmail = order.Exporter?.Email ?? "",
            TotalAmount = order.TotalAmount,
            Status = order.Status,
            PaymentStatus = order.PaymentStatus,
            ShippingAddress = order.ShippingAddress,
            ShippingMethod = order.ShippingMethod,
            ShippingCost = order.ShippingCost,
            TrackingNumber = order.TrackingNumber,
            ShippedDate = order.ShippedDate,
            DeliveredDate = order.DeliveredDate,
            Notes = order.Notes,
            CreatedAt = order.CreatedAt,
            UpdatedAt = order.UpdatedAt,
            Items = order.OrderItems.Select(oi => new OrderItemResponseDto
            {
                Id = oi.Id,
                ProductId = oi.ProductId,
                VegetableName = oi.Product?.VegetableName ?? "",
                Grade = oi.Product?.Grade ?? "",
                District = oi.Product?.District ?? "",
                ImageUrl = oi.Product?.ImageUrl,
                FarmerName = oi.Product?.Farmer?.FullName ?? "",
                Quantity = oi.Quantity,
                PricePerUnit = oi.PricePerUnit,
                Subtotal = oi.Subtotal
            }).ToList(),
            Transaction = order.Transaction != null ? new TransactionResponseDto
            {
                Id = order.Transaction.Id,
                TransactionId = order.Transaction.TransactionId,
                Amount = order.Transaction.Amount,
                Currency = order.Transaction.Currency,
                PaymentMethod = order.Transaction.PaymentMethod,
                Status = order.Transaction.Status,
                CreatedAt = order.Transaction.CreatedAt,
                CompletedAt = order.Transaction.CompletedAt
            } : null
        };
    }

    // Helper: Generate unique order number
    private static string GenerateOrderNumber()
    {
        return $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
    }
}
