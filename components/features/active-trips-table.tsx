'use client';

import { useEffect, useState } from 'react';
import { getActivaTrips, completeTrip, cancelTrip } from '@/lib/actions/trips';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState as useStateDialog } from 'react';
import { toast } from 'sonner';
import { CheckCircle, XCircle } from 'lucide-react';

interface Trip {
  id: string;
  source: string;
  destination: string;
  vehicle: { name: string; registrationNumber: string };
  driver: { name: string };
  cargoWeight: number;
  plannedDistance: number;
  status: string;
  dispatchedAt: string;
}

export function ActiveTripsTable() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingTripId, setCompletingTripId] = useState<string | null>(null);
  const [actualDistance, setActualDistance] = useState('');
  const [fuelConsumed, setFuelConsumed] = useState('');

  const loadTrips = async () => {
    setLoading(true);
    const result = await getActivaTrips();
    if (result.success) {
      setTrips(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTrips();
    const interval = setInterval(loadTrips, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleCompleteTrip = async () => {
    if (!completingTripId || !actualDistance || !fuelConsumed) {
      toast.error('Please fill all fields');
      return;
    }

    const result = await completeTrip(
      completingTripId,
      parseFloat(actualDistance),
      parseFloat(fuelConsumed)
    );

    if (result.success) {
      toast.success('Trip completed');
      setCompletingTripId(null);
      setActualDistance('');
      setFuelConsumed('');
      loadTrips();
    } else {
      toast.error(result.error);
    }
  };

  const handleCancelTrip = async (tripId: string) => {
    if (!confirm('Are you sure?')) return;
    const result = await cancelTrip(tripId);
    if (result.success) {
      toast.success('Trip cancelled');
      loadTrips();
    } else {
      toast.error(result.error);
    }
  };

  const [showCompleteForm, setShowCompleteForm] = useState(false);

  if (loading) {
    return <div className="text-muted-foreground">Loading active trips...</div>;
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Active Trips</CardTitle>
      </CardHeader>
      <CardContent>
        {trips.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No active trips. Create one to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="border border-border rounded-lg p-4 bg-background hover:bg-background/70 transition"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">From → To</p>
                    <p className="text-sm font-medium text-foreground">
                      {trip.source} → {trip.destination}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Vehicle</p>
                    <p className="text-sm font-medium text-foreground">
                      {trip.vehicle.name} ({trip.vehicle.registrationNumber})
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Driver</p>
                    <p className="text-sm font-medium text-foreground">{trip.driver.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cargo / Distance</p>
                    <p className="text-sm font-medium text-foreground">
                      {trip.cargoWeight}kg / {trip.plannedDistance}km
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 border">
                    DISPATCHED
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setCompletingTripId(trip.id);
                        setShowCompleteForm(true);
                      }}
                      className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleCancelTrip(trip.id)}
                      className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>

                {showCompleteForm && completingTripId === trip.id && (
                  <div className="mt-4 p-4 rounded-lg bg-background border border-border">
                    <h3 className="text-sm font-medium text-foreground mb-3">Complete Trip</h3>
                    <div className="space-y-3 mb-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Actual Distance (km)
                        </label>
                        <Input
                          type="number"
                          value={actualDistance}
                          onChange={(e) => setActualDistance(e.target.value)}
                          placeholder="Enter actual distance"
                          className="mt-1 bg-card border-border h-8"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Fuel Consumed (liters)
                        </label>
                        <Input
                          type="number"
                          value={fuelConsumed}
                          onChange={(e) => setFuelConsumed(e.target.value)}
                          placeholder="Enter fuel consumed"
                          className="mt-1 bg-card border-border h-8"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleCompleteTrip}
                        size="sm"
                        className="flex-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 h-8"
                      >
                        Complete
                      </Button>
                      <Button
                        onClick={() => {
                          setShowCompleteForm(false);
                          setCompletingTripId(null);
                          setActualDistance('');
                          setFuelConsumed('');
                        }}
                        size="sm"
                        className="flex-1 bg-muted text-muted-foreground hover:bg-muted/80 h-8"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
