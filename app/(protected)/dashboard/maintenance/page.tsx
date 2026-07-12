'use client';

import { MaintenanceForm } from '@/components/forms/maintenance-form';
import { MaintenanceTable } from '@/components/features/maintenance-table';
import { useState } from 'react';

export default function MaintenancePage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="flex flex-1 flex-col gap-6 bg-background p-4 lg:p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Maintenance Tracking</h1>
        <p className="text-muted-foreground">Log and manage vehicle maintenance</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <MaintenanceForm onSuccess={() => setRefreshKey(k => k + 1)} />
        </div>
        <div className="lg:col-span-2">
          <MaintenanceTable key={refreshKey} />
        </div>
      </div>
    </main>
  );
}
