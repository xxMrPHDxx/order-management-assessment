import Link from "next/link";

import { siteConfig } from "@/config/site";

const navigation = [
  { href: "/", label: "Overview" },
  { href: "/login", label: "Sign in" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white"
          >
            OF
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-900">{siteConfig.name}</span>
            <span className="text-xs text-slate-500">Order &amp; logistics POC</span>
          </span>
        </Link>

        <nav aria-label="Main navigation">
          <ul className="flex items-center gap-1">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
