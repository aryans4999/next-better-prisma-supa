'use server';

import prisma from '@/lib/prisma';
const db = prisma as any;
import { getFinancialStats, getFuelStats } from '@/lib/actions/fuel-expenses';
import { getMaintenanceStats } from '@/lib/actions/maintenance';
import { getTripStats } from '@/lib/actions/trips';
import { revalidateTag } from 'next/cache';

export async function getFleetReport() {
  try {
    const vehicles = await db.vehicle.findMany();
    const drivers = await db.driver.findMany();
    const trips = await db.trip.findMany();
    const maintenance = await db.maintenanceLog.findMany();
    const fuelLogs = await db.fuelLog.findMany();
    const expenses = await db.expense.findMany();

    const totalTrips = trips.length;
    const completedTrips = trips.filter((t: any) => t.status === 'COMPLETED').length;
    const totalDistance = trips.reduce((sum: any, t: any) => sum + (t.actualDistance || 0), 0);
    const totalFuelConsumed = fuelLogs.reduce((sum: any, f: any) => sum + f.liters, 0);
    const fuelEfficiency = totalDistance > 0 ? (totalDistance / totalFuelConsumed).toFixed(2) : '0';

    const totalMaintenanceCost = maintenance.reduce((sum: any, m: any) => sum + m.cost, 0);
    const totalFuelCost = fuelLogs.reduce((sum: any, f: any) => sum + f.cost, 0);
    const totalExpenses = expenses.reduce((sum: any, e: any) => sum + e.amount, 0);
    const totalOperationalCost = totalFuelCost + totalMaintenanceCost + totalExpenses;

    return {
      success: true,
      data: {
        fleet: {
          totalVehicles: vehicles.length,
          totalDrivers: drivers.length,
        },
        trips: {
          total: totalTrips,
          completed: completedTrips,
          pending: totalTrips - completedTrips,
          totalDistance,
        },
        fuel: {
          totalConsumed: totalFuelConsumed.toFixed(2),
          fuelEfficiency,
          totalCost: totalFuelCost,
        },
        maintenance: {
          totalLogs: maintenance.length,
          totalCost: totalMaintenanceCost,
        },
        expenses: {
          total: totalExpenses,
          maintenance: totalMaintenanceCost,
          fuel: totalFuelCost,
        },
        summary: {
          totalOperationalCost,
          costPerVehicle: vehicles.length > 0 ? (totalOperationalCost / vehicles.length).toFixed(2) : '0',
          costPerTrip: totalTrips > 0 ? (totalOperationalCost / totalTrips).toFixed(2) : '0',
        },
      },
    };
  } catch (error) {
    return { success: false, error: 'Failed to fetch fleet report' };
  }
}

export async function getVehicleAnalytics(vehicleId: string) {
  try {
    const vehicle = await db.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        trips: true,
        maintenanceLogs: true,
        fuelLogs: true,
        expenses: true,
      },
    });

    if (!vehicle) return { success: false, error: 'Vehicle not found' };

    const totalDistance = vehicle.trips.reduce((sum, t) => sum + (t.actualDistance || 0), 0);
    const totalFuelConsumed = vehicle.fuelLogs.reduce((sum, f) => sum + f.liters, 0);
    const fuelEfficiency = totalDistance > 0 ? (totalDistance / totalFuelConsumed).toFixed(2) : '0';
    const totalMaintenanceCost = vehicle.maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);
    const totalFuelCost = vehicle.fuelLogs.reduce((sum, f) => sum + f.cost, 0);
    const totalExpenses = vehicle.expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalOperationalCost = totalFuelCost + totalMaintenanceCost + totalExpenses;

    const roi = vehicle.acquisitionCost > 0
      ? ((totalDistance * 100 - totalOperationalCost) / vehicle.acquisitionCost * 100).toFixed(2)
      : '0';

    return {
      success: true,
      data: {
        vehicle: {
          name: vehicle.name,
          registrationNumber: vehicle.registrationNumber,
          odometer: vehicle.odometer,
          status: vehicle.status,
        },
        trips: {
          total: vehicle.trips.length,
          totalDistance,
        },
        fuel: {
          totalConsumed: totalFuelConsumed.toFixed(2),
          fuelEfficiency,
          totalCost: totalFuelCost,
        },
        maintenance: {
          totalLogs: vehicle.maintenanceLogs.length,
          totalCost: totalMaintenanceCost,
        },
        expenses: {
          total: totalExpenses,
        },
        financial: {
          totalOperationalCost,
          roi,
        },
      },
    };
  } catch (error) {
    return { success: false, error: 'Failed to fetch vehicle analytics' };
  }
}

export async function getMonthlyReport(year: number, month: number) {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const trips = await db.trip.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const maintenanceLogs = await db.maintenanceLog.findMany({
      where: {
        performedDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const fuelLogs = await db.fuelLog.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const expenses = await db.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalDistance = trips.reduce((sum, t) => sum + (t.actualDistance || 0), 0);
    const totalFuelConsumed = fuelLogs.reduce((sum, f) => sum + f.liters, 0);
    const totalMaintenanceCost = maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);
    const totalFuelCost = fuelLogs.reduce((sum, f) => sum + f.cost, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      success: true,
      data: {
        period: `${year}-${String(month).padStart(2, '0')}`,
        trips: trips.length,
        distance: totalDistance,
        fuel: {
          consumed: totalFuelConsumed.toFixed(2),
          cost: totalFuelCost,
        },
        maintenance: {
          logs: maintenanceLogs.length,
          cost: totalMaintenanceCost,
        },
        expenses: totalExpenses,
        totalCost: totalFuelCost + totalMaintenanceCost + totalExpenses,
      },
    };
  } catch (error) {
    return { success: false, error: 'Failed to fetch monthly report' };
  }
}

export async function generateCSVExport() {
  try {
    const vehicles = await db.vehicle.findMany({
      include: {
        trips: true,
        maintenanceLogs: true,
        fuelLogs: true,
      },
    });

    let csv = 'Registration Number,Name,Type,Total Trips,Total Distance,Total Fuel Cost,Total Maintenance Cost\n';

    for (const vehicle of vehicles) {
      const totalDistance = vehicle.trips.reduce((sum, t) => sum + (t.actualDistance || 0), 0);
      const totalFuelCost = vehicle.fuelLogs.reduce((sum, f) => sum + f.cost, 0);
      const totalMaintenanceCost = vehicle.maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);

      csv += `"${vehicle.registrationNumber}","${vehicle.name}","${vehicle.type}",${vehicle.trips.length},${totalDistance},${totalFuelCost},${totalMaintenanceCost}\n`;
    }

    return { success: true, data: csv };
  } catch (error) {
    return { success: false, error: 'Failed to generate CSV export' };
  }
}
