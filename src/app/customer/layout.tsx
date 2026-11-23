import { requirePageRole } from "@/lib/auth/page-guards";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  await requirePageRole("customer");
  return <>{children}</>;
}
