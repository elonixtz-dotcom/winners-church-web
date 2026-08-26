type Status = "healthy" | "attention" | "critical" | "active" | "inactive" | "pending" | "approved" | "published" | "draft";

const STYLES: Record<Status, string> = {
  healthy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  attention: "bg-amber-50 text-amber-700 border-amber-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  draft: "bg-amber-50 text-amber-700 border-amber-200",
  critical: "bg-red-50 text-red-700 border-red-200",
  inactive: "bg-muted text-muted-foreground border-border",
};

export default function StatusBadge({ status, label }: { status: Status; label?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STYLES[status]}`}>
      {label || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
