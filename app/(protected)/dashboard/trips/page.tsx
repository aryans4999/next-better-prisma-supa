'use client';

import { TripForm } from '@/components/forms/trip-form';
import { ActiveTripsTable } from '@/components/features/active-trips-table';
import { useState } from 'react';

export default function TripsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="flex flex-1 flex-col gap-6 bg-background p-4 lg:p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Trip Management</h1>
        <p className="text-muted-foreground">Create and manage vehicle trips</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <TripForm onSuccess={() => setRefreshKey(k => k + 1)} />
        </div>
        <div className="lg:col-span-2">
          <ActiveTripsTable key={refreshKey} />
        </div>
      </div>
    </main>
  );
}
