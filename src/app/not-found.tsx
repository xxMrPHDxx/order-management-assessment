import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-start px-4 py-24 sm:px-6">
      <p className="text-sm font-semibold text-slate-500">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Page not found</h1>
      <p className="mt-3 max-w-xl text-slate-600">
        The page you requested does not exist. Check the order number or return to the overview.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
      >
        Go to overview
      </Link>
    </div>
  );
}
