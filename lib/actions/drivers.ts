'use server';

import prisma from '@/lib/prisma';
import { driverCreateSchema, driverUpdateSchema, DriverCreate, DriverUpdate } from '@/lib/validators/transit';
import { revalidateTag } from 'next/cache';

const DriverStatus = {
  AVAILABLE: 'AVAILABLE',
  ON_TRIP: 'ON_TRIP',
  OFF_DUTY: 'OFF_DUTY',
  SUSPENDED: 'SUSPENDED',
} as const;

export async function createDriver(data: DriverCreate) {
  try {
    const validated = driverCreateSchema.parse(data);
    
    // Check if license has expired
    if (validated.licenseExpiry < new Date()) {
      return { success: false, error: 'License has expired' };
    }

    const driver = await prisma.driver.create({
      data: {
        ...validated,
        status: DriverStatus.AVAILABLE,
      },
    });

    revalidateTag('drivers');
    return { success: true, data: driver };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'License number already exists' };
    }
    return { success: false, error: 'Failed to create driver' };
  }
}

export async function updateDriver(id: string, data: DriverUpdate) {
  try {
    const validated = driverUpdateSchema.parse(data);
    
    if (validated.licenseExpiry && validated.licenseExpiry < new Date()) {
      return { success: false, error: 'License has expired' };
    }

    const driver = await prisma.driver.update({
      where: { id },
      data: validated,
    });

    revalidateTag('drivers');
    return { success: true, data: driver };
  } catch (error) {
    return { success: false, error: 'Failed to update driver' };
  }
}

export async function deleteDriver(id: string) {
  try {
    await prisma.driver.delete({
      where: { id },
    });

    revalidateTag('drivers');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete driver' };
  }
}

export async function getDrivers() {
  try {
    const drivers = await prisma.driver.findMany({
      where: {
        status: { not: DriverStatus.SUSPENDED },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: drivers };
  } catch (error) {
    return { success: false, error: 'Failed to fetch drivers' };
  }
}

export async function getDriverById(id: string) {
  try {
    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        trips: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!driver) {
      return { success: false, error: 'Driver not found' };
    }

    return { success: true, data: driver };
  } catch (error) {
    return { success: false, error: 'Failed to fetch driver' };
  }
}

export async function suspendDriver(id: string, reason: string) {
  try {
    const driver = await prisma.driver.update({
      where: { id },
      data: {
        status: DriverStatus.SUSPENDED,
        suspendedReason: reason,
      },
    });

    revalidateTag('drivers');
    return { success: true, data: driver };
  } catch (error) {
    return { success: false, error: 'Failed to suspend driver' };
  }
}

export async function updateSafetyScore(id: string, score: number) {
  try {
    if (score < 0 || score > 100) {
      return { success: false, error: 'Safety score must be between 0 and 100' };
    }

    const driver = await prisma.driver.update({
      where: { id },
      data: { safetyScore: score },
    });

    revalidateTag('drivers');
    return { success: true, data: driver };
  } catch (error) {
    return { success: false, error: 'Failed to update safety score' };
  }
}

export async function getAvailableDrivers() {
  try {
    const today = new Date();
    
    const drivers = await prisma.driver.findMany({
      where: {
        status: DriverStatus.AVAILABLE,
        licenseExpiry: { gt: today },
      },
      orderBy: { name: 'asc' },
    });

    return { success: true, data: drivers };
  } catch (error) {
    return { success: false, error: 'Failed to fetch available drivers' };
  }
}

export async function getExpiredLicenses() {
  try {
    const today = new Date();
    
    const drivers = await prisma.driver.findMany({
      where: {
        licenseExpiry: { lte: today },
      },
      orderBy: { licenseExpiry: 'asc' },
    });

    return { success: true, data: drivers };
  } catch (error) {
    return { success: false, error: 'Failed to fetch expired licenses' };
  }
}

export async function getExpiringLicenses(daysAhead: number = 30) {
  try {
    const today = new Date();
    const futureDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    
    const drivers = await prisma.driver.findMany({
      where: {
        licenseExpiry: {
          gte: today,
          lte: futureDate,
        },
      },
      orderBy: { licenseExpiry: 'asc' },
    });

    return { success: true, data: drivers };
  } catch (error) {
    return { success: false, error: 'Failed to fetch expiring licenses' };
  }
}

export async function getDriverStats() {
  try {
    const [total, available, onTrip, offDuty, suspended] = await Promise.all([
      prisma.driver.count(),
      prisma.driver.count({ where: { status: DriverStatus.AVAILABLE } }),
      prisma.driver.count({ where: { status: DriverStatus.ON_TRIP } }),
      prisma.driver.count({ where: { status: DriverStatus.OFF_DUTY } }),
      prisma.driver.count({ where: { status: DriverStatus.SUSPENDED } }),
    ]);

    const expiredLicenses = await prisma.driver.count({
      where: { licenseExpiry: { lte: new Date() } },
    });

    return {
      success: true,
      data: {
        total,
        available,
        onTrip,
        offDuty,
        suspended,
        expiredLicenses,
      },
    };
  } catch (error) {
    return { success: false, error: 'Failed to fetch driver stats' };
  }
}
