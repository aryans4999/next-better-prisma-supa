import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardKPIs } from "@/components/features/dashboard-kpis";

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/login");
  }
  
  return (
    <main className="flex flex-1 flex-col gap-4 bg-background">
      <div className="pt-4">
        <h1 className="text-3xl font-bold text-foreground px-4 lg:px-6">Dashboard</h1>
        <p className="text-muted-foreground px-4 lg:px-6">Welcome back! Here&apos;s your fleet overview.</p>
      </div>
      <DashboardKPIs />
      <div className="px-4 lg:px-6 pb-6">
        <div className="rounded-lg bg-card border border-border p-6 text-center">
          <p className="text-muted-foreground">Additional features coming soon</p>
        </div>
      </div>
    </main>
  );
}
