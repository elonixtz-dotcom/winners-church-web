import { AlertTriangle, Check } from "lucide-react";

export type AttentionSeverity = "critical" | "warning" | "info" | "success";

export interface AttentionItem {
  severity: AttentionSeverity;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const DOT: Record<AttentionSeverity, string> = {
  critical: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-blue-500",
  success: "bg-emerald-500",
};

export default function AttentionList({ items }: { items: AttentionItem[] }) {
  const hasIssues = items.some((i) => i.severity !== "success");

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${hasIssues ? "bg-destructive/[0.03] border-destructive/20" : "bg-card border-border/40"}`}>
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className={`h-4 w-4 ${hasIssues ? "text-destructive" : "text-muted-foreground"}`} />
        <h3 className="font-heading text-sm font-bold text-foreground">Attention Required</h3>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">Nothing needs your attention right now.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl bg-card/60 px-3 py-2.5">
              <span className={`h-2 w-2 rounded-full shrink-0 ${DOT[item.severity]}`} />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-foreground">{item.title}</div>
                <div className="text-[11px] text-muted-foreground">{item.description}</div>
              </div>
              {item.severity === "success" ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 shrink-0">
                  <Check className="h-3.5 w-3.5" /> Completed
                </span>
              ) : item.actionLabel && item.onAction ? (
                <button
                  onClick={item.onAction}
                  className="shrink-0 rounded-lg bg-card border border-border px-3 py-1.5 text-[11px] font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  {item.actionLabel}
                </button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
