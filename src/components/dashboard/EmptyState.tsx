import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon: Icon = Inbox, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="bg-card border border-border/40 rounded-2xl p-10 text-center shadow-sm">
      <div className="w-14 h-14 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="h-6 w-6 text-primary/60" />
      </div>
      <h3 className="font-heading text-lg font-bold text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-2">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
