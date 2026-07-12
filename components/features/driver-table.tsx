'use client';

import { useEffect, useState } from 'react';
import { getDrivers, deleteDriver, getExpiringLicenses } from '@/lib/actions/drivers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiry: string | Date;
  contact: string;
  safetyScore: number;
  status: string;
}

export function DriverTable() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [expiringLicenses, setExpiringLicenses] = useState<Driver[]>([]);

  const loadDrivers = async () => {
    setLoading(true);
    const result = await getDrivers();
    if (result.success) {
      setDrivers(result.data);
    }
    
    const expiringResult = await getExpiringLicenses(30);
    if (expiringResult.success) {
      setExpiringLicenses(expiringResult.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    const result = await deleteDriver(id);
    if (result.success) {
      toast.success('Driver deleted');
      loadDrivers();
    } else {
      toast.error(result.error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      AVAILABLE: 'bg-green-500/20 text-green-400 border-green-500/30',
      ON_TRIP: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      OFF_DUTY: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      SUSPENDED: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const isLicenseExpiring = (driver: Driver) => {
    return expiringLicenses.some(d => d.id === driver.id);
  };

  const getDaysToExpiry = (expiry: string | Date) => {
    const today = new Date();
    const expiryDate = new Date(expiry);
    const days = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading drivers...</div>;
  }

  return (
    <div className="space-y-4">
      {expiringLicenses.length > 0 && (
        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
          <p className="text-yellow-400 text-sm">
            {expiringLicenses.length} driver(s) have licenses expiring within 30 days. Please renew them.
          </p>
        </div>
      )}

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Driver Management</CardTitle>
        </CardHeader>
        <CardContent>
          {drivers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No drivers found. Add one to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 text-muted-foreground">License</th>
                    <th className="text-left py-3 px-4 text-muted-foreground">Category</th>
                    <th className="text-left py-3 px-4 text-muted-foreground">Expiry</th>
                    <th className="text-left py-3 px-4 text-muted-foreground">Safety Score</th>
                    <th className="text-left py-3 px-4 text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((driver) => (
                    <tr
                      key={driver.id}
                      className={`border-b border-border hover:bg-background/50 ${
                        isLicenseExpiring(driver) ? 'bg-yellow-500/5' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-medium text-foreground">{driver.name}</td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">{driver.licenseNumber}</td>
                      <td className="py-3 px-4 text-muted-foreground">{driver.licenseCategory}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            {new Date(driver.licenseExpiry).toLocaleDateString()}
                          </span>
                          {isLicenseExpiring(driver) && (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 border text-xs">
                              {getDaysToExpiry(driver.licenseExpiry)}d
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-foreground font-medium">{driver.safetyScore}/100</td>
                      <td className="py-3 px-4">
                        <Badge className={`${getStatusColor(driver.status)} border`}>
                          {driver.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(driver.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
