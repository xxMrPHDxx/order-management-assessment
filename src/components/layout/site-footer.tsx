import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>Assessment POC — not a production deployment.</p>
        <Link href="/login" className="font-medium text-slate-700 hover:underline">
          Sign in to continue
        </Link>
      </div>
    </footer>
  );
}
