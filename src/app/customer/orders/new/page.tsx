import type { Metadata } from "next";
import Link from "next/link";

import { OrderForm } from "@/components/orders/order-form";
import { requirePageRole } from "@/lib/auth/page-guards";
import { env } from "@/lib/env";
import { getCustomerProfile, listActiveProducts } from "@/lib/orders/service";

export const metadata: Metadata = {
  title: "New order",
};

export default async function NewOrderPage() {
  const session = await requirePageRole("customer");
  const [products, customer] = await Promise.all([
    listActiveProducts(),
    getCustomerProfile(session.customerId),
  ]);

  if (!customer) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-semibold text-slate-900">Account not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          The seeded customer for this session no longer exists. Sign in again.
        </p>
        <Link href="/login" className="mt-6 inline-flex text-sm font-semibold hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">New order</h1>
          <p className="mt-2 text-sm text-slate-600">
            Ordering as <strong className="font-semibold text-slate-900">{customer.name}</strong>.
          </p>
        </div>
        <Link
          href="/customer/orders"
          className="text-sm font-semibold text-slate-700 hover:underline"
        >
          Back to orders
        </Link>
      </div>

      <OrderForm
        products={products.map((product) => ({
          id: product.id,
          sku: product.sku,
          name: product.name,
          unitPrice: product.unitPrice.toFixed(2),
        }))}
        defaultAddress={customer.shippingAddress}
        currency={env.CURRENCY}
      />
    </div>
  );
}
