'use server';

import prisma from '@/lib/prisma';
const db = prisma as any;
import { maintenanceCreateSchema, maintenanceUpdateSchema, MaintenanceCreate, MaintenanceUpdate } from '@/lib/validators/transit';
import { revalidateTag } from 'next/cache';

const MaintenanceStatus = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
} as const;

const VehicleStatus = {
  AVAILABLE: 'AVAILABLE',
  ON_TRIP: 'ON_TRIP',
  IN_SHOP: 'IN_SHOP',
  RETIRED: 'RETIRED',
} as const;

export async function createMaintenanceLog(data: MaintenanceCreate) {
  try {
    const validated = maintenanceCreateSchema.parse(data);

    // Check if vehicle exists
    const vehicle = await db.vehicle.findUnique({
      where: { id: validated.vehicleId },
    });

    if (!vehicle) return { success: false, error: 'Vehicle not found' };

    // Create maintenance log and set vehicle to IN_SHOP
    const [log] = await Promise.all([
      db.maintenanceLog.create({
        data: {
          ...validated,
          status: MaintenanceStatus.OPEN,
        },
      }),
      db.vehicle.update({
        where: { id: validated.vehicleId },
        data: { status: VehicleStatus.IN_SHOP },
      }),
    ]);

    revalidateTag('maintenance', 'max');
    revalidateTag('vehicles', 'max');
    return { success: true, data: log };
  } catch (error: any) {
    console.error('[v0] Maintenance log creation error:', error);
    return { success: false, error: 'Failed to create maintenance log' };
  }
}

export async function closeMaintenanceLog(id: string) {
  try {
    const log = await db.maintenanceLog.findUnique({
      where: { id },
    });

    if (!log) return { success: false, error: 'Maintenance log not found' };
    if (log.status === MaintenanceStatus.CLOSED) {
      return { success: false, error: 'Maintenance log is already closed' };
    }

    // Update log and restore vehicle status
    const [updatedLog] = await Promise.all([
      db.maintenanceLog.update({
        where: { id },
        data: {
          status: MaintenanceStatus.CLOSED,
          closedDate: new Date(),
        },
      }),
      db.vehicle.update({
        where: { id: log.vehicleId },
        data: { status: VehicleStatus.AVAILABLE },
      }),
    ]);

    revalidateTag('maintenance', 'max');
    revalidateTag('vehicles', 'max');
    return { success: true, data: updatedLog };
  } catch (error) {
    return { success: false, error: 'Failed to close maintenance log' };
  }
}

export async function updateMaintenanceLog(id: string, data: MaintenanceUpdate) {
  try {
    const validated = maintenanceUpdateSchema.parse(data);

    const log = await db.maintenanceLog.update({
      where: { id },
      data: validated,
    });

    revalidateTag('maintenance', 'max');
    return { success: true, data: log };
  } catch (error) {
    return { success: false, error: 'Failed to update maintenance log' };
  }
}

export async function deleteMaintenanceLog(id: string) {
  try {
    const log = await db.maintenanceLog.findUnique({
      where: { id },
    });

    if (!log) return { success: false, error: 'Maintenance log not found' };

    await db.maintenanceLog.delete({
      where: { id },
    });

    revalidateTag('maintenance', 'max');
    revalidateTag('vehicles', 'max');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete maintenance log' };
  }
}

export async function getMaintenanceLogs(vehicleId?: string) {
  try {
    const logs = await db.maintenanceLog.findMany({
      where: vehicleId ? { vehicleId } : undefined,
      include: {
        vehicle: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: logs };
  } catch (error) {
    return { success: false, error: 'Failed to fetch maintenance logs' };
  }
}

export async function getOpenMaintenanceLogs() {
  try {
    const logs = await db.maintenanceLog.findMany({
      where: { status: MaintenanceStatus.OPEN },
      include: {
        vehicle: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: logs };
  } catch (error) {
    return { success: false, error: 'Failed to fetch open maintenance logs' };
  }
}

export async function getMaintenanceStats() {
  try {
    const [total, open, closed] = await Promise.all([
      db.maintenanceLog.count(),
      db.maintenanceLog.count({ where: { status: MaintenanceStatus.OPEN } }),
      db.maintenanceLog.count({ where: { status: MaintenanceStatus.CLOSED } }),
    ]);

    const totalCost = await db.maintenanceLog.aggregate({
      _sum: {
        cost: true,
      },
    });

    return {
      success: true,
      data: {
        total,
        open,
        closed,
        totalCost: totalCost._sum.cost || 0,
      },
    };
  } catch (error) {
    return { success: false, error: 'Failed to fetch maintenance stats' };
  }
}
