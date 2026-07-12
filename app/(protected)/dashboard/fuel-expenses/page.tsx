import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { FuelForm } from '@/components/forms/fuel-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Fuel & Expenses - TransitOps',
  description: 'Track fuel and operational expenses',
};

export default async function FuelExpensesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session) {
    redirect('/login');
  }

  return (
    <main className="flex flex-1 flex-col gap-6 bg-background p-4 lg:p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Fuel & Expenses</h1>
        <p className="text-muted-foreground">Track fuel consumption and operational expenses</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <FuelForm onSuccess={() => window.location.reload()} />
        </div>
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Fuel & Expense Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Fuel and expense logs will appear here</p>
                <p className="text-xs mt-2">Record fuel and expenses using the form</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
