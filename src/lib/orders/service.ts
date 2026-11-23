import "server-only";

import { ActorRole } from "@/generated/prisma/enums";
import type { Session } from "@/lib/auth/session";
import { assertCustomerOwnsOrder } from "@/lib/auth/authorization";
import { prisma } from "@/lib/db/prisma";

import { OrderError } from "./errors";
import { fromCents, priceOrderLines } from "./pricing";
import type { CreateOrderInput } from "./schema";

type CustomerSession = Extract<Session, { role: "customer" }>;

const detailInclude = {
  customer: { select: { id: true, name: true, email: true } },
  items: {
    include: {
      product: { select: { id: true, name: true, sku: true } },
    },
    orderBy: { id: "asc" as const },
  },
  history: {
    orderBy: [{ createdAt: "asc" as const }, { id: "asc" as const }],
  },
};

export async function listActiveProducts() {
  return prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, sku: true, name: true, unitPrice: true },
  });
}

export async function getCustomerProfile(customerId: string) {
  return prisma.customer.findUnique({
    where: { id: customerId },
    select: { id: true, name: true, email: true, shippingAddress: true },
  });
}

export async function listCustomerOrders(customerId: string) {
  return prisma.order.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });
}

export async function getOrderForViewer(orderNumber: string, session: Session) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: detailInclude,
  });

  if (!order) {
    return null;
  }

  assertCustomerOwnsOrder(session, order.customerId);
  return order;
}

export async function createOrderForCustomer(session: CustomerSession, input: CreateOrderInput) {
  const productIds = input.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
  });

  const availableIds = new Set(products.map((product) => product.id));
  const missing = productIds.filter((id) => !availableIds.has(id));
  if (missing.length > 0) {
    throw new OrderError(400, "UNKNOWN_PRODUCT", "One or more products are unavailable.");
  }

  const { lines, subtotalCents } = priceOrderLines(
    input.items,
    products.map((product) => ({
      id: product.id,
      unitPrice: product.unitPrice.toFixed(2),
    })),
  );
  const subtotal = fromCents(subtotalCents);

  return prisma.$transaction(
    async (tx) => {
      const rows = await tx.$queryRaw<{ n: string }[]>`
        SELECT next_order_number() AS n
      `;
      const orderNumber = rows[0]?.n;
      if (!orderNumber) {
        throw new OrderError(409, "INVALID_ORDER", "Could not allocate an order number.");
      }

      return tx.order.create({
        data: {
          orderNumber,
          customerId: session.customerId,
          status: "PENDING_SUPPLIER_APPROVAL",
          shippingAddress: input.shippingAddress,
          subtotal,
          grandTotal: subtotal,
          items: {
            create: lines.map((line) => ({
              productId: line.productId,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              lineTotal: line.lineTotal,
            })),
          },
          history: {
            create: {
              fromStatus: null,
              toStatus: "PENDING_SUPPLIER_APPROVAL",
              actorRole: ActorRole.CUSTOMER,
              actorName: session.name,
              note: "Order placed",
            },
          },
        },
        include: detailInclude,
      });
    },
    { timeout: 15_000 },
  );
}

export type OrderWithDetail = Awaited<ReturnType<typeof getOrderForViewer>>;

export function serializeOrderSummary(order: {
  orderNumber: string;
  status: string;
  subtotal: { toFixed(digits: number): string };
  grandTotal: { toFixed(digits: number): string };
  createdAt: Date;
  _count?: { items: number };
}) {
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    subtotal: order.subtotal.toFixed(2),
    grandTotal: order.grandTotal.toFixed(2),
    itemCount: order._count?.items ?? 0,
    createdAt: order.createdAt.toISOString(),
  };
}

export function serializeOrderDetail(order: NonNullable<OrderWithDetail>) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    shippingAddress: order.shippingAddress,
    subtotal: order.subtotal.toFixed(2),
    grandTotal: order.grandTotal.toFixed(2),
    createdAt: order.createdAt.toISOString(),
    customer: order.customer,
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toFixed(2),
      lineTotal: item.lineTotal.toFixed(2),
      product: item.product,
    })),
    history: order.history.map((entry) => ({
      id: entry.id,
      fromStatus: entry.fromStatus,
      toStatus: entry.toStatus,
      actorRole: entry.actorRole,
      actorName: entry.actorName,
      note: entry.note,
      createdAt: entry.createdAt.toISOString(),
    })),
  };
}
