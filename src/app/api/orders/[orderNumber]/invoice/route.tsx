import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";

import { handleApiError, jsonError } from "@/lib/api/errors";
import { requireSession } from "@/lib/auth/guards";
import { env } from "@/lib/env";
import { InvoiceDocument } from "@/lib/orders/invoice-document";
import { OrderError } from "@/lib/orders/errors";
import { orderNumberSchema } from "@/lib/orders/schema";
import { getOrderForViewer } from "@/lib/orders/service";
import { canDownloadInvoice, invoiceNumberFor } from "@/lib/orders/status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  try {
    const session = await requireSession();
    const { orderNumber } = await params;

    const parsed = orderNumberSchema.safeParse(orderNumber);
    if (!parsed.success) {
      return jsonError(400, "INVALID_ORDER_NUMBER", "Invalid order number.");
    }

    const order = await getOrderForViewer(parsed.data, session);
    if (!order) {
      return jsonError(404, "ORDER_NOT_FOUND", "Order not found.");
    }

    if (!canDownloadInvoice(order.status)) {
      throw new OrderError(
        409,
        "INVOICE_NOT_AVAILABLE",
        "Invoices are available once the supplier has accepted the order.",
      );
    }

    const invoiceNumber = invoiceNumberFor(order.orderNumber);
    const pdf = await renderToBuffer(
      <InvoiceDocument
        orderNumber={order.orderNumber}
        invoiceNumber={invoiceNumber}
        issueDate={new Date()}
        orderDate={order.createdAt}
        currency={env.CURRENCY}
        customer={{ name: order.customer.name }}
        shippingAddress={order.shippingAddress}
        items={order.items.map((item) => ({
          name: item.product.name,
          sku: item.product.sku,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toFixed(2),
          lineTotal: item.lineTotal.toFixed(2),
        }))}
        subtotal={order.subtotal.toFixed(2)}
        grandTotal={order.grandTotal.toFixed(2)}
      />,
    );

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoiceNumber}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
