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
}: DoseCardProps) {
  return (
    <div className="card-medical flex items-center gap-4">
      <AvatarWithFallback name={memberName} photoUrl={memberPhoto} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-medium text-sm truncate">{medicineName}</span>
          <StatusBadge status={status} />
        </div>
        <p className="text-muted-foreground text-xs">{memberName} · {dosage}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="caption flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {scheduledTime}
          </span>
          <span className="caption">{instructions}</span>
        </div>
      </div>
      {(status === "pending" || status === "missed") && onMarkTaken && (
        <Button
          variant="success"
          size="sm"
          className="shrink-0 gap-1"
          onClick={onMarkTaken}
        >
          <Check className="h-3.5 w-3.5" />
          Taken
        </Button>
      )}
    </div>
  );
}
