import { HeartPulse } from "lucide-react";

interface HealthScoreProps {
  title: string;
  score: number;
  breakdown: { label: string; value: number }[];
}

function statusFor(score: number): { label: string; color: string } {
  if (score >= 75) return { label: "Healthy", color: "text-emerald-600" };
  if (score >= 50) return { label: "Needs Attention", color: "text-amber-600" };
  return { label: "Critical", color: "text-destructive" };
}

export default function HealthScore({ title, score, breakdown }: HealthScoreProps) {
  const status = statusFor(score);
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (score / 100) * circumference;
  const ringColor = score >= 75 ? "stroke-emerald-500" : score >= 50 ? "stroke-amber-500" : "stroke-destructive";

  return (
    <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <HeartPulse className="h-4 w-4 text-primary" />
        </div>
        <h3 className="font-heading text-sm font-bold text-foreground">{title}</h3>
      </div>

      <div className="flex items-center gap-4 mb-5">
        <div className="relative h-24 w-24 shrink-0">
          <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" strokeWidth="9" className="stroke-muted" />
            <circle
              cx="50" cy="50" r="42" fill="none" strokeWidth="9" strokeLinecap="round"
              className={`${ringColor} transition-all duration-700`}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground">
            {score}%
          </div>
        </div>
        <div>
          <div className={`text-sm font-bold ${status.color}`}>{status.label}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Overall Health Score</div>
        </div>
      </div>

      <div className="space-y-2.5">
        {breakdown.map((row) => (
          <div key={row.label} className="flex items-center gap-3 text-xs">
            <span className="w-24 shrink-0 text-muted-foreground font-medium">{row.label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, row.value))}%` }} />
            </div>
            <span className="w-9 text-right font-semibold text-foreground">{row.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
