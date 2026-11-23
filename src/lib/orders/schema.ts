import { z } from "zod";

export const createOrderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
});

export const createOrderSchema = z
  .object({
    shippingAddress: z.string().trim().min(10).max(500),
    items: z.array(createOrderItemSchema).min(1).max(20),
  })
  .superRefine((value, ctx) => {
    const seen = new Set<string>();
    value.items.forEach((item, index) => {
      if (seen.has(item.productId)) {
        ctx.addIssue({
          code: "custom",
          path: ["items", index, "productId"],
          message: "Duplicate product lines are not allowed.",
        });
      }
      seen.add(item.productId);
    });
  });

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const orderNumberSchema = z.string().regex(/^ORD-\d{4}-\d{6}$/, {
  message: "Order number must look like ORD-2026-000042.",
});
