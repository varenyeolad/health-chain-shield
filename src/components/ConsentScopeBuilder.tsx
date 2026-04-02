/**
 * ConsentScopeBuilder — Advanced granular consent scope selector.
 * Features: record type, provider org, date range, purpose, duration presets,
 * partial consent, conditions, risk explanation, what-visible/what-hidden panels.
 */
import { useState } from "react";
import { RECORD_TYPE_LABELS, type RecordType } from "@/types/medical";
import { mockOrganizations } from "@/lib/mock-data";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, AlertTriangle, Info } from "lucide-react";

export interface ConsentScope {
  types: RecordType[];
  from: string;
  to: string;
  purpose: string;
  duration?: string;
  conditions?: {
    notifyOnAccess: boolean;
    activeTreatmentOnly: boolean;
    singleOrgOnly: boolean;
  };
}

interface ConsentScopeBuilderProps {
  value: ConsentScope;
  onChange: (scope: ConsentScope) => void;
  showAdvanced?: boolean;
}

const ALL_TYPES = Object.keys(RECORD_TYPE_LABELS) as RecordType[];
const DURATION_PRESETS = [
  { value: "one-time", label: "One-time access" },
  { value: "24h", label: "24 hours" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "indefinite", label: "Until revoked" },
  { value: "custom", label: "Custom dates" },
];

export function ConsentScopeBuilder({ value, onChange, showAdvanced = true }: ConsentScopeBuilderProps) {
  const [showConditions, setShowConditions] = useState(false);

  const toggle = (type: RecordType) => {
    const types = value.types.includes(type)
      ? value.types.filter(t => t !== type)
      : [...value.types, type];
    onChange({ ...value, types });
  };

  const conditions = value.conditions || { notifyOnAccess: false, activeTreatmentOnly: false, singleOrgOnly: false };
  const updateCondition = (key: keyof typeof conditions, val: boolean) => {
    onChange({ ...value, conditions: { ...conditions, [key]: val } });
  };

  const hiddenTypes = ALL_TYPES.filter(t => !value.types.includes(t));

  return (
    <div className="space-y-5">
      {/* Record Types */}
      <div>
        <Label className="text-sm font-medium">Record Types</Label>
        <p className="text-xs text-muted-foreground mb-2">Select which types of records this consent covers.</p>
        <div className="grid grid-cols-2 gap-2">
          {ALL_TYPES.map(type => (
            <label key={type} className={`flex items-center gap-2 rounded-md border p-2 cursor-pointer transition-colors ${value.types.includes(type) ? "border-primary/40 bg-primary/5" : "border-border hover:bg-accent/50"}`}>
              <Checkbox
                checked={value.types.includes(type)}
                onCheckedChange={() => toggle(type)}
                aria-label={RECORD_TYPE_LABELS[type]}
              />
              <span className="text-xs text-foreground">{RECORD_TYPE_LABELS[type]}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Duration presets */}
      <div>
        <Label className="text-sm font-medium">Duration</Label>
        <p className="text-xs text-muted-foreground mb-2">How long should this consent remain active?</p>
        <div className="flex flex-wrap gap-2">
          {DURATION_PRESETS.map(d => (
            <button
              key={d.value}
              type="button"
              onClick={() => onChange({ ...value, duration: d.value })}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${value.duration === d.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom dates */}
      {(value.duration === "custom" || !value.duration) && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="scope-from">Valid From</Label>
            <Input id="scope-from" type="date" value={value.from} onChange={e => onChange({ ...value, from: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="scope-to">Valid Until</Label>
            <Input id="scope-to" type="date" value={value.to} onChange={e => onChange({ ...value, to: e.target.value })} />
          </div>
        </div>
      )}

      {/* Purpose */}
      <div className="space-y-1.5">
        <Label htmlFor="scope-purpose">Purpose</Label>
        <Textarea
          id="scope-purpose"
          placeholder="Describe the purpose of this access (e.g., 'Continuity of care — referral follow-up')"
          value={value.purpose}
          onChange={e => onChange({ ...value, purpose: e.target.value })}
          rows={2}
        />
      </div>

      {showAdvanced && (
        <>
          {/* Conditions */}
          <div>
            <button type="button" onClick={() => setShowConditions(!showConditions)} className="text-xs font-medium text-primary hover:underline">
              {showConditions ? "Hide" : "Show"} advanced conditions
            </button>
            {showConditions && (
              <div className="mt-3 space-y-3 rounded-lg border border-border p-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Notify me on each access</p>
                    <p className="text-xs text-muted-foreground">Receive a notification every time this organization accesses your records.</p>
                  </div>
                  <Switch checked={conditions.notifyOnAccess} onCheckedChange={v => updateCondition("notifyOnAccess", v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Active treatment only</p>
                    <p className="text-xs text-muted-foreground">Allow access only during an active treatment episode.</p>
                  </div>
                  <Switch checked={conditions.activeTreatmentOnly} onCheckedChange={v => updateCondition("activeTreatmentOnly", v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">This organization only</p>
                    <p className="text-xs text-muted-foreground">Do not extend access to affiliated organizations.</p>
                  </div>
                  <Switch checked={conditions.singleOrgOnly} onCheckedChange={v => updateCondition("singleOrgOnly", v)} />
                </div>
              </div>
            )}
          </div>

          {/* Risk explanation */}
          {value.types.length > 0 && (
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <h4 className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-info" /> What this means for your data
              </h4>

              {/* What they will see */}
              <div className="rounded-md bg-card border border-border p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Eye className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-medium text-foreground">What the organization will see</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {value.types.map(t => (
                    <span key={t} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{RECORD_TYPE_LABELS[t]}</span>
                  ))}
                </div>
              </div>

              {/* What remains hidden */}
              {hiddenTypes.length > 0 && (
                <div className="rounded-md bg-card border border-border p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">What remains hidden</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {hiddenTypes.map(t => (
                      <span key={t} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{RECORD_TYPE_LABELS[t]}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk note */}
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <AlertTriangle className="h-3.5 w-3.5 text-warning-foreground shrink-0 mt-0.5" />
                <span>Once shared, downloaded copies cannot be recalled. You can revoke future access at any time, but previously retrieved data may still exist in the organization's systems.</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
