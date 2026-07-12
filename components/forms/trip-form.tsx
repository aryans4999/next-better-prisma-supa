'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tripCreateSchema, TripCreate } from '@/lib/validators/transit';
import { createTrip } from '@/lib/actions/trips';
import { getAvailableVehicles } from '@/lib/actions/vehicles';
import { getAvailableDrivers } from '@/lib/actions/drivers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface TripFormProps {
  onSuccess?: () => void;
}

interface Vehicle {
  id: string;
  name: string;
  registrationNumber: string;
  maxLoadCapacity: number;
}

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
}

export function TripForm({ onSuccess }: TripFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(tripCreateSchema),
  }) as ReturnType<typeof useForm<TripCreate>>;

  const vehicleId = watch('vehicleId');

  useEffect(() => {
    const loadOptions = async () => {
      const [vehicleRes, driverRes] = await Promise.all([
        getAvailableVehicles(),
        getAvailableDrivers(),
      ]);
      if (vehicleRes.success) setVehicles(vehicleRes.data);
      if (driverRes.success) setDrivers(driverRes.data);
    };
    loadOptions();
  }, []);

  useEffect(() => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    setSelectedVehicle(vehicle || null);
  }, [vehicleId, vehicles]);

  const onSubmit = async (data: TripCreate) => {
    setIsLoading(true);
    try {
      const result = await createTrip(data);
      if (result.success) {
        toast.success('Trip created successfully');
        reset();
        onSuccess?.();
      } else {
        toast.error(result.error || 'Failed to create trip');
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
        <CardTitle>Create New Trip</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Source Location</label>
              <Input
                {...register('source')}
                placeholder="New Delhi"
                className="mt-1 bg-background border-border"
              />
              {errors.source && (
                <p className="text-xs text-destructive mt-1">{errors.source.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Destination</label>
              <Input
                {...register('destination')}
                placeholder="Mumbai"
                className="mt-1 bg-background border-border"
              />
              {errors.destination && (
                <p className="text-xs text-destructive mt-1">{errors.destination.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <label className="text-sm font-medium text-foreground">Select Driver</label>
              <select
                {...register('driverId')}
                className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
              >
                <option value="">Choose a driver...</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.licenseNumber})
                  </option>
                ))}
              </select>
              {errors.driverId && (
                <p className="text-xs text-destructive mt-1">{errors.driverId.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Cargo Weight (kg)</label>
              <Input
                {...register('cargoWeight')}
                type="number"
                placeholder="2000"
                className="mt-1 bg-background border-border"
              />
              {selectedVehicle && (
                <p className="text-xs text-muted-foreground mt-1">
                  Max capacity: {selectedVehicle.maxLoadCapacity} kg
                </p>
              )}
              {errors.cargoWeight && (
                <p className="text-xs text-destructive mt-1">{errors.cargoWeight.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Planned Distance (km)</label>
              <Input
                {...register('plannedDistance')}
                type="number"
                placeholder="500"
                className="mt-1 bg-background border-border"
              />
              {errors.plannedDistance && (
                <p className="text-xs text-destructive mt-1">{errors.plannedDistance.message}</p>
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
              'Create Trip'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
