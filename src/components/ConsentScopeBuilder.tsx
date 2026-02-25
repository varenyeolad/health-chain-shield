/**
 * ConsentScopeBuilder — Granular consent scope selector.
 * Used in: consent grant wizard, request access wizard.
 * Controls: record type checkboxes, date range, purpose text.
 */
import { useState } from "react";
import { RECORD_TYPE_LABELS, type RecordType } from "@/types/medical";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

export interface ConsentScope {
  types: RecordType[];
  from: string;
  to: string;
  purpose: string;
}

interface ConsentScopeBuilderProps {
  value: ConsentScope;
  onChange: (scope: ConsentScope) => void;
}

const ALL_TYPES = Object.keys(RECORD_TYPE_LABELS) as RecordType[];

export function ConsentScopeBuilder({ value, onChange }: ConsentScopeBuilderProps) {
  const toggle = (type: RecordType) => {
    const types = value.types.includes(type)
      ? value.types.filter(t => t !== type)
      : [...value.types, type];
    onChange({ ...value, types });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Record Types</Label>
        <p className="text-xs text-muted-foreground mb-2">Select which types of records this consent covers.</p>
        <div className="grid grid-cols-2 gap-2">
          {ALL_TYPES.map(type => (
            <label key={type} className="flex items-center gap-2 rounded-md border border-border p-2 cursor-pointer hover:bg-accent/50 transition-colors">
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
    </div>
  );
}
