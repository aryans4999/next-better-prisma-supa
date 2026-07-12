const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  try {
    // Create vehicles
    const vehiclesData = [
      {
        registrationNumber: 'TRN-001',
        name: 'Cargo Truck 1',
        type: 'Truck',
        maxLoadCapacity: 5000,
        odometer: 45230,
        acquisitionCost: 250000,
        status: 'AVAILABLE',
      },
      {
        registrationNumber: 'TRN-002',
        name: 'Delivery Van 1',
        type: 'Van',
        maxLoadCapacity: 2000,
        odometer: 32100,
        acquisitionCost: 120000,
        status: 'ON_TRIP',
      },
      {
        registrationNumber: 'TRN-003',
        name: 'Cargo Truck 2',
        type: 'Truck',
        maxLoadCapacity: 5000,
        odometer: 67800,
        acquisitionCost: 250000,
        status: 'IN_SHOP',
      },
      {
        registrationNumber: 'TRN-004',
        name: 'Pickup Truck',
        type: 'Pickup',
        maxLoadCapacity: 1500,
        odometer: 12450,
        acquisitionCost: 85000,
        status: 'AVAILABLE',
      },
      {
        registrationNumber: 'TRN-005',
        name: 'Flatbed Truck',
        type: 'Truck',
        maxLoadCapacity: 8000,
        odometer: 89320,
        acquisitionCost: 320000,
        status: 'AVAILABLE',
      },
    ];

    for (const vehicle of vehiclesData) {
      await prisma.vehicle.upsert({
        where: { registrationNumber: vehicle.registrationNumber },
        update: {},
        create: vehicle,
      });
    }
    console.log('Created/updated vehicles');

    // Create drivers
    const driversData = [
      {
        name: 'Rajesh Kumar',
        licenseNumber: 'DL-2024-001',
        licenseCategory: 'HCV',
        licenseExpiry: new Date('2026-12-31'),
        contact: '+91-9876543210',
        safetyScore: 95,
        status: 'AVAILABLE',
      },
      {
        name: 'Amit Singh',
        licenseNumber: 'DL-2024-002',
        licenseCategory: 'HCV',
        licenseExpiry: new Date('2025-08-15'),
        contact: '+91-9876543211',
        safetyScore: 88,
        status: 'ON_TRIP',
      },
      {
        name: 'Vikram Patel',
        licenseNumber: 'DL-2024-003',
        licenseCategory: 'HCV',
        licenseExpiry: new Date('2027-06-30'),
        contact: '+91-9876543212',
        safetyScore: 92,
        status: 'AVAILABLE',
      },
      {
        name: 'Mohammed Hassan',
        licenseNumber: 'DL-2024-004',
        licenseCategory: 'MCV',
        licenseExpiry: new Date('2025-04-20'),
        contact: '+91-9876543213',
        safetyScore: 85,
        status: 'AVAILABLE',
      },
      {
        name: 'Suresh Reddy',
        licenseNumber: 'DL-2024-005',
        licenseCategory: 'HCV',
        licenseExpiry: new Date('2024-11-10'),
        contact: '+91-9876543214',
        safetyScore: 78,
        status: 'SUSPENDED',
        suspendedReason: 'License expired',
      },
    ];

    for (const driver of driversData) {
      await prisma.driver.upsert({
        where: { licenseNumber: driver.licenseNumber },
        update: {},
        create: driver,
      });
    }
    console.log('Created/updated drivers');

    // Get vehicles and drivers for relationships
    const vehicles = await prisma.vehicle.findMany({ take: 5 });
    const drivers = await prisma.driver.findMany({ take: 5 });

    if (vehicles.length > 0 && drivers.length > 0) {
      // Create trips
      const tripsData = [
        {
          source: 'Mumbai',
          destination: 'Delhi',
          vehicleId: vehicles[1]?.id,
          driverId: drivers[1]?.id,
          cargoWeight: 1800,
          plannedDistance: 1400,
          actualDistance: 1405,
          fuelConsumed: 280,
          status: 'COMPLETED',
          dispatchedAt: new Date('2024-12-15 08:00:00'),
          completedAt: new Date('2024-12-18 14:30:00'),
        },
        {
          source: 'Bangalore',
          destination: 'Hyderabad',
          vehicleId: vehicles[0]?.id,
          driverId: drivers[0]?.id,
          cargoWeight: 4500,
          plannedDistance: 580,
          actualDistance: null,
          fuelConsumed: null,
          status: 'DISPATCHED',
          dispatchedAt: new Date('2024-12-19 10:00:00'),
          completedAt: null,
        },
        {
          source: 'Chennai',
          destination: 'Bangalore',
          vehicleId: vehicles[3]?.id,
          driverId: drivers[2]?.id,
          cargoWeight: 1200,
          plannedDistance: 350,
          actualDistance: null,
          fuelConsumed: null,
          status: 'DRAFT',
          dispatchedAt: null,
          completedAt: null,
        },
      ];

      for (const trip of tripsData) {
        await prisma.trip.create({
          data: trip,
        });
      }
      console.log('Created trips');

      // Create maintenance logs
      const maintenanceData = [
        {
          vehicleId: vehicles[2]?.id,
          description: 'Engine oil change and filter replacement',
          cost: 5000,
          performedDate: new Date('2024-12-10'),
          status: 'CLOSED',
          closedDate: new Date('2024-12-10'),
        },
        {
          vehicleId: vehicles[0]?.id,
          description: 'Brake pad replacement and alignment check',
          cost: 8500,
          performedDate: new Date('2024-12-12'),
          status: 'OPEN',
          closedDate: null,
        },
        {
          vehicleId: vehicles[4]?.id,
          description: 'Tire rotation and pressure check',
          cost: 3200,
          performedDate: new Date('2024-12-18'),
          status: 'CLOSED',
          closedDate: new Date('2024-12-18'),
        },
      ];

      for (const maintenance of maintenanceData) {
        await prisma.maintenanceLog.create({
          data: maintenance,
        });
      }
      console.log('Created maintenance logs');

      // Create fuel logs
      const fuelData = [
        { vehicleId: vehicles[0]?.id, tripId: null, liters: 50, cost: 5500 },
        { vehicleId: vehicles[1]?.id, tripId: null, liters: 45, cost: 4950 },
        { vehicleId: vehicles[3]?.id, tripId: null, liters: 30, cost: 3300 },
        { vehicleId: vehicles[4]?.id, tripId: null, liters: 60, cost: 6600 },
      ];

      for (const fuel of fuelData) {
        await prisma.fuelLog.create({
          data: fuel,
        });
      }
      console.log('Created fuel logs');

      // Create expenses
      const expensesData = [
        {
          vehicleId: vehicles[0]?.id,
          type: 'Insurance',
          amount: 15000,
          date: new Date('2024-12-01'),
          description: 'Annual insurance premium',
        },
        {
          vehicleId: vehicles[1]?.id,
          type: 'Repair',
          amount: 8000,
          date: new Date('2024-12-05'),
          description: 'Suspension repair',
        },
        {
          vehicleId: vehicles[2]?.id,
          type: 'Maintenance',
          amount: 5000,
          date: new Date('2024-12-10'),
          description: 'Regular maintenance',
        },
        {
          vehicleId: vehicles[3]?.id,
          type: 'Insurance',
          amount: 8000,
          date: new Date('2024-12-01'),
          description: 'Annual insurance premium',
        },
        {
          vehicleId: vehicles[4]?.id,
          type: 'Repair',
          amount: 12000,
          date: new Date('2024-12-08'),
          description: 'Engine repair',
        },
      ];

      for (const expense of expensesData) {
        await prisma.expense.create({
          data: expense,
        });
      }
      console.log('Created expenses');
    }

    console.log('Seed data created successfully!');
  } catch (error) {
    console.error('Seeding error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
