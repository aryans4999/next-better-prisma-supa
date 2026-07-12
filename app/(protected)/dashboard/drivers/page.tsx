'use client';

import { DriverForm } from '@/components/forms/driver-form';
import { DriverTable } from '@/components/features/driver-table';
import { useState } from 'react';

export default function DriversPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="flex flex-1 flex-col gap-6 bg-background p-4 lg:p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Driver Management</h1>
        <p className="text-muted-foreground">Manage your drivers and licenses</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <DriverForm onSuccess={() => setRefreshKey(k => k + 1)} />
        </div>
        <div className="lg:col-span-2">
          <DriverTable key={refreshKey} />
        </div>
      </div>
    </main>
  );
}
