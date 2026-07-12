'use server';

import prisma from '@/lib/prisma';
const db = prisma as any;
import { tripCreateSchema, tripUpdateSchema, TripCreate, TripUpdate } from '@/lib/validators/transit';
import { revalidateTag } from 'next/cache';

const TripStatus = {
  DRAFT: 'DRAFT',
  DISPATCHED: 'DISPATCHED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

const VehicleStatus = {
  AVAILABLE: 'AVAILABLE',
  ON_TRIP: 'ON_TRIP',
  IN_SHOP: 'IN_SHOP',
  RETIRED: 'RETIRED',
} as const;

const DriverStatus = {
  AVAILABLE: 'AVAILABLE',
  ON_TRIP: 'ON_TRIP',
  OFF_DUTY: 'OFF_DUTY',
  SUSPENDED: 'SUSPENDED',
} as const;

export async function createTrip(data: TripCreate) {
  try {
    const validated = tripCreateSchema.parse(data);

    // Fetch vehicle and driver
    const [vehicle, driver] = await Promise.all([
      db.vehicle.findUnique({ where: { id: validated.vehicleId } }),
      db.driver.findUnique({ where: { id: validated.driverId } }),
    ]);

    if (!vehicle) return { success: false, error: 'Vehicle not found' };
    if (!driver) return { success: false, error: 'Driver not found' };

    // Validation: Check vehicle capacity
    if (validated.cargoWeight > vehicle.maxLoadCapacity) {
      return { success: false, error: `Cargo weight exceeds vehicle capacity of ${vehicle.maxLoadCapacity} kg` };
    }

    // Validation: Check license expiry
    if (driver.licenseExpiry < new Date()) {
      return { success: false, error: 'Driver license has expired' };
    }

    // Validation: Check driver is available
    if (driver.status !== DriverStatus.AVAILABLE) {
      return { success: false, error: 'Driver is not available' };
    }

    // Validation: Check vehicle is available
    if (vehicle.status !== VehicleStatus.AVAILABLE) {
      return { success: false, error: 'Vehicle is not available' };
    }

    const trip = await db.trip.create({
      data: {
        ...validated,
        status: TripStatus.DRAFT,
      },
    });

    revalidateTag('trips', 'max');
    return { success: true, data: trip };
  } catch (error: any) {
    console.error('[v0] Trip creation error:', error);
    return { success: false, error: 'Failed to create trip' };
  }
}

export async function dispatchTrip(id: string) {
  try {
    const trip = await db.trip.findUnique({ where: { id } });
    if (!trip) return { success: false, error: 'Trip not found' };
    if (trip.status !== TripStatus.DRAFT) {
      return { success: false, error: 'Only draft trips can be dispatched' };
    }

    // Update trip and related records
    const [updatedTrip] = await Promise.all([
      db.trip.update({
        where: { id },
        data: {
          status: TripStatus.DISPATCHED,
          dispatchedAt: new Date(),
        },
      }),
      db.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: VehicleStatus.ON_TRIP },
      }),
      db.driver.update({
        where: { id: trip.driverId },
        data: { status: DriverStatus.ON_TRIP },
      }),
    ]);

    revalidateTag('trips', 'max');
    revalidateTag('vehicles', 'max');
    revalidateTag('drivers', 'max');
    return { success: true, data: updatedTrip };
  } catch (error) {
    return { success: false, error: 'Failed to dispatch trip' };
  }
}

export async function completeTrip(id: string, actualDistance: number, fuelConsumed: number) {
  try {
    const trip = await db.trip.findUnique({
      where: { id },
      include: { vehicle: true, driver: true },
    });

    if (!trip) return { success: false, error: 'Trip not found' };
    if (trip.status !== TripStatus.DISPATCHED) {
      return { success: false, error: 'Only dispatched trips can be completed' };
    }

    // Update trip, vehicle, and driver
    const [updatedTrip] = await Promise.all([
      db.trip.update({
        where: { id },
        data: {
          status: TripStatus.COMPLETED,
          completedAt: new Date(),
          actualDistance,
          fuelConsumed,
        },
      }),
      db.vehicle.update({
        where: { id: trip.vehicleId },
        data: {
          status: VehicleStatus.AVAILABLE,
          odometer: trip.vehicle.odometer + actualDistance,
        },
      }),
      db.driver.update({
        where: { id: trip.driverId },
        data: { status: DriverStatus.AVAILABLE },
      }),
    ]);

    revalidateTag('trips', 'max');
    revalidateTag('vehicles', 'max');
    revalidateTag('drivers', 'max');
    return { success: true, data: updatedTrip };
  } catch (error) {
    return { success: false, error: 'Failed to complete trip' };
  }
}

export async function cancelTrip(id: string) {
  try {
    const trip = await db.trip.findUnique({ where: { id } });
    if (!trip) return { success: false, error: 'Trip not found' };

    // If trip is dispatched, revert vehicle/driver status
    if (trip.status === TripStatus.DISPATCHED) {
      await Promise.all([
        db.vehicle.update({
          where: { id: trip.vehicleId },
          data: { status: VehicleStatus.AVAILABLE },
        }),
        db.driver.update({
          where: { id: trip.driverId },
          data: { status: DriverStatus.AVAILABLE },
        }),
      ]);
    }

    const updatedTrip = await db.trip.update({
      where: { id },
      data: { status: TripStatus.CANCELLED },
    });

    revalidateTag('trips', 'max');
    revalidateTag('vehicles', 'max');
    revalidateTag('drivers', 'max');
    return { success: true, data: updatedTrip };
  } catch (error) {
    return { success: false, error: 'Failed to cancel trip' };
  }
}

export async function updateTrip(id: string, data: TripUpdate) {
  try {
    const validated = tripUpdateSchema.parse(data);

    // Fetch vehicle if being updated
    if (validated.vehicleId) {
      const vehicle = await db.vehicle.findUnique({
        where: { id: validated.vehicleId },
      });
      if (!vehicle) return { success: false, error: 'Vehicle not found' };

      if (validated.cargoWeight && validated.cargoWeight > vehicle.maxLoadCapacity) {
        return { success: false, error: 'Cargo weight exceeds vehicle capacity' };
      }
    }

    const trip = await db.trip.update({
      where: { id },
      data: validated,
    });

    revalidateTag('trips', 'max');
    return { success: true, data: trip };
  } catch (error) {
    return { success: false, error: 'Failed to update trip' };
  }
}

export async function getTrips(status?: string) {
  try {
    const trips = await db.trip.findMany({
      where: status ? { status } : undefined,
      include: {
        vehicle: true,
        driver: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: trips };
  } catch (error) {
    return { success: false, error: 'Failed to fetch trips' };
  }
}

export async function getTripById(id: string) {
  try {
    const trip = await db.trip.findUnique({
      where: { id },
      include: {
        vehicle: true,
        driver: true,
        fuelLogs: true,
      },
    });

    if (!trip) return { success: false, error: 'Trip not found' };

    return { success: true, data: trip };
  } catch (error) {
    return { success: false, error: 'Failed to fetch trip' };
  }
}

export async function getActivaTrips() {
  try {
    const trips = await db.trip.findMany({
      where: {
        status: TripStatus.DISPATCHED,
      },
      include: {
        vehicle: true,
        driver: true,
      },
      orderBy: { dispatchedAt: 'desc' },
    });

    return { success: true, data: trips };
  } catch (error) {
    return { success: false, error: 'Failed to fetch active trips' };
  }
}

export async function getTripStats() {
  try {
    const [total, dispatched, completed, cancelled] = await Promise.all([
      db.trip.count(),
      db.trip.count({ where: { status: TripStatus.DISPATCHED } }),
      db.trip.count({ where: { status: TripStatus.COMPLETED } }),
      db.trip.count({ where: { status: TripStatus.CANCELLED } }),
    ]);

    // Calculate total distance and fuel
    const stats = await db.trip.aggregate({
      where: { status: TripStatus.COMPLETED },
      _sum: {
        actualDistance: true,
        fuelConsumed: true,
      },
    });

    const totalDistance = stats._sum.actualDistance || 0;
    const totalFuel = stats._sum.fuelConsumed || 0;
    const fuelEfficiency = totalDistance > 0 ? (totalDistance / totalFuel).toFixed(2) : '0';

    return {
      success: true,
      data: {
        total,
        dispatched,
        completed,
        cancelled,
        totalDistance,
        totalFuel,
        fuelEfficiency,
      },
    };
  } catch (error) {
    return { success: false, error: 'Failed to fetch trip stats' };
  }
}
