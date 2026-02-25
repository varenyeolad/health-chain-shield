import { useAuth } from "@/contexts/AuthContext";
import { Search, Shield, Download, ScrollText } from "lucide-react";

export default function ConsumerDashboard() {
  const { user } = useAuth();

  const stats = [
    { label: "Active Access Grants", value: 4, icon: Shield },
    { label: "Pending Requests", value: 2, icon: Search },
    { label: "Retrieved Records", value: 18, icon: Download },
    { label: "Audit Entries", value: 31, icon: ScrollText },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Consumer Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {user?.orgName || "Metro Health Network"} · Request and retrieve patient records securely
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="rounded-lg border border-border bg-card p-4">
            <stat.icon className="h-4 w-4 text-muted-foreground" />
            <p className="mt-3 text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <Search className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-medium text-foreground">Search for Patient Records</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Use Patient Search to find records by pseudonymous ID, then request access through the consent workflow.
        </p>
      </div>
    </div>
  );
}
