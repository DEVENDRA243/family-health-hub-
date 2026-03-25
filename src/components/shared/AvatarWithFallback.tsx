import { cn } from "@/lib/utils";

interface AvatarWithFallbackProps {
  name: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

const colorPalette = [
  "bg-primary/15 text-primary",
  "bg-success/15 text-success",
  "bg-warning/15 text-warning",
  "bg-destructive/15 text-destructive",
  "bg-accent text-accent-foreground",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getColorIndex(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % colorPalette.length;
}

export function AvatarWithFallback({ name, photoUrl, size = "md", className }: AvatarWithFallbackProps) {
  const initials = getInitials(name);
  const colorClass = colorPalette[getColorIndex(name)];

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full font-semibold overflow-hidden shrink-0",
        sizeMap[size],
        !photoUrl && colorClass,
        className
      )}
    >
      {photoUrl ? (
        <img src={photoUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}
