/**
 * AdminPolicies — Default templates: retention, emergency, access.
 * Primary: "Create Template" | Table: Name, Description, Type, Default, Rules
 */
import { mockPolicyTemplates } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, CheckCircle2, BookOpen } from "lucide-react";

export default function AdminPolicies() {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-display font-bold text-foreground">Policy Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">Default retention, access, and emergency policy templates.</p></div>
        <Button onClick={() => toast({ title: "Create template", description: "Template creation wizard coming soon." })}><Plus className="h-4 w-4 mr-1" /> Create Template</Button>
      </div>
      <div className="space-y-3">{mockPolicyTemplates.map(p => (
        <div key={p.id} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-foreground">{p.name}</p>
              {p.isDefault && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">Default</span>}
            </div>
            <span className="text-xs text-muted-foreground capitalize bg-muted px-2 py-0.5 rounded">{p.type}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{p.description}</p>
          <ul className="space-y-1">{p.rules.map(r => <li key={r} className="text-xs text-muted-foreground flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-success shrink-0" />{r}</li>)}</ul>
        </div>
      ))}</div>
    </div>
  );
}
