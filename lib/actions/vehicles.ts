'use server';

import prisma from '@/lib/prisma';
import { vehicleCreateSchema, vehicleUpdateSchema, VehicleCreate, VehicleUpdate } from '@/lib/validators/transit';
import { revalidateTag } from 'next/cache';

const VehicleStatus = {
  AVAILABLE: 'AVAILABLE',
  ON_TRIP: 'ON_TRIP',
  IN_SHOP: 'IN_SHOP',
  RETIRED: 'RETIRED',
} as const;

export async function createVehicle(data: VehicleCreate) {
  try {
    const validated = vehicleCreateSchema.parse(data);
    
    const vehicle = await prisma.vehicle.create({
      data: {
        ...validated,
        status: VehicleStatus.AVAILABLE,
      },
    });

    revalidateTag('vehicles');
    return { success: true, data: vehicle };
  } catch (error) {
    return { success: false, error: 'Failed to create vehicle' };
  }
}

export async function updateVehicle(id: string, data: VehicleUpdate) {
  try {
    const validated = vehicleUpdateSchema.parse(data);
    
    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: validated,
    });

    revalidateTag('vehicles');
    return { success: true, data: vehicle };
  } catch (error) {
    return { success: false, error: 'Failed to update vehicle' };
  }
}

export async function deleteVehicle(id: string) {
  try {
    await prisma.vehicle.delete({
      where: { id },
    });

    revalidateTag('vehicles');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete vehicle' };
  }
}

export async function getVehicles() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        status: { not: VehicleStatus.RETIRED },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: vehicles };
  } catch (error) {
    return { success: false, error: 'Failed to fetch vehicles' };
  }
}

export async function getVehicleById(id: string) {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        trips: { orderBy: { createdAt: 'desc' }, take: 5 },
        maintenanceLogs: { orderBy: { createdAt: 'desc' }, take: 5 },
        fuelLogs: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    if (!vehicle) {
      return { success: false, error: 'Vehicle not found' };
    }

    return { success: true, data: vehicle };
  } catch (error) {
    return { success: false, error: 'Failed to fetch vehicle' };
  }
}

export async function retireVehicle(id: string) {
  try {
    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        status: VehicleStatus.RETIRED,
        retiredDate: new Date(),
      },
    });

    revalidateTag('vehicles');
    return { success: true, data: vehicle };
  } catch (error) {
    return { success: false, error: 'Failed to retire vehicle' };
  }
}

export async function updateVehicleOdometer(id: string, odometer: number) {
  try {
    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: { odometer },
    });

    revalidateTag('vehicles');
    return { success: true, data: vehicle };
  } catch (error) {
    return { success: false, error: 'Failed to update odometer' };
  }
}

export async function getAvailableVehicles() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        status: VehicleStatus.AVAILABLE,
      },
      orderBy: { name: 'asc' },
    });

    return { success: true, data: vehicles };
  } catch (error) {
    return { success: false, error: 'Failed to fetch available vehicles' };
  }
}

export async function getVehicleStats() {
  try {
    const [total, available, onTrip, inShop, retired] = await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { status: VehicleStatus.AVAILABLE } }),
      prisma.vehicle.count({ where: { status: VehicleStatus.ON_TRIP } }),
      prisma.vehicle.count({ where: { status: VehicleStatus.IN_SHOP } }),
      prisma.vehicle.count({ where: { status: VehicleStatus.RETIRED } }),
    ]);

    const avgUtilization = total > 0 ? ((onTrip + inShop) / total) * 100 : 0;

    return {
      success: true,
      data: {
        total,
        available,
        onTrip,
        inShop,
        retired,
        avgUtilization: avgUtilization.toFixed(1),
      },
    };
  } catch (error) {
    return { success: false, error: 'Failed to fetch vehicle stats' };
  }
}
