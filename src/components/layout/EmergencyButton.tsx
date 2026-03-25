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

export function EmergencyButton() {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const handleEmergency = async () => {
    setSending(true);
    // TODO: integrate with Supabase emergency_alerts table
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSending(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="emergency" size="sm" className="gap-1.5">
          <AlertTriangle className="h-4 w-4" />
          <span className="hidden sm:inline">Emergency</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emergency">
            <AlertTriangle className="h-5 w-5" />
            Send Emergency Alert
          </DialogTitle>
          <DialogDescription>
            This will send an emergency alert to all family members immediately.
            Are you sure you want to proceed?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="emergency" onClick={handleEmergency} disabled={sending}>
            {sending ? "Sending..." : "Send Alert"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
