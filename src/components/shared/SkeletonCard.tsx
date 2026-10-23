import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
  lines?: number;
}

export function SkeletonCard({ className, lines = 3 }: SkeletonCardProps) {
  return (
    <div className={cn("card-medical animate-pulse", className)}>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-muted" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-1/3 rounded bg-muted" />
          <div className="h-3 w-1/4 rounded bg-muted" />
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 rounded bg-muted"
            style={{ width: `${80 - i * 15}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton placeholder for page titles and action buttons
 */
export function SkeletonHeader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-between animate-pulse", className)}>
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-xl bg-muted" />
        <div className="h-4 w-32 rounded-lg bg-muted/60" />
      </div>
      <div className="h-9 w-28 rounded-xl bg-muted" />
    </div>
  );
}

/**
 * Skeleton placeholder for the Dashboard overview
 */
export function SkeletonDashboard() {
  return (
    <div className="space-y-6 max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
      <div className="lg:col-span-2 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-56 rounded-xl bg-muted" />
            <div className="h-4 w-40 rounded-lg bg-muted/60" />
          </div>
          <div className="h-9 w-24 rounded-xl bg-muted" />
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-medical p-4 space-y-2">
              <div className="h-4 w-16 rounded bg-muted" />
              <div className="h-7 w-12 rounded bg-muted" />
            </div>
          ))}
        </div>

        {/* Doses List Skeleton */}
        <div className="space-y-3">
          <div className="h-5 w-36 rounded bg-muted" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-medical p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-muted shrink-0" />
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded bg-muted" />
                  <div className="h-3 w-20 rounded bg-muted/60" />
                </div>
              </div>
              <div className="h-8 w-20 rounded-lg bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Side Column Skeleton */}
      <div className="space-y-6">
        <div className="card-medical p-5 space-y-4">
          <div className="h-5 w-32 rounded bg-muted" />
          <div className="h-28 rounded-xl bg-muted/50" />
        </div>
        <div className="card-medical p-5 space-y-3">
          <div className="h-5 w-28 rounded bg-muted" />
          <div className="h-16 rounded-xl bg-muted/50" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton placeholder for the Medicines directory
 */
export function SkeletonMedicines() {
  return (
    <div className="space-y-6 max-w-4xl animate-pulse">
      <SkeletonHeader />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card-medical p-4 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-muted shrink-0" />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-36 rounded bg-muted" />
                  <div className="h-4 w-16 rounded-full bg-muted/60" />
                </div>
                <div className="h-3 w-48 rounded bg-muted/60" />
              </div>
            </div>
            <div className="h-8 w-8 rounded-lg bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton placeholder for Family Members grid
 */
export function SkeletonMembers() {
  return (
    <div className="space-y-6 max-w-4xl animate-pulse">
      <SkeletonHeader />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card-medical p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-muted shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-28 rounded bg-muted" />
                <div className="h-3 w-20 rounded bg-muted/60" />
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t border-border/50">
              <div className="h-3 w-3/4 rounded bg-muted/60" />
              <div className="h-3 w-1/2 rounded bg-muted/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton placeholder for Checkups appointments
 */
export function SkeletonCheckups() {
  return (
    <div className="space-y-6 max-w-4xl animate-pulse">
      <SkeletonHeader />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-medical p-4 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-muted shrink-0" />
              <div className="space-y-2">
                <div className="h-4 w-40 rounded bg-muted" />
                <div className="h-3 w-28 rounded bg-muted/60" />
              </div>
            </div>
            <div className="h-8 w-24 rounded-lg bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton placeholder for Medical Reports
 */
export function SkeletonReports() {
  return (
    <div className="space-y-6 max-w-4xl animate-pulse">
      <SkeletonHeader />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card-medical p-4 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-muted shrink-0" />
              <div className="space-y-2">
                <div className="h-4 w-44 rounded bg-muted" />
                <div className="h-3 w-32 rounded bg-muted/60" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-20 rounded-lg bg-muted" />
              <div className="h-8 w-8 rounded-lg bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton placeholder for Health Analytics
 */
export function SkeletonAnalytics() {
  return (
    <div className="space-y-6 max-w-4xl animate-pulse">
      <div className="h-8 w-48 rounded-xl bg-muted" />
      <div className="card-medical p-6 space-y-4">
        <div className="h-5 w-64 rounded bg-muted" />
        <div className="h-64 rounded-xl bg-muted/40" />
      </div>
      <div className="card-medical p-6 space-y-4">
        <div className="h-5 w-52 rounded bg-muted" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-4 w-20 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
