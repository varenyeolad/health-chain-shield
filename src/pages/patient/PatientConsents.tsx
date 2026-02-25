import { useState } from "react";
import { mockConsents } from "@/lib/mock-data";
import { ConsentCard } from "@/components/ConsentCard";
import type { ConsentStatus } from "@/types/medical";

const TABS: { label: string; filter: ConsentStatus | "all" }[] = [
  { label: "All", filter: "all" },
  { label: "Active", filter: "ACTIVE" },
  { label: "Pending", filter: "PENDING" },
  { label: "Revoked", filter: "REVOKED" },
  { label: "Expired", filter: "EXPIRED" },
];

export default function PatientConsents() {
  const [tab, setTab] = useState<ConsentStatus | "all">("all");

  const filtered = tab === "all" ? mockConsents : mockConsents.filter(c => c.status === tab);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Consent Policies</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage who can access your medical records and for what purpose.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map(t => (
          <button
            key={t.filter}
            onClick={() => setTab(t.filter)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.filter
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            <span className="ml-1.5 text-xs text-muted-foreground">
              ({t.filter === "all" ? mockConsents.length : mockConsents.filter(c => c.status === t.filter).length})
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(c => (
          <ConsentCard key={c.policy_id} consent={c} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No consent policies in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
