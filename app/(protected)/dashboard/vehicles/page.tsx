import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { VehicleForm } from '@/components/forms/vehicle-form';
import { VehicleTable } from '@/components/features/vehicle-table';

export const metadata = {
  title: 'Vehicles - TransitOps',
  description: 'Fleet vehicle management',
};

export default async function VehiclesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session) {
    redirect('/login');
  }

  return (
    <main className="flex flex-1 flex-col gap-6 bg-background p-4 lg:p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Vehicle Registry</h1>
        <p className="text-muted-foreground">Manage your fleet of vehicles</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <VehicleForm onSuccess={() => window.location.reload()} />
        </div>
        <div className="lg:col-span-2">
          <VehicleTable />
        </div>
      </div>
    </main>
  );
}
