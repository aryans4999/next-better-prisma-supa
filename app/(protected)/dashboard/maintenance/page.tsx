import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MaintenanceForm } from '@/components/forms/maintenance-form';
import { MaintenanceTable } from '@/components/features/maintenance-table';

export const metadata = {
  title: 'Maintenance - TransitOps',
  description: 'Vehicle maintenance tracking',
};

export default async function MaintenancePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session) {
    redirect('/login');
  }

  return (
    <main className="flex flex-1 flex-col gap-6 bg-background p-4 lg:p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Maintenance Tracking</h1>
        <p className="text-muted-foreground">Log and manage vehicle maintenance</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <MaintenanceForm onSuccess={() => window.location.reload()} />
        </div>
        <div className="lg:col-span-2">
          <MaintenanceTable />
        </div>
      </div>
    </main>
  );
}
