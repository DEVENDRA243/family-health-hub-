import { AvatarWithFallback } from "@/components/shared/AvatarWithFallback";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Clock, Check } from "lucide-react";

interface DoseCardProps {
  memberName: string;
  memberPhoto?: string | null;
  medicineName: string;
  dosage: string;
  scheduledTime: string;
  instructions: string;
  status: "pending" | "taken" | "missed";
  onMarkTaken?: () => void;
  onMarkMissed?: () => void;
}

export function DoseCard({
  memberName,
  memberPhoto,
  medicineName,
  dosage,
  scheduledTime,
  instructions,
  status,
  onMarkTaken,
  onMarkMissed,
}: DoseCardProps) {
  return (
    <div className={`card-medical flex items-center gap-4 transition-all ${status === 'missed' ? 'border-destructive/50 bg-destructive/5' : ''}`}>
      <AvatarWithFallback name={memberName} photoUrl={memberPhoto} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-bold text-sm truncate uppercase">{medicineName}</span>
          <StatusBadge status={status} />
        </div>
        <p className="text-foreground/70 text-xs font-medium">{memberName} · {dosage}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="caption flex items-center gap-1 font-bold text-primary">
            <Clock className="h-3 w-3" />
            {scheduledTime}
          </span>
          <span className="caption italic">{instructions}</span>
        </div>
      </div>
      {(status === "pending" || status === "missed") && (
        <div className="flex gap-2">
          {onMarkMissed && status === "pending" && (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 text-destructive border-destructive/20 hover:bg-destructive/10"
              onClick={onMarkMissed}
            >
              Not Taken
            </Button>
          )}
          {onMarkTaken && (
            <Button
              variant="success"
              size="sm"
              className="shrink-0 gap-1 font-bold shadow-sm"
              onClick={onMarkTaken}
            >
              <Check className="h-3.5 w-3.5" />
              Taken
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
