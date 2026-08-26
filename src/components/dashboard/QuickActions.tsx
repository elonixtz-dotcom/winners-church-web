import type { LucideIcon } from "lucide-react";
import { Zap } from "lucide-react";

export interface QuickAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  tint?: "primary" | "emerald" | "blue" | "gold" | "violet" | "rose";
}

const TINTS: Record<NonNullable<QuickAction["tint"]>, string> = {
  primary: "bg-primary/10 text-primary hover:bg-primary/15",
  emerald: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  blue: "bg-blue-50 text-blue-700 hover:bg-blue-100",
  gold: "bg-gold/15 text-gold-foreground hover:bg-gold/25",
  violet: "bg-violet-50 text-violet-700 hover:bg-violet-100",
  rose: "bg-rose-50 text-rose-700 hover:bg-rose-100",
};

export default function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <Zap className="h-4 w-4 text-primary" />
        <h3 className="font-heading text-sm font-bold text-foreground">Quick Actions</h3>
      </div>
      <p className="text-[11px] text-muted-foreground mb-4">Get things done quickly</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={action.onClick}
              className={`flex flex-col items-center justify-center gap-2 rounded-xl py-5 text-xs font-semibold transition-colors ${TINTS[action.tint || "primary"]}`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-center leading-tight">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
