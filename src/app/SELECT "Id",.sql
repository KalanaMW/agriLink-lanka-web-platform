SELECT "Id",
       "OrderId",
       "ProductId",
       "Quantity",
       "PricePerUnit",
       "Subtotal",
       "CreatedAt"
FROM public."OrderItems"
LIMIT 1000;