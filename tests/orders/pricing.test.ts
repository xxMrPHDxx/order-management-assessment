import { describe, expect, it } from "vitest";

import { fromCents, priceOrderLines, toCents } from "@/lib/orders/pricing";

const catalog = [
  { id: "11111111-1111-4111-8111-000000000001", unitPrice: "24.50" },
  { id: "11111111-1111-4111-8111-000000000002", unitPrice: "19.99" },
];

describe("order pricing", () => {
  it("converts money strings to integer cents", () => {
    expect(toCents("24.50")).toBe(2450);
    expect(toCents("19.99")).toBe(1999);
    expect(fromCents(5997)).toBe("59.97");
  });

  it("prices lines and sums the subtotal", () => {
    const { lines, subtotalCents } = priceOrderLines(
      [
        { productId: catalog[0]!.id, quantity: 2 },
        { productId: catalog[1]!.id, quantity: 3 },
      ],
      catalog,
    );

    expect(lines).toEqual([
      expect.objectContaining({ quantity: 2, unitPrice: "24.50", lineTotal: "49.00" }),
      expect.objectContaining({ quantity: 3, unitPrice: "19.99", lineTotal: "59.97" }),
    ]);
    expect(subtotalCents).toBe(4900 + 5997);
  });

  it("rejects an unknown product price", () => {
    expect(() =>
      priceOrderLines(
        [{ productId: "11111111-1111-4111-8111-000000000099", quantity: 1 }],
        catalog,
      ),
    ).toThrow(/Missing price/);
  });
});
