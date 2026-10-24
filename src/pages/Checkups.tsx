import { StatusBadge } from "@/components/shared/StatusBadge";
import { SkeletonCheckups } from "@/components/shared/SkeletonCard";
import { Button } from "@/components/ui/button";
import { Plus, CalendarCheck, Loader2, Trash2, MoreHorizontal, Clock, Stethoscope, AlertCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useCheckups, useMembers, useAddCheckup, useFamilyInfo, useDeleteCheckup } from "@/hooks/use-health-data";
import { trackEvent } from "@/lib/analytics";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [deleteData, setDeleteData] = useState<{ id: string; title: string } | null>(null);
  
  const isAdmin = familyInfo?.created_by === user?.id;

  const [formData, setFormData] = useState({
    title: "",
    type: "doctor visit" as const,
    scheduled_date: "",
    member_id: "",
  });
  const [formErrors, setFormErrors] = useState<{
    title?: string;
    member_id?: string;
    scheduled_date?: string;
  }>({});

  const handleAddCheckup = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { title?: string; member_id?: string; scheduled_date?: string } = {};

    if (!formData.title.trim()) {
      errors.title = "Appointment or checkup title is required.";
    }
    if (!formData.member_id) {
      errors.member_id = "Please select which family member this is for.";
    }
    if (!formData.scheduled_date) {
      errors.scheduled_date = "Please select a scheduled date and time.";
    } else {
      const parsedDate = new Date(formData.scheduled_date);
      if (isNaN(parsedDate.getTime())) {
        errors.scheduled_date = "Please select a valid date and time.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fill in the highlighted required fields.");
      return;
    }
    setFormErrors({});

    const parsedDate = new Date(formData.scheduled_date);
    try {
      await addCheckup.mutateAsync({
        title: formData.title.trim(),
        type: formData.type,
        scheduled_date: parsedDate.toISOString(),
        member_id: formData.member_id,
        status: "upcoming",
      });
      setIsOpen(false);
      setFormData({ title: "", type: "doctor visit", scheduled_date: "", member_id: "" });
      setFormErrors({});
      trackEvent("checkup_scheduled");
      toast.success("Checkup scheduled successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to schedule checkup.");
    }
  };

  const handleDelete = async () => {
    if (!deleteData) return;
    try {
      await deleteCheckup.mutateAsync(deleteData.id);
      toast.success(`${deleteData.title} has been removed.`);
      setDeleteData(null);
    } catch (err) {
      toast.error("Failed to remove checkup.");
    }
  };

  if (isLoading) {
    return <SkeletonCheckups />;
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
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setFormErrors({}); }}>
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
              <form onSubmit={handleAddCheckup} className="space-y-4 pt-4" noValidate>
                <div className="grid gap-2">
                  <Label htmlFor="title">Checkup Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      if (formErrors.title) setFormErrors(prev => ({ ...prev, title: undefined }));
                    }}
                    placeholder="e.g. Annual physical / Cardiology review"
                    className={formErrors.title ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {formErrors.title && (
                    <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{formErrors.title}</span>
                    </p>
                  )}
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
                    <Label htmlFor="member">For Member *</Label>
                    <Select
                      value={formData.member_id}
                      onValueChange={(value) => {
                        setFormData({ ...formData, member_id: value });
                        if (formErrors.member_id) setFormErrors(prev => ({ ...prev, member_id: undefined }));
                      }}
                    >
                      <SelectTrigger id="member" className={formErrors.member_id ? "border-destructive focus:ring-destructive" : ""}>
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
                    {formErrors.member_id && (
                      <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{formErrors.member_id}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Scheduled Date & Time *</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={formData.scheduled_date}
                    onChange={(e) => {
                      setFormData({ ...formData, scheduled_date: e.target.value });
                      if (formErrors.scheduled_date) setFormErrors(prev => ({ ...prev, scheduled_date: undefined }));
                    }}
                    className={formErrors.scheduled_date ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {formErrors.scheduled_date && (
                    <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{formErrors.scheduled_date}</span>
                    </p>
                  )}
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
                        onClick={() => setDeleteData({ id: checkup.id, title: checkup.title })}
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
                        onClick={() => setDeleteData({ id: checkup.id, title: checkup.title })}
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

      <AlertDialog open={!!deleteData} onOpenChange={(open) => !open && setDeleteData(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the checkup <span className="font-bold text-foreground">"{deleteData?.title}"</span> from your family's records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bold">No, Keep it</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold"
              onClick={handleDelete}
            >
              Yes, Remove it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

