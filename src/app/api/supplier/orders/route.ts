import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api/errors";
import { requireRole } from "@/lib/auth/guards";
import { parseSupplierFilters } from "@/lib/orders/filters";
import { listSupplierOrders, serializeSupplierOrder } from "@/lib/orders/service";

export async function GET(request: Request) {
  try {
    await requireRole("supplier");

    const url = new URL(request.url);
    const filters = parseSupplierFilters(Object.fromEntries(url.searchParams.entries()));
    const result = await listSupplierOrders(filters);

    return NextResponse.json({
      data: result.orders.map(serializeSupplierOrder),
      meta: {
        page: result.page,
        pageSize: result.pageSize,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        filters: filters.raw,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
