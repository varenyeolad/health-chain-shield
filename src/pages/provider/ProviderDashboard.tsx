/**
 * Enhanced ProviderDashboard — KPIs: records today, pending jobs, failed subs, avg tx time.
 */
import { mockRecords, mockAuditLog, mockOrganizations, mockIntegrations, mockProviderRequests, mockFhirMappings } from "@/lib/mock-data";
import { useAuth } from "@/contexts/AuthContext";
import { StatusBadge } from "@/components/StatusBadge";
import { OrgBadge } from "@/components/OrgBadge";
import { Link } from "react-router-dom";
import { FileText, Users, Inbox, Activity, CheckCircle2, XCircle, Clock, Settings2 } from "lucide-react";

export default function ProviderDashboard() {
  const { user } = useAuth();
  const providerOrg = user?.orgName || "Mercy General Hospital";
  const orgRecords = mockRecords.filter(r => r.owner_org === providerOrg);
  const committed = orgRecords.filter(r => r.status === "COMMITTED").length;
  const pending = orgRecords.filter(r => r.status === "PENDING_ENDORSEMENT").length;
  const pendingRequests = mockProviderRequests.filter(r => r.status === "pending_mediation").length;
  const failedJobs = mockIntegrations.reduce((acc, i) => acc + i.failed, 0);
  const mappingIssues = mockFhirMappings.filter(m => m.mappingStatus !== "mapped").length;

  const stats = [
    { label: "Records Anchored", value: committed, icon: FileText, sub: `${pending} pending endorsement`, link: "/provider/patients" },
    { label: "Pending Requests", value: pendingRequests, icon: Inbox, sub: "Awaiting mediation", link: "/provider/requests", alert: pendingRequests > 0 },
    { label: "Access Events Served", value: mockAuditLog.filter(a => orgRecords.some(r => r.record_id === a.record_id)).length, icon: Activity, sub: "Last 30 days", link: "/provider/audit" },
    { label: "Integration Issues", value: failedJobs + mappingIssues, icon: Settings2, sub: `${failedJobs} failed, ${mappingIssues} mapping`, link: "/provider/integrations", alert: failedJobs > 0 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Provider Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {providerOrg} · Manage patient records, access requests, and integration health.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <Link key={stat.label} to={stat.link} className={`rounded-lg border bg-card p-4 hover:shadow-md transition-all ${stat.alert ? "border-warning/30 bg-warning/5" : "border-border"}`}>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
            <p className="mt-3 text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{stat.sub}</p>
          </Link>
        ))}
      </div>

      {/* FHIR Mapping Overview */}
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">FHIR Mapping Status</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {mockFhirMappings.slice(0, 4).map(m => (
            <div key={m.recordType} className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-foreground capitalize">{m.recordType.replace("_", " ")}</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${m.mappingStatus === "mapped" ? "bg-success/15 text-success" : m.mappingStatus === "partial" ? "bg-warning/15 text-warning-foreground" : "bg-destructive/15 text-destructive"}`}>
                  {m.mappingStatus}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">{m.fhirResource} · {m.fieldsCovered}/{m.totalFields} fields</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">Recent Registrations</h2>
          <div className="space-y-3">
            {orgRecords.slice(0, 4).map(r => (
              <div key={r.record_id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{r.title}</p>
                  <p className="text-xs text-muted-foreground">Patient {r.patient_id} · {r.fhir_resource || "N/A"}</p>
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
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${org.node_status === "active" ? "bg-success/15 text-success" : org.node_status === "syncing" ? "bg-warning/15 text-warning-foreground" : "bg-muted text-muted-foreground"}`}>
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
