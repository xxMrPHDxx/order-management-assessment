import "dotenv/config";

import { createPrismaClient } from "../src/lib/db/client";

/**
 * Seed data is deterministic: stable IDs and natural keys let the mock login,
 * tests, and repeated seeds reference the same records.
 *
 * Phase 1 seeds the catalog and customers only. Phase 2 adds orders, order
 * items, and status history.
 */
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

async function main() {
  const prisma = createPrismaClient(process.env.DATABASE_URL);

  try {
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

    console.log(`Seeded ${customers.length} customers and ${products.length} products.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
