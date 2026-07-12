'use client';

import { AnalyticsDashboard } from '@/components/features/analytics-dashboard';

export default function ReportsPage() {
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
