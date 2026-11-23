"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { formatMoney } from "@/lib/orders/format";

type Product = {
  id: string;
  sku: string;
  name: string;
  unitPrice: string;
};

export function OrderForm({
  products,
  defaultAddress,
  currency,
}: {
  products: Product[];
  defaultAddress: string;
  currency: string;
}) {
  const router = useRouter();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [address, setAddress] = useState(defaultAddress);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selected = useMemo(
    () =>
      products
        .map((product) => ({
          product,
          quantity: quantities[product.id] ?? 0,
        }))
        .filter((line) => line.quantity > 0),
    [products, quantities],
  );

  const totalCents = selected.reduce(
    (total, line) =>
      total + Math.round(Number.parseFloat(line.product.unitPrice) * 100) * line.quantity,
    0,
  );

  function setQuantity(productId: string, rawValue: string) {
    const parsed = Number.parseInt(rawValue, 10);
    const quantity = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), 99) : 0;
    setQuantities((current) => ({ ...current, [productId]: quantity }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (selected.length === 0) {
      setError("Select at least one product before placing the order.");
      return;
    }
    if (address.trim().length < 10) {
      setError("Enter a complete shipping address (at least 10 characters).");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: address.trim(),
          items: selected.map((line) => ({
            productId: line.product.id,
            quantity: line.quantity,
          })),
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        data?: { orderNumber?: string };
        error?: { message?: string };
      } | null;

      if (!response.ok || !payload?.data?.orderNumber) {
        setError(payload?.error?.message ?? "Could not place the order. Try again.");
        return;
      }

      router.push(`/customer/orders/${payload.data.orderNumber}?created=1`);
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
      <section aria-labelledby="catalog-heading" className="min-w-0">
        <h2 id="catalog-heading" className="text-lg font-semibold text-slate-900">
          Catalog
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Quantities only. Prices shown are taken from the current catalog.
        </p>

        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Product
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Unit price
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Quantity
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Line total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => {
                const quantity = quantities[product.id] ?? 0;
                const lineTotal = Math.round(Number.parseFloat(product.unitPrice) * 100) * quantity;

                return (
                  <tr key={product.id}>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-900">{product.name}</span>
                      <p className="text-xs text-slate-500">{product.sku}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                      {formatMoney(product.unitPrice, currency)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <input
                        id={`quantity-${product.id}`}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={99}
                        aria-label={`Quantity for ${product.name}`}
                        value={quantity === 0 ? "" : quantity}
                        placeholder="0"
                        onChange={(event) => setQuantity(product.id, event.target.value)}
                        className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-right text-sm text-slate-900 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap text-slate-700">
                      {quantity > 0 ? formatMoney(lineTotal / 100, currency) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Shipping address</h2>
          <label htmlFor="shippingAddress" className="sr-only">
            Shipping address
          </label>
          <textarea
            id="shippingAddress"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            rows={4}
            maxLength={500}
            className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 focus:outline-none"
          />
          <p className="mt-2 text-xs text-slate-500">Defaults to your account address.</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Summary</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-600">Selected lines</dt>
              <dd className="font-medium text-slate-900">{selected.length}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-600">Items</dt>
              <dd className="font-medium text-slate-900">
                {selected.reduce((total, line) => total + line.quantity, 0)}
              </dd>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <dt className="font-semibold text-slate-900">Total</dt>
              <dd className="text-base font-semibold text-slate-900">
                {formatMoney(totalCents / 100, currency)}
              </dd>
            </div>
          </dl>

          {error ? (
            <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Placing order…" : "Place order"}
          </button>
          <p className="mt-3 text-center text-xs text-slate-500">
            Orders start as pending supplier approval.
          </p>
        </div>
      </aside>
    </form>
  );
}
