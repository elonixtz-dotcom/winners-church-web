import type { ReactNode } from "react";
import { Church } from "lucide-react";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

interface DashboardHeaderProps {
  name: string;
  subtitle: string;
  scopeLabel: string;
  actions?: ReactNode;
}

export default function DashboardHeader({ name, subtitle, scopeLabel, actions }: DashboardHeaderProps) {
  const firstName = name.split(" ")[0];
  return (
    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
          {greeting()}, {firstName} <span aria-hidden>👋</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Church className="h-3.5 w-3.5" />
          {scopeLabel}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
