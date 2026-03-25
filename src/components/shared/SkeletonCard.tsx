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
