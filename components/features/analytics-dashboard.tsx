'use client';

import { useEffect, useState } from 'react';
import { getFleetReport } from '@/lib/actions/reports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface FleetData {
  fleet: { totalVehicles: number; totalDrivers: number };
  trips: { total: number; completed: number; pending: number; totalDistance: number };
  fuel: { totalConsumed: string; fuelEfficiency: string; totalCost: number };
  maintenance: { totalLogs: number; totalCost: number };
  expenses: { total: number; maintenance: number; fuel: number };
  summary: { totalOperationalCost: number; costPerVehicle: string; costPerTrip: string };
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<FleetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      const result = await getFleetReport();
      if (result.success && result.data) {
        setData(result.data as FleetData);
      }
      setLoading(false);
    };
    fetchReport();
  }, []);

  if (loading) {
    return <div className="text-muted-foreground">Loading analytics...</div>;
  }

  if (!data) {
    return <div className="text-muted-foreground">No data available</div>;
  }

  const expenseData = [
    { name: 'Fuel', value: data.expenses.fuel },
    { name: 'Maintenance', value: data.expenses.maintenance },
  ];

  const COLORS = ['#ff8c42', '#00bcd4'];

  const chartData = [
    {
      name: 'Total Trips',
      value: data.trips.total,
    },
    {
      name: 'Completed',
      value: data.trips.completed,
    },
    {
      name: 'Pending',
      value: data.trips.pending,
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{data.fleet.totalVehicles}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{data.fleet.totalDrivers}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Distance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{data.trips.totalDistance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">km</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fuel Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{data.fuel.fuelEfficiency}</div>
            <p className="text-xs text-muted-foreground">km/l</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Trip Status Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Trip Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" fill="#ff8c42" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ₹${value.toLocaleString()}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value: any) => `₹${(value || 0).toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="border border-border rounded-lg p-4 bg-background">
              <p className="text-xs text-muted-foreground mb-2">Total Operational Cost</p>
              <p className="text-2xl font-bold text-primary">
                ₹{data.summary.totalOperationalCost.toLocaleString()}
              </p>
            </div>

            <div className="border border-border rounded-lg p-4 bg-background">
              <p className="text-xs text-muted-foreground mb-2">Cost Per Vehicle</p>
              <p className="text-2xl font-bold text-secondary">
                ₹{Number(data.summary.costPerVehicle).toLocaleString()}
              </p>
            </div>

            <div className="border border-border rounded-lg p-4 bg-background">
              <p className="text-xs text-muted-foreground mb-2">Cost Per Trip</p>
              <p className="text-2xl font-bold text-primary">
                ₹{Number(data.summary.costPerTrip).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm">Fuel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Consumed</p>
                <p className="text-lg font-bold text-foreground">{data.fuel.totalConsumed} liters</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cost</p>
                <p className="text-lg font-bold text-primary">₹{data.fuel.totalCost.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm">Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Logs</p>
                <p className="text-lg font-bold text-foreground">{data.maintenance.totalLogs}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cost</p>
                <p className="text-lg font-bold text-primary">
                  ₹{data.maintenance.totalCost.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm">Trips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg font-bold text-foreground">{data.trips.total}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-lg font-bold text-primary">{data.trips.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
