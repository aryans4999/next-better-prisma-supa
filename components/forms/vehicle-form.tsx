'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vehicleCreateSchema, VehicleCreate } from '@/lib/validators/transit';
import { createVehicle } from '@/lib/actions/vehicles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface VehicleFormProps {
  onSuccess?: () => void;
}

export function VehicleForm({ onSuccess }: VehicleFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VehicleCreate>({
    resolver: zodResolver(vehicleCreateSchema),
  });

  const onSubmit = async (data: VehicleCreate) => {
    setIsLoading(true);
    try {
      const result = await createVehicle(data);
      if (result.success) {
        toast.success('Vehicle created successfully');
        reset();
        onSuccess?.();
      } else {
        toast.error(result.error || 'Failed to create vehicle');
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
        <CardTitle>Add New Vehicle</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Registration Number</label>
              <Input
                {...register('registrationNumber')}
                placeholder="AB 12 CD 1234"
                className="mt-1 bg-background border-border"
              />
              {errors.registrationNumber && (
                <p className="text-xs text-destructive mt-1">{errors.registrationNumber.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Vehicle Name</label>
              <Input
                {...register('name')}
                placeholder="Vehicle 1"
                className="mt-1 bg-background border-border"
              />
              {errors.name && (
                <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Vehicle Type</label>
              <Input
                {...register('type')}
                placeholder="Truck"
                className="mt-1 bg-background border-border"
              />
              {errors.type && (
                <p className="text-xs text-destructive mt-1">{errors.type.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Max Load Capacity (kg)</label>
              <Input
                {...register('maxLoadCapacity')}
                type="number"
                placeholder="5000"
                className="mt-1 bg-background border-border"
              />
              {errors.maxLoadCapacity && (
                <p className="text-xs text-destructive mt-1">{errors.maxLoadCapacity.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Acquisition Cost (₹)</label>
              <Input
                {...register('acquisitionCost')}
                type="number"
                placeholder="500000"
                className="mt-1 bg-background border-border"
              />
              {errors.acquisitionCost && (
                <p className="text-xs text-destructive mt-1">{errors.acquisitionCost.message}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Vehicle'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
