import { AvatarWithFallback } from "@/components/shared/AvatarWithFallback";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Check } from "lucide-react";
import { format, parseISO } from "date-fns";

interface CheckupCardProps {
  memberName: string;
  memberPhoto?: string | null;
  title: string;
  type: string;
  scheduledDate: string;
  status: "upcoming" | "completed" | "missed";
  onMarkCompleted?: () => void;
  onMarkMissed?: () => void;
}

export function CheckupCard({
  memberName,
  memberPhoto,
  title,
  type,
  scheduledDate,
  status,
  onMarkCompleted,
  onMarkMissed,
}: CheckupCardProps) {
  const formattedTime = format(parseISO(scheduledDate), "h:mm a");

  // UI FORCE UPDATE: Added border and precise status handling
  const getStatusStyles = () => {
    switch (status) {
      case 'completed':
        return 'border-success/30 bg-success/5 opacity-80';
      case 'missed':
        return 'border-destructive/50 bg-destructive/5';
      default:
        return 'border-warning/30 bg-warning/5';
    }
  };

  return (
    <div className={`card-medical flex items-center gap-4 transition-all ${getStatusStyles()}`}>
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${status === 'missed' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'}`}>
        <CalendarCheck className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-bold text-sm truncate uppercase">{title}</span>
          <StatusBadge status={status === 'upcoming' ? 'pending' : status} />
        </div>
        <p className="text-foreground/70 text-xs font-medium">{memberName} · {type}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className={`caption flex items-center gap-1 font-bold ${status === 'missed' ? 'text-destructive' : 'text-primary'}`}>
            <CalendarCheck className="h-3 w-3" />
            {formattedTime}
          </span>
          <span className="caption italic">Scheduled for Today</span>
        </div>
      </div>
      {(status === "upcoming" || status === "missed") && (
        <div className="flex gap-2">
          {onMarkMissed && status === "upcoming" && (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 text-destructive border-destructive/20 hover:bg-destructive/10"
              onClick={onMarkMissed}
            >
              Not Done
            </Button>
          )}
          {onMarkCompleted && (
            <Button
              variant="success"
              size="sm"
              className="shrink-0 gap-1 font-bold shadow-sm"
              onClick={onMarkCompleted}
            >
              <Check className="h-3.5 w-3.5" />
              Done
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
