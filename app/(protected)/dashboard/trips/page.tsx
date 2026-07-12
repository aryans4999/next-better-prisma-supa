import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TripForm } from '@/components/forms/trip-form';
import { ActiveTripsTable } from '@/components/features/active-trips-table';

export const metadata = {
  title: 'Trips - TransitOps',
  description: 'Trip management and dispatching',
};

export default async function TripsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session) {
    redirect('/login');
  }

  return (
    <main className="flex flex-1 flex-col gap-6 bg-background p-4 lg:p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Trip Management</h1>
        <p className="text-muted-foreground">Create and manage vehicle trips</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <TripForm onSuccess={() => window.location.reload()} />
        </div>
        <div className="lg:col-span-2">
          <ActiveTripsTable />
        </div>
      </div>
    </main>
  );
}
