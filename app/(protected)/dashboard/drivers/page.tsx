import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DriverForm } from '@/components/forms/driver-form';
import { DriverTable } from '@/components/features/driver-table';

export const metadata = {
  title: 'Drivers - TransitOps',
  description: 'Driver management',
};

export default async function DriversPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session) {
    redirect('/login');
  }

  return (
    <main className="flex flex-1 flex-col gap-6 bg-background p-4 lg:p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Driver Management</h1>
        <p className="text-muted-foreground">Manage your drivers and licenses</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <DriverForm onSuccess={() => window.location.reload()} />
        </div>
        <div className="lg:col-span-2">
          <DriverTable />
        </div>
      </div>
    </main>
  );
}
