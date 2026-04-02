/**
 * Enhanced AdminDashboard — KPIs: node health, org status, user growth, policy adoption, failure injection.
 */
import { mockOrganizations, mockAdminUsers, mockPolicyTemplates, mockMetrics } from "@/lib/mock-data";
import { OrgBadge } from "@/components/OrgBadge";
import { Link } from "react-router-dom";
import { Building2, Users, Network, BookOpen, Activity, TrendingUp, Clock, BarChart3 } from "lucide-react";

export default function AdminDashboard() {
  const activeNodes = mockOrganizations.filter(o => o.node_status === "active").length;
  const activeUsers = mockAdminUsers.filter(u => u.status === "active").length;

  const stats = [
    { label: "Organizations", value: mockOrganizations.length, icon: Building2, sub: `${activeNodes} active nodes`, link: "/admin/organizations" },
    { label: "Active Users", value: activeUsers, icon: Users, sub: `${mockAdminUsers.filter(u => u.status === "invited").length} invited`, link: "/admin/users" },
    { label: "Network Nodes", value: mockOrganizations.length, icon: Network, sub: `${mockOrganizations.filter(o => o.node_status !== "active").length} issues`, link: "/admin/network" },
    { label: "Policy Templates", value: mockPolicyTemplates.length, icon: BookOpen, sub: `${mockPolicyTemplates.filter(p => p.isDefault).length} defaults`, link: "/admin/policies" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Consortium management, system health, and platform metrics.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <Link key={stat.label} to={stat.link} className="rounded-lg border border-border bg-card p-4 hover:shadow-md transition-all">
            <stat.icon className="h-4 w-4 text-muted-foreground" />
            <p className="mt-3 text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{stat.sub}</p>
          </Link>
        ))}
      </div>

      {/* System Metrics */}
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">System Metrics</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Avg Registration Time", value: mockMetrics.avgRegistrationTime, icon: Clock },
            { label: "Avg Retrieval Latency", value: mockMetrics.avgRetrievalLatency, icon: Activity },
            { label: "Failed Request Rate", value: mockMetrics.failedRequestRate, icon: TrendingUp },
            { label: "Audit Completeness", value: mockMetrics.auditLogCompleteness, icon: BarChart3 },
            { label: "Simulated Throughput", value: mockMetrics.simulatedThroughput, icon: Activity },
            { label: "Total Records", value: mockMetrics.totalRecords.toLocaleString(), icon: Building2 },
            { label: "Total Consents", value: mockMetrics.totalConsents.toLocaleString(), icon: Users },
            { label: "Total Audit Events", value: mockMetrics.totalAuditEvents.toLocaleString(), icon: Network },
          ].map(m => (
            <div key={m.label} className="rounded-lg border border-border bg-card p-4">
              <m.icon className="h-4 w-4 text-muted-foreground mb-2" />
              <p className="text-lg font-bold text-foreground">{m.value}</p>
              <p className="text-xs text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Organizations</h2>
        <div className="space-y-3">
          {mockOrganizations.map(org => (
            <div key={org.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
              <OrgBadge org={org} />
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground capitalize">{org.type}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${org.node_status === "active" ? "bg-success/15 text-success" : org.node_status === "syncing" ? "bg-warning/15 text-warning-foreground" : "bg-muted text-muted-foreground"}`}>
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
