/**
 * MaintenanceMode — Full-screen maintenance overlay.
 */
import { Wrench } from "lucide-react";

interface MaintenanceModeProps {
  estimatedReturn?: string;
}

export function MaintenanceMode({ estimatedReturn }: MaintenanceModeProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center max-w-md px-6 animate-fade-in">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Wrench className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">Scheduled Maintenance</h1>
        <p className="text-sm text-muted-foreground mb-4">
          MedChain is currently undergoing scheduled maintenance. All data remains secure and tamper-evident on the immutable ledger.
        </p>
        {estimatedReturn && (
          <p className="text-sm text-foreground font-medium">
            Estimated return: {estimatedReturn}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-6">
          If this is urgent, contact your system administrator. No data is at risk during maintenance.
        </p>
      </div>
    </div>
  );
}
