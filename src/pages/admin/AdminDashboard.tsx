import { mockOrganizations } from "@/lib/mock-data";
import { OrgBadge } from "@/components/OrgBadge";
import { Building2, Users, Network, BookOpen } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { label: "Organizations", value: mockOrganizations.length, icon: Building2 },
    { label: "Active Users", value: 342, icon: Users },
    { label: "Network Nodes", value: 12, icon: Network },
    { label: "Policy Templates", value: 8, icon: BookOpen },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Consortium management and system administration</p>
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

      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Organizations</h2>
        <div className="space-y-3">
          {mockOrganizations.map(org => (
            <div key={org.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
              <OrgBadge org={org} />
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground capitalize">{org.type}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  org.node_status === "active" ? "bg-success/15 text-success" :
                  org.node_status === "syncing" ? "bg-warning/15 text-warning-foreground" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {org.node_status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
