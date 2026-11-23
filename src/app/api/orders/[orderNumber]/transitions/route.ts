import { NextResponse } from "next/server";
import { z } from "zod";

import { ORDER_STATUSES } from "@/lib/orders/status";
import { handleApiError, invalidJsonResponse, validationErrorResponse } from "@/lib/api/errors";
import { requireRole } from "@/lib/auth/guards";
import { orderNumberSchema } from "@/lib/orders/schema";
import { transitionOrderForSupplier } from "@/lib/orders/service";

const transitionSchema = z.object({
  toStatus: z.enum(ORDER_STATUSES),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  try {
    const session = await requireRole("supplier");
    const { orderNumber } = await params;

    const parsedOrderNumber = orderNumberSchema.safeParse(orderNumber);
    if (!parsedOrderNumber.success) {
      return validationErrorResponse("Invalid order number.", parsedOrderNumber.error);
    }

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return invalidJsonResponse();
    }

    const parsedBody = transitionSchema.safeParse(payload);
    if (!parsedBody.success) {
      return validationErrorResponse("Invalid transition payload.", parsedBody.error);
    }

    const result = await transitionOrderForSupplier({
      orderNumber: parsedOrderNumber.data,
      toStatus: parsedBody.data.toStatus,
      session,
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
