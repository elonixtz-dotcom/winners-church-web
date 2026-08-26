import type { LucideIcon } from "lucide-react";
import { ArrowUp, ArrowDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  trend?: { value: number; label: string };
}

export default function StatCard({ label, value, icon: Icon, iconBg = "bg-primary/10", iconColor = "text-primary", trend }: StatCardProps) {
  return (
    <div className="bg-card rounded-2xl border border-border/40 p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold text-muted-foreground">{label}</div>
          <div className="mt-1.5 text-2xl font-bold text-foreground">{value}</div>
        </div>
        <div className={`shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
      {trend && (
        <div className={`mt-2 flex items-center gap-1 text-xs font-semibold ${trend.value >= 0 ? "text-emerald-600" : "text-destructive"}`}>
          {trend.value >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          <span>{Math.abs(trend.value)}% {trend.label}</span>
        </div>
      )}
    </div>
  );
}
