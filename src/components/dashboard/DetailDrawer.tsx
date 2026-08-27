import type { ReactNode } from "react";
import { X } from "lucide-react";

interface DetailDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export default function DetailDrawer({ open, onClose, title, subtitle, actions, children }: DetailDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-full max-w-md bg-card shadow-2xl overflow-y-auto animate-fade-in-up">
        <div className="sticky top-0 bg-card border-b border-border/40 px-5 py-4 flex items-start justify-between gap-3 z-10">
          <div className="min-w-0">
            <h3 className="font-heading text-lg font-bold text-foreground truncate">{title}</h3>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5 space-y-5">{children}</div>
        {actions && (
          <div className="sticky bottom-0 bg-card border-t border-border/40 px-5 py-3 flex flex-wrap gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export function DetailSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <h4 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-2">{label}</h4>
      {children}
    </div>
  );
}

export function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-center justify-between py-1.5 text-xs border-b border-border/10 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground text-right">{value}</span>
    </div>
  );
}
