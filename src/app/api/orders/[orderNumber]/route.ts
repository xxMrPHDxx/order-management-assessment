import { NextResponse } from "next/server";

import { handleApiError, jsonError } from "@/lib/api/errors";
import { requireSession } from "@/lib/auth/guards";
import { orderNumberSchema } from "@/lib/orders/schema";
import { getOrderForViewer, serializeOrderDetail } from "@/lib/orders/service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  try {
    const session = await requireSession();
    const { orderNumber } = await params;

    const parsed = orderNumberSchema.safeParse(orderNumber);
    if (!parsed.success) {
      return jsonError(
        400,
        "INVALID_ORDER_NUMBER",
        parsed.error.issues[0]?.message ?? "Invalid order number.",
      );
    }

    const order = await getOrderForViewer(parsed.data, session);
    if (!order) {
      return jsonError(404, "ORDER_NOT_FOUND", "Order not found.");
    }

    return NextResponse.json({ data: serializeOrderDetail(order) });
  } catch (error) {
    return handleApiError(error);
  }
}
