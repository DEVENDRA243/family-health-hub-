import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "pending" | "taken" | "missed" | "upcoming" | "completed" | "cancelled";
  className?: string;
}

const statusConfig = {
  pending: "status-badge status-pending",
  taken: "status-badge status-taken",
  missed: "status-badge status-missed",
  upcoming: "status-badge status-pending",
  completed: "status-badge status-taken",
  cancelled: "status-badge status-missed",
};

const statusLabels = {
  pending: "Pending",
  taken: "Taken",
  missed: "Missed",
  upcoming: "Upcoming",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(statusConfig[status], className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {statusLabels[status]}
    </span>
  );
}
