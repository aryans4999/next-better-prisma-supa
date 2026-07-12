import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AnalyticsDashboard } from '@/components/features/analytics-dashboard';

export const metadata = {
  title: 'Reports & Analytics - TransitOps',
  description: 'Fleet analytics and reporting',
};

export default async function ReportsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session) {
    redirect('/login');
  }

  return (
    <main className="flex flex-1 flex-col gap-6 bg-background p-4 lg:p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-muted-foreground">Fleet performance and operational insights</p>
      </div>

      <AnalyticsDashboard />
    </main>
  );
}
