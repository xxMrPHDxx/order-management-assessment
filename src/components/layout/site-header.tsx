import Link from "next/link";

import { siteConfig } from "@/config/site";
import { logoutAction } from "@/lib/auth/actions";
import { getSession } from "@/lib/auth/cookies";

export async function SiteHeader() {
  const session = await getSession();
  const dashboardHref = session?.role === "customer" ? "/customer/orders" : "/supplier/orders";

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
            <li>
              <Link
                href="/"
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                Overview
              </Link>
            </li>

            {session ? (
              <>
                <li>
                  <Link
                    href={dashboardHref}
                    className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    {session.role === "customer" ? "My orders" : "Dashboard"}
                  </Link>
                </li>
                {session.role === "customer" ? (
                  <li>
                    <Link
                      href="/customer/orders/new"
                      className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    >
                      New order
                    </Link>
                  </li>
                ) : null}
                <li className="hidden sm:block">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 capitalize">
                    {session.role} · {session.name}
                  </span>
                </li>
                <li>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    >
                      Sign out
                    </button>
                  </form>
                </li>
              </>
            ) : (
              <li>
                <Link
                  href="/login"
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  Sign in
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
