'use client';

import { useEffect, useState } from 'react';
import { getMaintenanceLogs, closeMaintenanceLog, deleteMaintenanceLog } from '@/lib/actions/maintenance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface MaintenanceLog {
  id: string;
  vehicleId: string;
  vehicle: { name: string; registrationNumber: string };
  description: string;
  cost: number;
  performedDate: string;
  status: string;
  closedDate: string | null;
}

export function MaintenanceTable() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    const result = await getMaintenanceLogs();
    if (result.success) {
      setLogs(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleClose = async (id: string) => {
    const result = await closeMaintenanceLog(id);
    if (result.success) {
      toast.success('Maintenance log closed');
      loadLogs();
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    const result = await deleteMaintenanceLog(id);
    if (result.success) {
      toast.success('Maintenance log deleted');
      loadLogs();
    } else {
      toast.error(result.error);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'OPEN'
      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      : 'bg-green-500/20 text-green-400 border-green-500/30';
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading maintenance logs...</div>;
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Maintenance Logs</CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No maintenance logs found.
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="border border-border rounded-lg p-4 bg-background hover:bg-background/70"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Vehicle</p>
                    <p className="text-sm font-medium text-foreground">
                      {log.vehicle.name} ({log.vehicle.registrationNumber})
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(log.performedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-sm text-foreground">{log.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Cost</p>
                    <p className="text-sm font-bold text-primary">₹{log.cost.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge className={`${getStatusColor(log.status)} border mt-1`}>
                      {log.status}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="text-xs text-muted-foreground">
                    {log.closedDate && (
                      <span>Closed: {new Date(log.closedDate).toLocaleDateString()}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {log.status === 'OPEN' && (
                      <Button
                        size="sm"
                        onClick={() => handleClose(log.id)}
                        className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Close
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleDelete(log.id)}
                      className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
