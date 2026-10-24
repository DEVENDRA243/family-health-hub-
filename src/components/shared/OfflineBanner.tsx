import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { toast } from "sonner";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.success("Back online", {
        description: "Health records are syncing with your family care circle.",
        duration: 3000,
      });
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast.warning("You are offline", {
        description: "Viewing cached health records. Changes will sync when reconnected.",
        duration: 4000,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-2 duration-300 pointer-events-none">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/90 text-black text-xs font-semibold shadow-lg backdrop-blur-md border border-amber-400/50">
        <WifiOff className="h-3.5 w-3.5" />
        <span>Offline Mode • Cached Records</span>
      </div>
    </div>
  );
}
