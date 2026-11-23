import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api/errors";
import { requireRole } from "@/lib/auth/guards";
import { listActiveProducts } from "@/lib/orders/service";

export async function GET() {
  try {
    await requireRole("customer");
    const products = await listActiveProducts();

    return NextResponse.json({
      data: products.map((product) => ({
        id: product.id,
        sku: product.sku,
        name: product.name,
        unitPrice: product.unitPrice.toFixed(2),
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
