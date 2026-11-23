export type CatalogPrice = {
  id: string;
  unitPrice: string;
};

export type PricedLine = {
  productId: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  lineCents: number;
};

export function toCents(value: string): number {
  return Math.round(Number.parseFloat(value) * 100);
}

export function fromCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function priceOrderLines(
  items: Array<{ productId: string; quantity: number }>,
  catalog: CatalogPrice[],
): { lines: PricedLine[]; subtotalCents: number } {
  const priceById = new Map(catalog.map((product) => [product.id, product.unitPrice]));

  const lines = items.map((item) => {
    const unitPrice = priceById.get(item.productId);
    if (unitPrice === undefined) {
      throw new Error(`Missing price for product ${item.productId}`);
    }

    const unitCents = toCents(unitPrice);
    const lineCents = unitCents * item.quantity;

    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: fromCents(unitCents),
      lineTotal: fromCents(lineCents),
      lineCents,
    };
  });

  return {
    lines,
    subtotalCents: lines.reduce((total, line) => total + line.lineCents, 0),
  };
}
