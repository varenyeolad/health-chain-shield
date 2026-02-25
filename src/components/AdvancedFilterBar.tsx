/**
 * AdvancedFilterBar — Reusable filter bar with search, chips, and date range.
 */
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface FilterChip {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface AdvancedFilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  chips?: FilterChip[];
  chipValues?: Record<string, string>;
  onChipChange?: (key: string, value: string) => void;
  dateFrom?: string;
  dateTo?: string;
  onDateFromChange?: (v: string) => void;
  onDateToChange?: (v: string) => void;
  showDateRange?: boolean;
}

export function AdvancedFilterBar({
  search, onSearchChange, searchPlaceholder = "Search…",
  chips = [], chipValues = {}, onChipChange,
  dateFrom, dateTo, onDateFromChange, onDateToChange, showDateRange = false,
}: AdvancedFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder={searchPlaceholder} value={search} onChange={e => onSearchChange(e.target.value)} className="pl-9" />
        {search && (
          <button onClick={() => onSearchChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {chips.map(chip => (
        <select
          key={chip.key}
          value={chipValues[chip.key] || "all"}
          onChange={e => onChipChange?.(chip.key, e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground"
          aria-label={chip.label}
        >
          <option value="all">{chip.label}: All</option>
          {chip.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ))}
      {showDateRange && (
        <>
          <Input type="date" value={dateFrom || ""} onChange={e => onDateFromChange?.(e.target.value)} className="w-36 text-xs" aria-label="From date" />
          <Input type="date" value={dateTo || ""} onChange={e => onDateToChange?.(e.target.value)} className="w-36 text-xs" aria-label="To date" />
        </>
      )}
    </div>
  );
}
