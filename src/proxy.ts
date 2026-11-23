import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth/session";

/**
 * Edge-level route protection for the role-scoped areas. Page guards still run
 * as defence in depth, but redirecting here returns a real 3xx before render.
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const secret = process.env.SESSION_SECRET;
  const session = token && secret ? await verifySession(token, secret) : null;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const isCustomerArea = pathname.startsWith("/customer");
  const isSupplierArea = pathname.startsWith("/supplier");

  if (isCustomerArea && session.role !== "customer") {
    return NextResponse.redirect(new URL("/supplier/orders", request.url));
  }
  if (isSupplierArea && session.role !== "supplier") {
    return NextResponse.redirect(new URL("/customer/orders", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/customer/:path*", "/supplier/:path*"],
};
