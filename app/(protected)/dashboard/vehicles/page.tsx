'use client';

import { VehicleForm } from '@/components/forms/vehicle-form';
import { VehicleTable } from '@/components/features/vehicle-table';
import { useEffect, useState } from 'react';

export default function VehiclesPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="flex flex-1 flex-col gap-6 bg-background p-4 lg:p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Vehicle Registry</h1>
        <p className="text-muted-foreground">Manage your fleet of vehicles</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <VehicleForm onSuccess={() => setRefreshKey(k => k + 1)} />
        </div>
        <div className="lg:col-span-2">
          <VehicleTable key={refreshKey} />
        </div>
      </div>
    </main>
  );
}
