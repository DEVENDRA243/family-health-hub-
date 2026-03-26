import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, CalendarCheck, Loader2, Trash2, MoreHorizontal, Clock, Stethoscope } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useCheckups, useMembers, useAddCheckup, useFamilyInfo, useDeleteCheckup } from "@/hooks/use-health-data";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

export default function Checkups() {
  const { data: checkups, isLoading, error } = useCheckups();
  const { data: members } = useMembers();
  const { data: familyInfo } = useFamilyInfo();
  const { user } = useAuth();
  const addCheckup = useAddCheckup();
  const deleteCheckup = useDeleteCheckup();
  const [isOpen, setIsOpen] = useState(false);
  
  const isAdmin = familyInfo?.created_by === user?.id;

  const [formData, setFormData] = useState({
    title: "",
    type: "doctor visit" as const,
    scheduled_date: "",
    member_id: "",
  });

  const handleAddCheckup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.member_id) {
      toast.error("Please select a family member.");
      return;
    }
    try {
      await addCheckup.mutateAsync({
        title: formData.title,
        type: formData.type,
        scheduled_date: new Date(formData.scheduled_date).toISOString(),
        member_id: formData.member_id,
        status: "upcoming",
      });
      setIsOpen(false);
      setFormData({ title: "", type: "doctor visit", scheduled_date: "", member_id: "" });
      toast.success("Checkup scheduled successfully!");
    } catch (err) {
      toast.error("Failed to schedule checkup.");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to remove ${title}?`)) {
      try {
        await deleteCheckup.mutateAsync(id);
        toast.success(`${title} has been removed.`);
      } catch (err) {
        toast.error("Failed to remove checkup.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-destructive bg-destructive/10 rounded-lg">
        Error loading checkups.
      </div>
    );
  }

  const upcoming = checkups?.filter((c) => c.status === "upcoming") || [];
  const past = checkups?.filter((c) => c.status !== "upcoming") || [];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title text-2xl font-bold">Health Checkups</h1>
          <p className="caption mt-1">{upcoming.length} upcoming appointments</p>
        </div>
        {isAdmin && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 font-bold">
                <Plus className="h-4 w-4" />
                Schedule Checkup
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule New Checkup</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddCheckup} className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Checkup Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Annual physical"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="doctor visit">Doctor Visit</SelectItem>
                        <SelectItem value="lab test">Lab Test</SelectItem>
                        <SelectItem value="vaccination">Vaccination</SelectItem>
                        <SelectItem value="scan">Scan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="member">For Member</Label>
                    <Select
                      value={formData.member_id}
                      onValueChange={(value) => setFormData({ ...formData, member_id: value })}
                    >
                      <SelectTrigger id="member">
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                      <SelectContent>
                        {members?.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Scheduled Date & Time</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full font-bold" disabled={addCheckup.isPending}>
                    {addCheckup.isPending ? "Scheduling..." : "Schedule Checkup"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <section className="space-y-4">
        <h2 className="section-heading mb-3 flex items-center gap-2 text-primary">
          <Clock className="h-4 w-4" />
          Upcoming Appointments
        </h2>
        <div className="space-y-3">
          {upcoming.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
              <p className="text-sm text-muted-foreground font-medium">No upcoming checkups.</p>
            </div>
          ) : (
            upcoming.map((checkup) => (
              <div key={checkup.id} className="card-medical flex items-center gap-4 hover:border-primary/30 transition-all group">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning shrink-0 group-hover:bg-warning group-hover:text-warning-foreground transition-colors">
                  <CalendarCheck className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm uppercase tracking-wide">{checkup.title}</span>
                    <StatusBadge status={checkup.status} />
                  </div>
                  <p className="caption font-medium text-foreground/80 mt-0.5">
                    {checkup.members?.name || "Unknown"} · {checkup.type}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                      <Clock className="h-3 w-3" />
                      {format(parseISO(checkup.scheduled_date), "MMM d, yyyy 'at' h:mm a")}
                    </div>
                  </div>
                </div>
                
                {isAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive gap-2 cursor-pointer font-bold"
                        onClick={() => handleDelete(checkup.id, checkup.title)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove Appointment
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="section-heading mb-3 flex items-center gap-2 text-muted-foreground">
          <Stethoscope className="h-4 w-4" />
          Past Appointments
        </h2>
        <div className="space-y-3">
          {past.length === 0 ? (
            <div className="text-center py-8 bg-muted/30 rounded-xl border border-dashed border-border opacity-60">
              <p className="text-sm text-muted-foreground">No past checkups.</p>
            </div>
          ) : (
            past.map((checkup) => (
              <div key={checkup.id} className="card-medical flex items-center gap-4 opacity-70 hover:opacity-100 transition-all">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success shrink-0">
                  <CalendarCheck className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm uppercase tracking-wide">{checkup.title}</span>
                    <StatusBadge status={checkup.status} />
                  </div>
                  <p className="caption font-medium text-foreground/80 mt-0.5">
                    {checkup.members?.name || "Unknown"} · {checkup.type}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] text-muted-foreground">
                      Completed on {format(parseISO(checkup.scheduled_date), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
                {isAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive gap-2 cursor-pointer font-bold"
                        onClick={() => handleDelete(checkup.id, checkup.title)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove Record
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

