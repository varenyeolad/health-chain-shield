/**
 * ProviderPatients — Patient list with search, local mapping.
 * Primary: "View Records" per patient | Filters: search | Columns: Pseudonym, Local Name, Records, Last Activity
 * Empty state: "No patients found" | Error state: "Failed to load patients"
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockPatients } from "@/lib/mock-data";
import { AdvancedFilterBar } from "@/components/AdvancedFilterBar";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Users, ArrowRight } from "lucide-react";

export default function ProviderPatients() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const filtered = mockPatients.filter(p =>
    p.pseudonym.toLowerCase().includes(search.toLowerCase()) ||
    (p.localName && p.localName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-display font-bold text-foreground">Patients</h1>
        <p className="text-sm text-muted-foreground mt-1">Search patients by pseudonymous ID or local mapping.</p></div>
      <AdvancedFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search by ID or name…" />
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-muted/50 text-left">
            <th className="px-4 py-3 font-medium text-muted-foreground">Pseudonym</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Local Name</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Records</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Last Activity</th>
            <th className="px-4 py-3"></th>
          </tr></thead>
          <tbody>{filtered.map(p => (
            <tr key={p.id} className="border-t border-border hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-foreground">{p.pseudonym}</td>
              <td className="px-4 py-3 text-foreground">{p.localName || <span className="text-muted-foreground italic">Not mapped</span>}</td>
              <td className="px-4 py-3 text-foreground">{p.recordCount}</td>
              <td className="px-4 py-3 text-muted-foreground">{new Date(p.lastActivity).toLocaleDateString()}</td>
              <td className="px-4 py-3"><Button size="sm" variant="ghost" onClick={() => navigate(`/provider/patient/${p.id}/records`)}>View <ArrowRight className="h-3 w-3 ml-1" /></Button></td>
            </tr>
          ))}</tbody>
        </table>
        {filtered.length === 0 && <EmptyState icon={Users} title="No patients found" description="No patients match your search." />}
      </div>
    </div>
  );
}
