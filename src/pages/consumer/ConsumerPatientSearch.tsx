/**
 * ConsumerPatientSearch, ConsumerRequestAccess, ConsumerRetrieve, ConsumerAudit
 * + RegulatorAudit, RegulatorCompliance
 * + AdminOrganizations, AdminNetwork, AdminPolicies, AdminUsers
 */
import { useState } from "react";
import { mockPatients, mockAccessRequests, mockRecords } from "@/lib/mock-data";
import { api } from "@/lib/mock-api";
import { AdvancedFilterBar } from "@/components/AdvancedFilterBar";
import { EmptyState } from "@/components/EmptyState";
import { ConsentScopeBuilder, type ConsentScope } from "@/components/ConsentScopeBuilder";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RECORD_TYPE_LABELS, type RecordType } from "@/types/medical";
import { Search, Shield, ArrowRight, Loader2 } from "lucide-react";

export default function ConsumerPatientSearch() {
  const [search, setSearch] = useState("");
  const filtered = mockPatients.filter(p => p.pseudonym.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-display font-bold text-foreground">Patient Search</h1>
        <p className="text-sm text-muted-foreground mt-1">Search by pseudonymous patient ID.</p></div>
      <AdvancedFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Enter patient pseudonym (e.g., PAT-A7X9K2)…" />
      {search ? (
        <div className="space-y-3">{filtered.length === 0 ? <EmptyState icon={Search} title="No patients found" description="No patients match this pseudonym." /> :
          filtered.map(p => (
            <div key={p.id} className="rounded-lg border border-border bg-card p-4 flex items-center justify-between">
              <div><p className="text-sm font-mono font-medium text-foreground">{p.pseudonym}</p>
                <p className="text-xs text-muted-foreground">{p.recordCount} records · Last activity: {new Date(p.lastActivity).toLocaleDateString()}</p></div>
              <Button size="sm" variant="outline" onClick={() => window.location.href = "/consumer/request-access"}>
                <Shield className="h-3.5 w-3.5 mr-1" /> Request Access
              </Button>
            </div>
          ))}</div>
      ) : <div className="text-center py-12 text-sm text-muted-foreground">Enter a patient pseudonym to search.</div>}
    </div>
  );
}
