import { requirePageRole } from "@/lib/auth/page-guards";

export default async function SupplierLayout({ children }: { children: React.ReactNode }) {
  await requirePageRole("supplier");
  return <>{children}</>;
}
