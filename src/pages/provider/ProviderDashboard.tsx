import { mockRecords, mockAuditLog, mockOrganizations } from "@/lib/mock-data";
import { useAuth } from "@/contexts/AuthContext";
import { StatusBadge } from "@/components/StatusBadge";
import { OrgBadge } from "@/components/OrgBadge";
import { FileText, Users, Inbox, Activity, TrendingUp } from "lucide-react";

export default function ProviderDashboard() {
  const { user } = useAuth();

  const stats = [
    { label: "Records Registered", value: mockRecords.length, icon: FileText },
    { label: "Patients", value: 128, icon: Users },
    { label: "Pending Requests", value: 3, icon: Inbox },
    { label: "Access Events Today", value: 12, icon: Activity },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Provider Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {user?.orgName || "Mercy General Hospital"} · Manage patient records and access requests
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

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">Recent Registrations</h2>
          <div className="space-y-3">
            {mockRecords.slice(0, 4).map(r => (
              <div key={r.record_id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{r.title}</p>
                  <p className="text-xs text-muted-foreground">Patient {r.patient_id}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">Network Status</h2>
          <div className="space-y-3">
            {mockOrganizations.slice(0, 4).map(org => (
              <div key={org.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                <OrgBadge org={org} />
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  org.node_status === "active" ? "bg-success/15 text-success" :
                  org.node_status === "syncing" ? "bg-warning/15 text-warning-foreground" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {org.node_status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
