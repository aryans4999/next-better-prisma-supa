'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { driverCreateSchema, DriverCreate } from '@/lib/validators/transit';
import { createDriver } from '@/lib/actions/drivers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface DriverFormProps {
  onSuccess?: () => void;
}

export function DriverForm({ onSuccess }: DriverFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(driverCreateSchema),
  }) as ReturnType<typeof useForm<DriverCreate>>;

  const onSubmit = async (data: DriverCreate) => {
    setIsLoading(true);
    try {
      const result = await createDriver(data);
      if (result.success) {
        toast.success('Driver added successfully');
        reset();
        onSuccess?.();
      } else {
        toast.error(result.error || 'Failed to add driver');
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
        <CardTitle>Add New Driver</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Driver Name</label>
            <Input
              {...register('name')}
              placeholder="John Doe"
              className="mt-1 bg-background border-border"
            />
            {errors.name && (
              <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">License Number</label>
              <Input
                {...register('licenseNumber')}
                placeholder="DL001234567"
                className="mt-1 bg-background border-border"
              />
              {errors.licenseNumber && (
                <p className="text-xs text-destructive mt-1">{errors.licenseNumber.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">License Category</label>
              <Input
                {...register('licenseCategory')}
                placeholder="HCV"
                className="mt-1 bg-background border-border"
              />
              {errors.licenseCategory && (
                <p className="text-xs text-destructive mt-1">{errors.licenseCategory.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">License Expiry Date</label>
              <Input
                {...register('licenseExpiry', { valueAsDate: true })}
                type="date"
                className="mt-1 bg-background border-border"
              />
              {errors.licenseExpiry && (
                <p className="text-xs text-destructive mt-1">{errors.licenseExpiry.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Contact Number</label>
              <Input
                {...register('contact')}
                placeholder="+91 98765 43210"
                className="mt-1 bg-background border-border"
              />
              {errors.contact && (
                <p className="text-xs text-destructive mt-1">{errors.contact.message}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Driver'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
