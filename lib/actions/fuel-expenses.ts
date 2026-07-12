'use server';

import prisma from '@/lib/prisma';
import { fuelLogCreateSchema, expenseCreateSchema, FuelLogCreate, ExpenseCreate } from '@/lib/validators/transit';
import { revalidateTag } from 'next/cache';

// Fuel Log Actions
export async function createFuelLog(data: FuelLogCreate) {
  try {
    const validated = fuelLogCreateSchema.parse(data);

    // Check if vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: validated.vehicleId },
    });

    if (!vehicle) return { success: false, error: 'Vehicle not found' };

    // Check if trip exists if provided
    if (validated.tripId) {
      const trip = await prisma.trip.findUnique({
        where: { id: validated.tripId },
      });
      if (!trip) return { success: false, error: 'Trip not found' };
    }

    const fuelLog = await prisma.fuelLog.create({
      data: validated,
    });

    revalidateTag('fuel-logs');
    return { success: true, data: fuelLog };
  } catch (error: any) {
    console.error('[v0] Fuel log creation error:', error);
    return { success: false, error: 'Failed to create fuel log' };
  }
}

export async function getFuelLogs(vehicleId?: string, tripId?: string) {
  try {
    const logs = await prisma.fuelLog.findMany({
      where: {
        ...(vehicleId && { vehicleId }),
        ...(tripId && { tripId }),
      },
      include: {
        vehicle: true,
        trip: true,
      },
      orderBy: { date: 'desc' },
    });

    return { success: true, data: logs };
  } catch (error) {
    return { success: false, error: 'Failed to fetch fuel logs' };
  }
}

export async function deleteFuelLog(id: string) {
  try {
    await prisma.fuelLog.delete({
      where: { id },
    });

    revalidateTag('fuel-logs');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete fuel log' };
  }
}

export async function getFuelStats(vehicleId?: string) {
  try {
    const totalFuel = await prisma.fuelLog.aggregate({
      where: vehicleId ? { vehicleId } : undefined,
      _sum: {
        liters: true,
        cost: true,
      },
    });

    const count = await prisma.fuelLog.count(
      vehicleId ? { where: { vehicleId } } : undefined
    );

    const avgCostPerLiter = 
      (totalFuel._sum.liters || 0) > 0 
        ? ((totalFuel._sum.cost || 0) / (totalFuel._sum.liters || 1)).toFixed(2)
        : '0';

    return {
      success: true,
      data: {
        totalLiters: totalFuel._sum.liters || 0,
        totalCost: totalFuel._sum.cost || 0,
        count,
        avgCostPerLiter,
      },
    };
  } catch (error) {
    return { success: false, error: 'Failed to fetch fuel stats' };
  }
}

// Expense Actions
export async function createExpense(data: ExpenseCreate) {
  try {
    const validated = expenseCreateSchema.parse(data);

    // Check if vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: validated.vehicleId },
    });

    if (!vehicle) return { success: false, error: 'Vehicle not found' };

    const expense = await prisma.expense.create({
      data: validated,
    });

    revalidateTag('expenses');
    return { success: true, data: expense };
  } catch (error: any) {
    console.error('[v0] Expense creation error:', error);
    return { success: false, error: 'Failed to create expense' };
  }
}

export async function getExpenses(vehicleId?: string) {
  try {
    const expenses = await prisma.expense.findMany({
      where: vehicleId ? { vehicleId } : undefined,
      include: {
        vehicle: true,
      },
      orderBy: { date: 'desc' },
    });

    return { success: true, data: expenses };
  } catch (error) {
    return { success: false, error: 'Failed to fetch expenses' };
  }
}

export async function deleteExpense(id: string) {
  try {
    await prisma.expense.delete({
      where: { id },
    });

    revalidateTag('expenses');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete expense' };
  }
}

export async function getExpenseStats(vehicleId?: string) {
  try {
    const totalExpense = await prisma.expense.aggregate({
      where: vehicleId ? { vehicleId } : undefined,
      _sum: {
        amount: true,
      },
    });

    const byType = await prisma.expense.groupBy({
      by: ['type'],
      where: vehicleId ? { vehicleId } : undefined,
      _sum: {
        amount: true,
      },
      _count: true,
    });

    const count = await prisma.expense.count(
      vehicleId ? { where: { vehicleId } } : undefined
    );

    return {
      success: true,
      data: {
        totalAmount: totalExpense._sum.amount || 0,
        count,
        byType: byType.map(item => ({
          type: item.type,
          amount: item._sum.amount || 0,
          count: item._count,
        })),
      },
    };
  } catch (error) {
    return { success: false, error: 'Failed to fetch expense stats' };
  }
}

// Combined Financial Stats
export async function getFinancialStats(vehicleId?: string) {
  try {
    const [fuelStats, expenseStats, maintenance] = await Promise.all([
      getFuelStats(vehicleId),
      getExpenseStats(vehicleId),
      prisma.maintenanceLog.aggregate({
        where: vehicleId ? { vehicleId } : undefined,
        _sum: {
          cost: true,
        },
      }),
    ]);

    const fuelData = fuelStats.success ? fuelStats.data : { totalCost: 0 };
    const expenseData = expenseStats.success ? expenseStats.data : { totalAmount: 0 };
    const maintenanceCost = maintenance._sum.cost || 0;

    const totalOperationalCost = (fuelData.totalCost || 0) + (expenseData.totalAmount || 0) + maintenanceCost;

    return {
      success: true,
      data: {
        fuelCost: fuelData.totalCost || 0,
        expenseCost: expenseData.totalAmount || 0,
        maintenanceCost,
        totalOperationalCost,
      },
    };
  } catch (error) {
    return { success: false, error: 'Failed to fetch financial stats' };
  }
}
