import { useState } from "react";
import { Bell, Check } from "lucide-react";
import type { AttentionItem, AttentionSeverity } from "@/components/dashboard/AttentionList";

const DOT: Record<AttentionSeverity, string> = {
  critical: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-blue-500",
  success: "bg-emerald-500",
};

export default function NotificationBell({ items }: { items: AttentionItem[] }) {
  const [open, setOpen] = useState(false);
  const actionable = items.filter((i) => i.severity !== "success");

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-2 text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {actionable.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white">
            {actionable.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] rounded-2xl border border-border/40 bg-card shadow-xl z-50 overflow-hidden animate-fade-in-up">
            <div className="px-4 py-3 border-b border-border/40">
              <h3 className="text-sm font-bold text-foreground">Notifications</h3>
              <p className="text-[11px] text-muted-foreground">Real items pulled from your current data</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-4 py-6 text-center text-xs text-muted-foreground">Nothing to show right now.</p>
              ) : (
                items.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      item.onAction?.();
                      setOpen(false);
                    }}
                    disabled={!item.onAction}
                    className="w-full flex items-start gap-3 px-4 py-3 text-left border-b border-border/20 last:border-0 hover:bg-muted/40 transition-colors disabled:cursor-default"
                  >
                    {item.severity === "success" ? (
                      <Check className="h-3.5 w-3.5 mt-0.5 text-emerald-500 shrink-0" />
                    ) : (
                      <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${DOT[item.severity]}`} />
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-foreground">{item.title}</div>
                      <div className="text-[11px] text-muted-foreground">{item.description}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
