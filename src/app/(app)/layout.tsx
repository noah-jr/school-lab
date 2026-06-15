import { Sidebar } from "@/components/layout/Sidebar";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GlobalNotifications } from "@/components/ui/GlobalNotifications";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="app-shell">
      <GlobalNotifications />
      <Sidebar papel={session.papel} />
      <main className="main-content">{children}</main>
    </div>
  );
}
