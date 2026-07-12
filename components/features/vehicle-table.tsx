'use client';

import { useEffect, useState } from 'react';
import { getVehicles, deleteVehicle } from '@/lib/actions/vehicles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Vehicle {
  id: string;
  registrationNumber: string;
  name: string;
  type: string;
  maxLoadCapacity: number;
  odometer: number;
  status: string;
}

export function VehicleTable() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const loadVehicles = async () => {
    setLoading(true);
    const result = await getVehicles();
    if (result.success) {
      setVehicles(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    const result = await deleteVehicle(id);
    if (result.success) {
      toast.success('Vehicle deleted');
      loadVehicles();
    } else {
      toast.error(result.error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      AVAILABLE: 'bg-green-500/20 text-green-400 border-green-500/30',
      ON_TRIP: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      IN_SHOP: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      RETIRED: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading vehicles...</div>;
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Fleet Registry</CardTitle>
      </CardHeader>
      <CardContent>
        {vehicles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No vehicles found. Create one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground">Reg. Number</th>
                  <th className="text-left py-3 px-4 text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-4 text-muted-foreground">Type</th>
                  <th className="text-left py-3 px-4 text-muted-foreground">Capacity (kg)</th>
                  <th className="text-left py-3 px-4 text-muted-foreground">Odometer</th>
                  <th className="text-left py-3 px-4 text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="border-b border-border hover:bg-background/50">
                    <td className="py-3 px-4 font-mono text-foreground">{vehicle.registrationNumber}</td>
                    <td className="py-3 px-4 text-foreground">{vehicle.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{vehicle.type}</td>
                    <td className="py-3 px-4 text-muted-foreground">{vehicle.maxLoadCapacity}</td>
                    <td className="py-3 px-4 text-muted-foreground">{vehicle.odometer} km</td>
                    <td className="py-3 px-4">
                      <Badge className={`${getStatusColor(vehicle.status)} border`}>
                        {vehicle.status.replace('_', ' ')}
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
                        onClick={() => handleDelete(vehicle.id)}
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
  );
}
