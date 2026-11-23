import Link from "next/link";

const personas = [
  {
    name: "Customer",
    description: "Place purchase orders, follow each delivery, and download invoices.",
    capabilities: ["Mock product catalog", "Order creation", "PDF invoices", "Tracking timeline"],
  },
  {
    name: "Supplier",
    description: "Review incoming orders, move them through logistics, and find anything fast.",
    capabilities: ["Accept or reject", "Status progression", "Search and filters", "Audit history"],
  },
] as const;

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
      <div className="max-w-3xl">
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
          POC in progress
        </span>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          Order management and logistics, end to end.
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          A full-stack proof of concept for B2B purchasing: customers place orders and track
          deliveries, suppliers approve and progress them, and every status change is audited.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex items-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
          >
            Open sign in
          </Link>
          <a
            href="https://github.com"
            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            Repository
          </a>
        </div>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-2">
        {personas.map((persona) => (
          <section
            key={persona.name}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-900">{persona.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{persona.description}</p>
            <ul className="mt-5 grid grid-cols-2 gap-2 text-sm text-slate-700">
              {persona.capabilities.map((capability) => (
                <li key={capability} className="flex items-center gap-2">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-slate-400" />
                  {capability}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
