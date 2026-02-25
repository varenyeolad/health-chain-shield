/**
 * AdminOrganizations — CRUD: add org, verify identity badge, certificates.
 * Primary: "Add Organization" | Table: Name, Type, Verified, Node Status, Actions
 * Modals: Add org dialog | Toasts: "Organization added"
 */
import { useState } from "react";
import { mockOrganizations } from "@/lib/mock-data";
import { api } from "@/lib/mock-api";
import { OrgBadge } from "@/components/OrgBadge";
import { EmptyState } from "@/components/EmptyState";
import { AdvancedFilterBar } from "@/components/AdvancedFilterBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Building2, Loader2 } from "lucide-react";

export default function AdminOrganizations() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("hospital");
  const [loading, setLoading] = useState(false);

  const filtered = mockOrganizations.filter(o => o.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = async () => {
    setLoading(true);
    try { await api.addOrganization({ name, type }); toast({ title: "Organization added" }); setDialogOpen(false); setName(""); }
    catch { toast({ title: "Failed to add", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-display font-bold text-foreground">Organizations</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage consortium organizations.</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add Organization</Button>
      </div>
      <AdvancedFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search organizations…" />
      <div className="space-y-3">{filtered.map(org => (
        <div key={org.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <OrgBadge org={org} />
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground capitalize">{org.type}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${org.node_status === "active" ? "bg-success/15 text-success" : org.node_status === "syncing" ? "bg-warning/15 text-warning-foreground" : "bg-muted text-muted-foreground"}`}>{org.node_status}</span>
          </div>
        </div>
      ))}{filtered.length === 0 && <EmptyState icon={Building2} title="No organizations found" description="No organizations match your search." />}</div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Add Organization</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Organization name" /></div>
            <div className="space-y-2"><Label>Type</Label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground">
                <option value="hospital">Hospital</option><option value="clinic">Clinic</option><option value="lab">Lab</option>
                <option value="insurer">Insurer</option><option value="research">Research</option><option value="regulator">Regulator</option>
              </select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={loading || !name}>{loading && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
