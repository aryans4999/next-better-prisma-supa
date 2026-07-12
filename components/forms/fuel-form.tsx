'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { fuelLogCreateSchema, FuelLogCreate } from '@/lib/validators/transit';
import { createFuelLog } from '@/lib/actions/fuel-expenses';
import { getVehicles } from '@/lib/actions/vehicles';
import { getActivaTrips } from '@/lib/actions/trips';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface FuelFormProps {
  onSuccess?: () => void;
}

interface Vehicle {
  id: string;
  name: string;
  registrationNumber: string;
}

interface Trip {
  id: string;
  source: string;
  destination: string;
}

export function FuelForm({ onSuccess }: FuelFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FuelLogCreate>({
    resolver: zodResolver(fuelLogCreateSchema),
  });

  useEffect(() => {
    const loadOptions = async () => {
      const [vehicleRes, tripRes] = await Promise.all([
        getVehicles(),
        getActivaTrips(),
      ]);
      if (vehicleRes.success) setVehicles(vehicleRes.data);
      if (tripRes.success) setTrips(tripRes.data);
    };
    loadOptions();
  }, []);

  const onSubmit = async (data: FuelLogCreate) => {
    setIsLoading(true);
    try {
      const result = await createFuelLog(data);
      if (result.success) {
        toast.success('Fuel log recorded');
        reset();
        onSuccess?.();
      } else {
        toast.error(result.error || 'Failed to record fuel');
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
        <CardTitle>Record Fuel</CardTitle>
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
            <label className="text-sm font-medium text-foreground">Trip (Optional)</label>
            <select
              {...register('tripId')}
              className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
            >
              <option value="">No trip</option>
              {trips.map(t => (
                <option key={t.id} value={t.id}>
                  {t.source} → {t.destination}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Liters</label>
              <Input
                {...register('liters')}
                type="number"
                step="0.01"
                placeholder="50"
                className="mt-1 bg-background border-border"
              />
              {errors.liters && (
                <p className="text-xs text-destructive mt-1">{errors.liters.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Cost (₹)</label>
              <Input
                {...register('cost')}
                type="number"
                step="0.01"
                placeholder="5000"
                className="mt-1 bg-background border-border"
              />
              {errors.cost && (
                <p className="text-xs text-destructive mt-1">{errors.cost.message}</p>
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
                Recording...
              </>
            ) : (
              'Record Fuel'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
