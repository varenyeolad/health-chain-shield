import { cn } from "@/lib/utils";
import type { RecordMeta } from "@/types/medical";
import { RECORD_TYPE_LABELS } from "@/types/medical";
import { StatusBadge } from "./StatusBadge";
import { FileText, Image, Pill, Stethoscope, Syringe, AlertCircle, FileCheck, ArrowRight } from "lucide-react";

const TYPE_ICONS: Record<string, React.ElementType> = {
  lab_result: FileCheck,
  imaging: Image,
  clinical_note: FileText,
  prescription: Pill,
  discharge_summary: FileText,
  referral: ArrowRight,
  immunization: Syringe,
  allergy_list: AlertCircle,
};

interface RecordCardProps {
  record: RecordMeta;
  onClick?: () => void;
  className?: string;
}

export function RecordCard({ record, onClick, className }: RecordCardProps) {
  const Icon = TYPE_ICONS[record.type] || Stethoscope;
  const date = new Date(record.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full text-left rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md hover:border-primary/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium text-sm truncate text-foreground">{record.title}</h3>
            <StatusBadge status={record.status} />
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{RECORD_TYPE_LABELS[record.type]}</span>
            <span>·</span>
            <span>{record.owner_org}</span>
            <span>·</span>
            <span>{date}</span>
          </div>
          {record.tags && record.tags.length > 0 && (
            <div className="mt-2 flex gap-1.5">
              {record.tags.map(tag => (
                <span key={tag} className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
      </div>
    </button>
  );
}
