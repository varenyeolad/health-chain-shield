import { useState } from "react";
import { mockRecords } from "@/lib/mock-data";
import { RecordCard } from "@/components/RecordCard";
import { HashVerification } from "@/components/HashVerification";
import { StatusBadge } from "@/components/StatusBadge";
import { RECORD_TYPE_LABELS } from "@/types/medical";
import type { RecordMeta, RecordType } from "@/types/medical";
import { Search, Filter, X, ArrowLeft, ExternalLink, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function PatientRecords() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<RecordType | "all">("all");
  const [selectedRecord, setSelectedRecord] = useState<RecordMeta | null>(null);

  const filtered = mockRecords.filter(r => {
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== "all" && r.type !== typeFilter) return false;
    return true;
  });

  const types = Object.keys(RECORD_TYPE_LABELS) as RecordType[];

  if (selectedRecord) {
    const date = new Date(selectedRecord.created_at).toLocaleString("en-US", {
      month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedRecord(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Records
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">{selectedRecord.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{selectedRecord.owner_org} · {date}</p>
          </div>
          <StatusBadge status={selectedRecord.status} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <h3 className="text-sm font-medium text-foreground">Record Metadata</h3>
              {[
                ["Record ID", selectedRecord.record_id],
                ["Type", RECORD_TYPE_LABELS[selectedRecord.type]],
                ["FHIR Resource", selectedRecord.fhir_resource || "N/A"],
                ["Owner Organization", selectedRecord.owner_org],
                ["Created", date],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-foreground font-medium">{value}</span>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <h3 className="text-sm font-medium text-foreground">Off-Chain Location</h3>
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-muted rounded p-2">
                <ExternalLink className="h-3 w-3 shrink-0" />
                <span className="truncate">{selectedRecord.uri_offchain}</span>
                <button className="shrink-0 text-primary hover:text-primary/80"><Copy className="h-3 w-3" /></button>
              </div>
              <p className="text-xs text-muted-foreground">
                Medical content is stored encrypted off-chain. Only the metadata anchor is on the immutable ledger.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <HashVerification
              expected={selectedRecord.hash_offchain}
              actual={selectedRecord.hash_offchain}
              status="match"
            />
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="text-sm font-medium text-foreground mb-3">Who Can Access</h3>
              <p className="text-xs text-muted-foreground">
                Based on your active consent policies, this record may be accessible to organizations with matching data scope permissions.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Medical Records</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {filtered.length} records anchored on the immutable ledger
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search records…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setTypeFilter("all")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              typeFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            All
          </button>
          {types.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                typeFilter === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {RECORD_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Records */}
      <div className="space-y-3">
        {filtered.map(r => (
          <RecordCard key={r.record_id} record={r} onClick={() => setSelectedRecord(r)} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No records found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
