/**
 * AdminUsers — Invite user, roles, org assignment.
 * Primary: "Invite User" | Table: Name, Email, Role, Org, Status, Last Login
 * Modals: Invite dialog | Toasts: "User invited"
 */
import { useState } from "react";
import { mockAdminUsers } from "@/lib/mock-data";
import { api } from "@/lib/mock-api";
import { AdvancedFilterBar } from "@/components/AdvancedFilterBar";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Users, Loader2 } from "lucide-react";

export default function AdminUsers() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("provider");
  const [inviteOrg, setInviteOrg] = useState("org-001");
  const [loading, setLoading] = useState(false);

  const filtered = mockAdminUsers.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const handleInvite = async () => {
    setLoading(true);
    try { await api.inviteUser({ name: inviteName, email: inviteEmail, role: inviteRole, orgId: inviteOrg }); toast({ title: "User invited" }); setDialogOpen(false); }
    catch { toast({ title: "Failed to invite", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const statusColor = (s: string) => s === "active" ? "text-success bg-success/15" : s === "invited" ? "text-info bg-info/15" : "text-destructive bg-destructive/15";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-display font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage consortium users and role assignments.</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Invite User</Button>
      </div>
      <AdvancedFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search users…" />
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-muted/50">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Organization</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Last Login</th>
          </tr></thead>
          <tbody>{filtered.map(u => (
            <tr key={u.id} className="border-t border-border"><td className="px-4 py-3 text-foreground font-medium">{u.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
              <td className="px-4 py-3 capitalize text-muted-foreground">{u.role}</td>
              <td className="px-4 py-3 text-muted-foreground">{u.orgName}</td>
              <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColor(u.status)}`}>{u.status}</span></td>
              <td className="px-4 py-3 text-xs text-muted-foreground">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : "—"}</td>
            </tr>
          ))}</tbody>
        </table>
        {filtered.length === 0 && <EmptyState icon={Users} title="No users found" description="No users match your search." />}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Invite User</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5"><Label>Name</Label><Input value={inviteName} onChange={e => setInviteName(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Role</Label>
              <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground">
                <option value="patient">Patient</option><option value="provider">Provider</option><option value="consumer">Consumer</option><option value="regulator">Regulator</option><option value="admin">Admin</option>
              </select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleInvite} disabled={loading || !inviteName || !inviteEmail}>{loading && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Send Invite</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
