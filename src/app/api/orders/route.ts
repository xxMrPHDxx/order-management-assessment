import { NextResponse } from "next/server";

import { handleApiError, invalidJsonResponse, validationErrorResponse } from "@/lib/api/errors";
import { requireRole } from "@/lib/auth/guards";
import { createOrderSchema } from "@/lib/orders/schema";
import {
  createOrderForCustomer,
  listCustomerOrders,
  serializeOrderSummary,
} from "@/lib/orders/service";

export async function GET() {
  try {
    const session = await requireRole("customer");
    const orders = await listCustomerOrders(session.customerId);

    return NextResponse.json({
      data: orders.map((order) => serializeOrderSummary(order)),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole("customer");

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return invalidJsonResponse();
    }

    const parsed = createOrderSchema.safeParse(payload);
    if (!parsed.success) {
      return validationErrorResponse("Invalid order payload.", parsed.error);
    }

    const order = await createOrderForCustomer(session, parsed.data);
    return NextResponse.json(
      {
        data: {
          ...serializeOrderSummary(order),
          itemCount: order.items.length,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
