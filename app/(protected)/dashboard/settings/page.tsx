import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export const metadata = {
  title: 'Settings - TransitOps',
  description: 'Account and preferences settings',
};

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session) {
    redirect('/login');
  }

  const { user } = session;

  return (
    <main className="flex flex-1 flex-col gap-6 bg-background p-4 lg:p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile Section */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-lg font-medium text-foreground mt-1">{user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-lg font-medium text-foreground mt-1">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Platform Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Platform Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium text-foreground">Dark Theme</p>
                <p className="text-sm text-muted-foreground">Always enabled for optimal viewing</p>
              </div>
              <div className="px-3 py-1 rounded-md bg-primary/20 text-primary text-xs font-medium">
                Active
              </div>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-foreground">Data Export</p>
                <p className="text-sm text-muted-foreground">Export fleet data as CSV</p>
              </div>
              <Button 
                size="sm" 
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-destructive">Account Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={async () => {
              'use server';
              await auth.api.signOut({
                headers: await headers(),
              });
              redirect('/login');
            }}>
              <Button
                type="submit"
                className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Platform</p>
              <p className="text-foreground font-medium">TransitOps v1.0</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-foreground text-sm">Smart Transport Operations Management Platform</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
