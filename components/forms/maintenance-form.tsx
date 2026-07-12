'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { maintenanceCreateSchema, MaintenanceCreate } from '@/lib/validators/transit';
import { createMaintenanceLog } from '@/lib/actions/maintenance';
import { getVehicles } from '@/lib/actions/vehicles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface MaintenanceFormProps {
  onSuccess?: () => void;
}

interface Vehicle {
  id: string;
  name: string;
  registrationNumber: string;
}

export function MaintenanceForm({ onSuccess }: MaintenanceFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(maintenanceCreateSchema),
  }) as ReturnType<typeof useForm<MaintenanceCreate>>;

  useEffect(() => {
    const loadVehicles = async () => {
      const result = await getVehicles();
      if (result.success) setVehicles(result.data);
    };
    loadVehicles();
  }, []);

  const onSubmit = async (data: MaintenanceCreate) => {
    setIsLoading(true);
    try {
      const result = await createMaintenanceLog(data);
      if (result.success) {
        toast.success('Maintenance log created successfully');
        reset();
        onSuccess?.();
      } else {
        toast.error(result.error || 'Failed to create maintenance log');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Log Maintenance</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Select Vehicle</label>
            <select
              {...register('vehicleId')}
              className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
            >
              <option value="">Choose a vehicle...</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.registrationNumber})
                </option>
              ))}
            </select>
            {errors.vehicleId && (
              <p className="text-xs text-destructive mt-1">{errors.vehicleId.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              {...register('description')}
              placeholder="Describe the maintenance work..."
              rows={3}
              className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
            />
            {errors.description && (
              <p className="text-xs text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Cost (₹)</label>
              <Input
                {...register('cost')}
                type="number"
                placeholder="5000"
                className="mt-1 bg-background border-border"
              />
              {errors.cost && (
                <p className="text-xs text-destructive mt-1">{errors.cost.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Date Performed</label>
              <Input
                {...register('performedDate', { valueAsDate: true })}
                type="date"
                className="mt-1 bg-background border-border"
              />
              {errors.performedDate && (
                <p className="text-xs text-destructive mt-1">{errors.performedDate.message}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Log Maintenance'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
