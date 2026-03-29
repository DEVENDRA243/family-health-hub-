import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useAddEmergencyAlert } from "@/hooks/use-health-data";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export function EmergencyButton() {
  const [open, setOpen] = useState(false);
  const sendAlert = useAddEmergencyAlert();

  const { user } = useAuth();

  const handleEmergency = async () => {
    try {
      const senderName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "A Family Member";
      await sendAlert.mutateAsync({
        message: `🚨 Emergency Alert triggered by ${senderName}`,
        type: "emergency",
      });
      toast.success("EMERGENCY ALERT SENT!", {
        description: "All family members have been notified via email and dashboard.",
        duration: 5000,
      });
      setOpen(false);
    } catch (err) {
      toast.error("Failed to send emergency alert.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="emergency" size="sm" className="gap-1.5 animate-pulse">
          <AlertTriangle className="h-4 w-4" />
          <span className="hidden sm:inline font-bold">EMERGENCY</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="border-emergency/50 bg-emergency/5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emergency text-xl font-black">
            <AlertTriangle className="h-6 w-6" />
            CRITICAL EMERGENCY
          </DialogTitle>
          <DialogDescription className="text-foreground font-medium pt-2">
            This will send an immediate emergency alert to all family members' dashboards.
            Are you absolutely sure you want to proceed?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)} className="font-bold">
            NO, CANCEL
          </Button>
          <Button 
            variant="emergency" 
            onClick={handleEmergency} 
            disabled={sendAlert.isPending}
            className="font-black"
          >
            {sendAlert.isPending ? "SENDING..." : "YES, SEND ALERT!"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
