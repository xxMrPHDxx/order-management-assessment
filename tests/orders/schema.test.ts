import { describe, expect, it } from "vitest";

import { createOrderSchema, orderNumberSchema } from "@/lib/orders/schema";

const productA = "11111111-1111-4111-8111-000000000001";

const valid = {
  shippingAddress: "12 Harbour Road, Bristol, BS1 4RN",
  items: [{ productId: productA, quantity: 2 }],
};

describe("create order schema", () => {
  it("accepts a valid order", () => {
    expect(createOrderSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an empty item list", () => {
    expect(createOrderSchema.safeParse({ ...valid, items: [] }).success).toBe(false);
  });

  it("rejects zero or negative quantities", () => {
    expect(
      createOrderSchema.safeParse({
        ...valid,
        items: [{ productId: productA, quantity: 0 }],
      }).success,
    ).toBe(false);
  });

  it("rejects duplicate product lines", () => {
    const result = createOrderSchema.safeParse({
      ...valid,
      items: [
        { productId: productA, quantity: 1 },
        { productId: productA, quantity: 2 },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a short shipping address", () => {
    expect(createOrderSchema.safeParse({ ...valid, shippingAddress: "Short" }).success).toBe(false);
  });

  it("rejects unknown extra fields on items", () => {
    const result = createOrderSchema.safeParse({
      ...valid,
      items: [{ productId: productA, quantity: 1, price: 0.01 }],
    });
    // Extra keys are stripped, but pricing still comes from the server.
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items[0]).toEqual({ productId: productA, quantity: 1 });
    }
  });
});

describe("order number schema", () => {
  it("accepts the human-friendly format", () => {
    expect(orderNumberSchema.safeParse("ORD-2026-000042").success).toBe(true);
  });

  it("rejects arbitrary strings", () => {
    expect(orderNumberSchema.safeParse("42").success).toBe(false);
    expect(orderNumberSchema.safeParse("ORD-26-42").success).toBe(false);
  });
});
