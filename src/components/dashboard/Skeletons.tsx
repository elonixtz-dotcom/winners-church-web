function Shimmer({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

export function StatCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border/40 p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Shimmer className="h-3 w-20" />
          <Shimmer className="h-6 w-14" />
        </div>
        <Shimmer className="h-10 w-10 rounded-xl" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
          <Shimmer className="h-4 w-32 mb-4" />
          <Shimmer className="h-56 w-full" />
        </div>
        <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm space-y-3">
          <Shimmer className="h-4 w-24 mb-2" />
          {Array.from({ length: 5 }).map((_, i) => <Shimmer key={i} className="h-3 w-full" />)}
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Shimmer key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}
