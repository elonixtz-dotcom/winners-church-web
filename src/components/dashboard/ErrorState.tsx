import { AlertTriangle } from "lucide-react";

export default function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="bg-card border border-destructive/30 rounded-2xl p-10 text-center shadow-sm">
      <div className="w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="font-heading text-lg font-bold text-foreground">Something Went Wrong</h3>
      <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-2">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
