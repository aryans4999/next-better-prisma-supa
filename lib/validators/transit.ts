import { z } from 'zod';
import { VehicleStatus, DriverStatus, TripStatus, MaintenanceStatus } from '@/lib/generated/prisma/enums';

// Vehicle Validators
export const vehicleCreateSchema = z.object({
  registrationNumber: z.string().min(1, 'Registration number required'),
  name: z.string().min(1, 'Vehicle name required'),
  type: z.string().min(1, 'Vehicle type required'),
  maxLoadCapacity: z.coerce.number().positive('Max load capacity must be positive'),
  acquisitionCost: z.coerce.number().positive('Acquisition cost must be positive'),
});

export const vehicleUpdateSchema = vehicleCreateSchema.partial();

export type VehicleCreate = z.infer<typeof vehicleCreateSchema>;
export type VehicleUpdate = z.infer<typeof vehicleUpdateSchema>;

// Driver Validators
export const driverCreateSchema = z.object({
  name: z.string().min(1, 'Driver name required'),
  licenseNumber: z.string().min(1, 'License number required'),
  licenseCategory: z.string().min(1, 'License category required'),
  licenseExpiry: z.coerce.date().refine(
    (date) => date > new Date(),
    'License must not be expired'
  ),
  contact: z.string().min(1, 'Contact required'),
});

export const driverUpdateSchema = driverCreateSchema.partial();

export type DriverCreate = z.infer<typeof driverCreateSchema>;
export type DriverUpdate = z.infer<typeof driverUpdateSchema>;

// Trip Validators
export const tripCreateSchema = z.object({
  source: z.string().min(1, 'Source required'),
  destination: z.string().min(1, 'Destination required'),
  vehicleId: z.string().min(1, 'Vehicle required'),
  driverId: z.string().min(1, 'Driver required'),
  cargoWeight: z.coerce.number().nonnegative('Cargo weight cannot be negative'),
  plannedDistance: z.coerce.number().positive('Planned distance must be positive'),
});

export const tripUpdateSchema = tripCreateSchema.partial();

export type TripCreate = z.infer<typeof tripCreateSchema>;
export type TripUpdate = z.infer<typeof tripUpdateSchema>;

// Maintenance Validators
export const maintenanceCreateSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle required'),
  description: z.string().min(1, 'Description required'),
  cost: z.coerce.number().nonnegative('Cost cannot be negative'),
  performedDate: z.coerce.date(),
});

export const maintenanceUpdateSchema = maintenanceCreateSchema.partial();

export type MaintenanceCreate = z.infer<typeof maintenanceCreateSchema>;
export type MaintenanceUpdate = z.infer<typeof maintenanceUpdateSchema>;

// Fuel Log Validators
export const fuelLogCreateSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle required'),
  tripId: z.string().optional(),
  liters: z.coerce.number().positive('Liters must be positive'),
  cost: z.coerce.number().nonnegative('Cost cannot be negative'),
});

export type FuelLogCreate = z.infer<typeof fuelLogCreateSchema>;

// Expense Validators
export const expenseCreateSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle required'),
  type: z.string().min(1, 'Expense type required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  date: z.coerce.date(),
  description: z.string().optional(),
});

export type ExpenseCreate = z.infer<typeof expenseCreateSchema>;
