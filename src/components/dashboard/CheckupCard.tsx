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
  status: "upcoming" | "completed";
  onMarkCompleted?: () => void;
}

export function CheckupCard({
  memberName,
  memberPhoto,
  title,
  type,
  scheduledDate,
  status,
  onMarkCompleted,
}: CheckupCardProps) {
  const formattedTime = format(parseISO(scheduledDate), "h:mm a");

  return (
    <div className={`card-medical flex items-center gap-4 transition-all ${status === 'completed' ? 'border-success/30 bg-success/5 opacity-80' : 'border-warning/30 bg-warning/5'}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning shrink-0">
        <CalendarCheck className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-bold text-sm truncate uppercase">{title}</span>
          <StatusBadge status={status} />
        </div>
        <p className="text-foreground/70 text-xs font-medium">{memberName} · {type}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="caption flex items-center gap-1 font-bold text-primary">
            <CalendarCheck className="h-3 w-3" />
            {formattedTime}
          </span>
          <span className="caption italic">Scheduled for Today</span>
        </div>
      </div>
      {status === "upcoming" && onMarkCompleted && (
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
  );
}
