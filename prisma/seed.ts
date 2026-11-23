import "dotenv/config";

import { createPrismaClient } from "../src/lib/db/client";
import { ActorRole, type OrderStatus } from "../src/generated/prisma/enums";

/**
 * Deterministic seed data.
 *
 * Stable UUIDs and day offsets keep screenshots, demos, and tests repeatable.
 * Order numbers are allocated through the database function so the same
 * sequence is used by the application at runtime.
 *
 * Usage:
 *   npm run db:seed             # create missing records, keep existing history
 *   npm run db:seed -- --force  # truncate orders, lines, and history, then reseed
 */

const ANCHOR_DAYS_AGO = 2;
const SUPPLIER_ACTOR = "Sam Patel";

const customers = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Acme Logistics Ltd",
    email: "procurement@acme.example",
    shippingAddress: "12 Harbour Road, Bristol, BS1 4RN, United Kingdom",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Northwind Traders",
    email: "orders@northwind.example",
    shippingAddress: "88 King Street, Manchester, M2 4WQ, United Kingdom",
  },
] as const;

const products = [
  {
    id: "33333333-3333-4333-8333-000000000001",
    sku: "OF-1001",
    name: "A4 Copy Paper (Box of 5 Reams)",
    unitPrice: "24.50",
  },
  {
    id: "33333333-3333-4333-8333-000000000002",
    sku: "OF-1002",
    name: "Ballpoint Pens (Box of 50)",
    unitPrice: "12.00",
  },
  {
    id: "33333333-3333-4333-8333-000000000003",
    sku: "OF-1003",
    name: "Laser Printer Toner (Black)",
    unitPrice: "89.90",
  },
  {
    id: "33333333-3333-4333-8333-000000000004",
    sku: "OF-1004",
    name: "Ergonomic Office Chair",
    unitPrice: "249.00",
  },
  {
    id: "33333333-3333-4333-8333-000000000005",
    sku: "OF-1005",
    name: "Height-Adjustable Standing Desk",
    unitPrice: "399.00",
  },
  {
    id: "33333333-3333-4333-8333-000000000006",
    sku: "OF-1006",
    name: "Whiteboard Marker Set (12 Colours)",
    unitPrice: "8.75",
  },
  {
    id: "33333333-3333-4333-8333-000000000007",
    sku: "OF-1007",
    name: "USB-C Docking Station",
    unitPrice: "129.99",
  },
  {
    id: "33333333-3333-4333-8333-000000000008",
    sku: "OF-1008",
    name: "Noise-Cancelling Headset",
    unitPrice: "159.00",
  },
  {
    id: "33333333-3333-4333-8333-000000000009",
    sku: "OF-1009",
    name: "Filing Cabinet (3 Drawers)",
    unitPrice: "189.50",
  },
  {
    id: "33333333-3333-4333-8333-000000000010",
    sku: "OF-1010",
    name: "Aluminium Laptop Stand",
    unitPrice: "45.00",
  },
] as const;

type StatusGroup = {
  status: OrderStatus;
  count: number;
  firstDayOffset: number;
  stepDays: number;
};

const statusGroups: StatusGroup[] = [
  { status: "PENDING_SUPPLIER_APPROVAL", count: 8, firstDayOffset: 0, stepDays: 1 },
  { status: "ACCEPTED", count: 5, firstDayOffset: 3, stepDays: 3 },
  { status: "DISPATCHED", count: 5, firstDayOffset: 7, stepDays: 4 },
  { status: "IN_TRANSIT", count: 5, firstDayOffset: 11, stepDays: 5 },
  { status: "DELIVERED", count: 9, firstDayOffset: 17, stepDays: 7 },
  { status: "REJECTED", count: 4, firstDayOffset: 4, stepDays: 9 },
];

const orderSpecs = statusGroups.flatMap((group, groupIndex) =>
  Array.from({ length: group.count }, (_, position) => ({
    index: 0,
    status: group.status,
    dayOffset: group.firstDayOffset + position * group.stepDays,
    hour: 8 + ((groupIndex * 3 + position * 5) % 10),
    minute: (position * 11 + groupIndex * 7) % 60,
  })),
);

orderSpecs.forEach((spec, index) => {
  spec.index = index;
});

const orderId = (index: number) => `40000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`;
const itemId = (index: number) => `50000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`;
const historyId = (index: number) =>
  `60000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`;

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

const addHours = (date: Date, hours: number) => {
  const result = new Date(date);
  result.setUTCHours(result.getUTCHours() + hours);
  return result;
};

const toCents = (value: string) => Math.round(Number.parseFloat(value) * 100);
const fromCents = (cents: number) => (cents / 100).toFixed(2);

type HistoryEntry = {
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  actorRole: (typeof ActorRole)[keyof typeof ActorRole];
  actorName: string;
  note: string | null;
  createdAt: Date;
};

function buildHistory(status: OrderStatus, createdAt: Date, customerName: string): HistoryEntry[] {
  const entries: HistoryEntry[] = [
    {
      fromStatus: null,
      toStatus: "PENDING_SUPPLIER_APPROVAL",
      actorRole: ActorRole.CUSTOMER,
      actorName: customerName,
      note: "Order placed",
      createdAt,
    },
  ];

  const push = (
    fromStatus: OrderStatus,
    toStatus: OrderStatus,
    at: Date,
    note: string | null = null,
  ) => {
    entries.push({
      fromStatus,
      toStatus,
      actorRole: ActorRole.SUPPLIER,
      actorName: SUPPLIER_ACTOR,
      note,
      createdAt: at,
    });
  };

  const acceptedAt = addHours(createdAt, 4);

  switch (status) {
    case "PENDING_SUPPLIER_APPROVAL":
      break;
    case "REJECTED":
      push("PENDING_SUPPLIER_APPROVAL", "REJECTED", addHours(createdAt, 2), "Items out of stock");
      break;
    case "ACCEPTED":
      push("PENDING_SUPPLIER_APPROVAL", "ACCEPTED", acceptedAt);
      break;
    case "DISPATCHED":
      push("PENDING_SUPPLIER_APPROVAL", "ACCEPTED", acceptedAt);
      push("ACCEPTED", "DISPATCHED", addDays(acceptedAt, 1));
      break;
    case "IN_TRANSIT":
      push("PENDING_SUPPLIER_APPROVAL", "ACCEPTED", acceptedAt);
      push("ACCEPTED", "DISPATCHED", addDays(acceptedAt, 1));
      push("DISPATCHED", "IN_TRANSIT", addDays(acceptedAt, 2));
      break;
    case "DELIVERED":
      push("PENDING_SUPPLIER_APPROVAL", "ACCEPTED", acceptedAt);
      push("ACCEPTED", "DISPATCHED", addDays(acceptedAt, 1));
      push("DISPATCHED", "IN_TRANSIT", addDays(acceptedAt, 2));
      push("IN_TRANSIT", "DELIVERED", addDays(acceptedAt, 4));
      break;
  }

  return entries;
}

async function seedCatalogAndCustomers(
  prisma: ReturnType<typeof createPrismaClient>,
  options: { force: boolean },
) {
  for (const customer of customers) {
    await prisma.customer.upsert({
      where: { id: customer.id },
      update: {
        name: customer.name,
        email: customer.email,
        shippingAddress: customer.shippingAddress,
      },
      create: customer,
    });
  }

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        sku: product.sku,
        name: product.name,
        unitPrice: product.unitPrice,
        active: true,
      },
      create: { ...product, active: true },
    });
  }

  if (options.force) {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "order_status_history", "order_items", "orders" CASCADE',
    );
    await prisma.$executeRawUnsafe('ALTER SEQUENCE "order_number_seq" RESTART WITH 1');
  }
}

async function seedOrders(prisma: ReturnType<typeof createPrismaClient>) {
  const anchor = new Date();
  anchor.setUTCHours(0, 0, 0, 0);
  anchor.setUTCDate(anchor.getUTCDate() - ANCHOR_DAYS_AGO);

  let itemCounter = 0;
  let historyCounter = 0;

  await prisma.$transaction(
    async (tx) => {
      for (const spec of orderSpecs) {
        const id = orderId(spec.index);
        const customer = customers[spec.index % customers.length];
        if (!customer) {
          throw new Error(`Missing customer for order index ${spec.index}`);
        }

        const createdAt = new Date(anchor);
        createdAt.setUTCDate(createdAt.getUTCDate() - spec.dayOffset);
        createdAt.setUTCHours(spec.hour, spec.minute, 0, 0);

        const existing = await tx.order.findUnique({ where: { id } });

        let orderNumber = existing?.orderNumber;
        if (!orderNumber) {
          const rows = await tx.$queryRaw<{ n: string }[]>`SELECT next_order_number() AS n`;
          orderNumber = rows[0]?.n;
        }
        if (!orderNumber) {
          throw new Error("Could not allocate an order number");
        }

        const itemCount = 2 + (spec.index % 2);
        const lines = Array.from({ length: itemCount }, (_, position) => {
          const product = products[(spec.index * 3 + position * 4) % products.length];
          if (!product) {
            throw new Error(`Missing product for order index ${spec.index}`);
          }

          const quantity = 1 + ((spec.index + position) % 3);
          const unitCents = toCents(product.unitPrice);
          const lineCents = unitCents * quantity;

          return {
            id: itemId(itemCounter++),
            productId: product.id,
            quantity,
            unitPrice: fromCents(unitCents),
            lineTotal: fromCents(lineCents),
            lineCents,
          };
        });

        const subtotalCents = lines.reduce((total, line) => total + line.lineCents, 0);
        const subtotal = fromCents(subtotalCents);

        const orderData = {
          customerId: customer.id,
          status: spec.status,
          shippingAddress: customer.shippingAddress,
          subtotal,
          grandTotal: subtotal,
          createdAt,
        };

        if (existing) {
          await tx.order.update({ where: { id }, data: orderData });
        } else {
          await tx.order.create({
            data: { id, orderNumber, ...orderData },
          });
        }

        await tx.orderItem.deleteMany({ where: { orderId: id } });
        await tx.orderItem.createMany({
          data: lines.map((line) => ({
            id: line.id,
            orderId: id,
            productId: line.productId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            lineTotal: line.lineTotal,
          })),
        });

        const historyCount = await tx.orderStatusHistory.count({ where: { orderId: id } });
        if (historyCount === 0) {
          const history = buildHistory(spec.status, createdAt, customer.name);
          await tx.orderStatusHistory.createMany({
            data: history.map((entry) => ({
              id: historyId(historyCounter++),
              orderId: id,
              ...entry,
            })),
          });
        }
      }
    },
    { timeout: 60_000 },
  );
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to run the seed script in production.");
  }

  const force = process.argv.includes("--force");
  const prisma = createPrismaClient(process.env.DATABASE_URL);

  try {
    await seedCatalogAndCustomers(prisma, { force });
    await seedOrders(prisma);

    const counts = await prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
      orderBy: { status: "asc" },
    });

    console.log(
      `Seeded ${customers.length} customers, ${products.length} products, ${orderSpecs.length} orders.`,
    );
    for (const row of counts) {
      console.log(`  ${row.status}: ${row._count._all}`);
    }
    console.log(force ? "Mode: --force (orders reset)" : "Mode: upsert (existing orders kept)");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
