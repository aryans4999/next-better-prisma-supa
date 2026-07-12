'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getVehicleStats } from '@/lib/actions/vehicles';
import { getDriverStats } from '@/lib/actions/drivers';
import { getTripStats } from '@/lib/actions/trips';
import { getMaintenanceStats } from '@/lib/actions/maintenance';
import { useEffect, useState } from 'react';
import { Truck, Users, Route, Wrench } from 'lucide-react';

interface KPIData {
  vehicles: any;
  drivers: any;
  trips: any;
  maintenance: any;
  loading: boolean;
}

export function DashboardKPIs() {
  const [data, setData] = useState<KPIData>({
    vehicles: null,
    drivers: null,
    trips: null,
    maintenance: null,
    loading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [vehicleRes, driverRes, tripRes, maintenanceRes] = await Promise.all([
        getVehicleStats(),
        getDriverStats(),
        getTripStats(),
        getMaintenanceStats(),
      ]);

      setData({
        vehicles: vehicleRes.data,
        drivers: driverRes.data,
        trips: tripRes.data,
        maintenance: maintenanceRes.data,
        loading: false,
      });
    };

    fetchStats();
  }, []);

  if (data.loading) {
    return (
      <div className="grid gap-4 md:grid-cols-4 p-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card animate-pulse">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium h-4 bg-muted rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/3 mb-2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-4 p-4 lg:p-6">
      {/* Vehicles Card */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Vehicles</CardTitle>
          <Truck className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{data.vehicles?.available}</div>
          <p className="text-xs text-muted-foreground">
            {data.vehicles?.total} total vehicles
          </p>
          <div className="text-xs text-muted-foreground mt-2">
            <div>On Trip: {data.vehicles?.onTrip}</div>
            <div>In Shop: {data.vehicles?.inShop}</div>
          </div>
        </CardContent>
      </Card>

      {/* Drivers Card */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Drivers</CardTitle>
          <Users className="h-4 w-4 text-secondary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-secondary">{data.drivers?.available}</div>
          <p className="text-xs text-muted-foreground">
            {data.drivers?.total} total drivers
          </p>
          <div className="text-xs text-muted-foreground mt-2">
            <div>On Trip: {data.drivers?.onTrip}</div>
            <div>Suspended: {data.drivers?.suspended}</div>
          </div>
        </CardContent>
      </Card>

      {/* Trips Card */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
          <Route className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{data.trips?.dispatched}</div>
          <p className="text-xs text-muted-foreground">
            {data.trips?.completed} completed trips
          </p>
          <div className="text-xs text-muted-foreground mt-2">
            <div>Fuel Eff: {data.trips?.fuelEfficiency} km/l</div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Card */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
          <Wrench className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{data.maintenance?.open}</div>
          <p className="text-xs text-muted-foreground">
            {data.maintenance?.total} total logs
          </p>
          <div className="text-xs text-muted-foreground mt-2">
            <div>Cost: ₹{(data.maintenance?.totalCost || 0).toLocaleString()}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
