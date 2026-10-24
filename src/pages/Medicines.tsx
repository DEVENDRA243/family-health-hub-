import { StatusBadge } from "@/components/shared/StatusBadge";
import { SkeletonMedicines } from "@/components/shared/SkeletonCard";
import { Button } from "@/components/ui/button";
import { Plus, Pill, MoreHorizontal, Loader2, CheckCircle2, Clock, Trash2, AlertCircle, PackagePlus, AlertTriangle } from "lucide-react";
import { useMedicines, useMembers, useAddMedicine, useDoses, useDeleteMedicine, useFamilyInfo } from "@/hooks/use-health-data";
import { useMedicineStock, saveStock, refillMedicineStock } from "@/hooks/use-medicine-stock";
import { Medicine } from "@/types/health";
import { trackEvent } from "@/lib/analytics";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
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

type TimingSlot = {
  hour: string;
  minute: string;
  period: "AM" | "PM";
};

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

function MedicineStockBadge({ medicineId }: { medicineId: string }) {
  const { pillsRemaining, isLowStock, isOutOfStock, unit } = useMedicineStock(medicineId);

  if (isOutOfStock) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-destructive/15 text-destructive border border-destructive/30 animate-pulse">
        <AlertTriangle className="h-3 w-3" />
        Out of Stock (0 left)
      </span>
    );
  }

  if (isLowStock) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
        <AlertTriangle className="h-3 w-3" />
        Low Stock: {pillsRemaining} {unit} left
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted/70 text-muted-foreground border border-border/50">
      <Pill className="h-3 w-3 text-primary/70" />
      {pillsRemaining} {unit} in bottle
    </span>
  );
}

export default function Medicines() {
  const { data: medicines, isLoading: isMedLoading } = useMedicines();
  const { data: members } = useMembers();
  const { data: familyInfo } = useFamilyInfo();
  const { user } = useAuth();
  const { data: doses } = useDoses(format(new Date(), "yyyy-MM-dd"));
  const addMedicine = useAddMedicine();
  const deleteMedicine = useDeleteMedicine();
  const [isOpen, setIsOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string>("");

  // Stock refill modal state
  const [refillTarget, setRefillTarget] = useState<Medicine | null>(null);
  const [refillCount, setRefillCount] = useState<number>(30);

  const isAdmin = familyInfo?.created_by === user?.id;

  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    member_id: "",
    instructions: "",
    initialStock: 30,
    refillThreshold: 5,
  });

  const [formErrors, setFormErrors] = useState<{
    name?: string;
    dosage?: string;
    member_id?: string;
    timings?: string;
  }>({});

  const [timingSlots, setTimingSlots] = useState<TimingSlot[]>([
    { hour: "08", minute: "00", period: "AM" }
  ]);

  const handleAddTimingSlot = () => {
    setTimingSlots(prev => [...prev, { hour: "08", minute: "00", period: "PM" }]);
    if (formErrors.timings) setFormErrors(prev => ({ ...prev, timings: undefined }));
  };

  const handleRemoveTimingSlot = (index: number) => {
    setTimingSlots(prev => prev.filter((_, i) => i !== index));
  };

  const updateTimingSlot = (index: number, field: keyof TimingSlot, value: string) => {
    setTimingSlots(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addPresetSlot = (hour: string, minute: string, period: "AM" | "PM") => {
    const exists = timingSlots.some(
      s => s.hour === hour && s.minute === minute && s.period === period
    );
    if (!exists) {
      setTimingSlots(prev => [...prev, { hour, minute, period }]);
      if (formErrors.timings) setFormErrors(prev => ({ ...prev, timings: undefined }));
    }
  };

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; dosage?: string; member_id?: string; timings?: string } = {};

    if (!formData.name.trim()) {
      errors.name = "Medicine name is required.";
    }
    if (!formData.dosage.trim()) {
      errors.dosage = "Dosage is required (e.g. 500mg, 1 tablet).";
    }
    if (!formData.member_id) {
      errors.member_id = "Please select which family member this is for.";
    }

    const finalTimings = Array.from(
      new Set(timingSlots.map(s => `${s.hour}:${s.minute} ${s.period}`))
    );

    if (finalTimings.length === 0) {
      errors.timings = "Please configure at least one daily dose time.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fill in the highlighted required fields.");
      return;
    }
    setFormErrors({});

    try {
      const newMed = await addMedicine.mutateAsync({
        name: formData.name.trim(),
        dosage: formData.dosage.trim(),
        member_id: formData.member_id,
        instructions: formData.instructions.trim(),
        timings: finalTimings,
        is_active: true,
      });

      if (newMed?.id) {
        saveStock({
          medicineId: newMed.id,
          pillsRemaining: formData.initialStock,
          refillThreshold: formData.refillThreshold,
          unit: "tablets",
        });
      }

      setIsOpen(false);
      setFormData({ name: "", dosage: "", member_id: "", instructions: "", initialStock: 30, refillThreshold: 5 });
      setTimingSlots([{ hour: "08", minute: "00", period: "AM" }]);
      setFormErrors({});
      trackEvent("medicine_added", {
        frequency: `${finalTimings.length}_times_daily`,
        has_reminder: true,
      });
      toast.success("Medicine added successfully! It's now live on the dashboard.");
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to add medicine: ${err.message || "Unknown error"}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMedicine.mutateAsync(deleteId);
      toast.success(`${deleteName} has been removed.`);
      setDeleteId(null);
    } catch (err) {
      toast.error("Failed to remove medicine.");
    }
  };

  if (isMedLoading) {
    return <SkeletonMedicines />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Medicines List</h1>
          <p className="caption mt-1">{medicines?.length || 0} active medicines tracked</p>
        </div>
        {isAdmin && (
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setFormErrors({}); }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 font-bold">
                <Plus className="h-4 w-4" />
                Add Medicine
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Medicine</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddMedicine} className="space-y-4 pt-4" noValidate>
                <div className="grid gap-2">
                  <Label htmlFor="name">Medicine Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (formErrors.name) setFormErrors(prev => ({ ...prev, name: undefined }));
                    }}
                    placeholder="e.g. Paracetamol"
                    className={formErrors.name ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {formErrors.name && (
                    <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{formErrors.name}</span>
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="dosage">Dosage *</Label>
                    <Input
                      id="dosage"
                      value={formData.dosage}
                      onChange={(e) => {
                        setFormData({ ...formData, dosage: e.target.value });
                        if (formErrors.dosage) setFormErrors(prev => ({ ...prev, dosage: undefined }));
                      }}
                      placeholder="e.g. 500mg / 1 tablet"
                      className={formErrors.dosage ? "border-destructive focus-visible:ring-destructive" : ""}
                    />
                    {formErrors.dosage && (
                      <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{formErrors.dosage}</span>
                      </p>
                    )}
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
                  <Label htmlFor="instructions">Eating Instructions (Optional)</Label>
                  <Input
                    id="instructions"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="e.g. After food / Empty stomach"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="initialStock">Bottle Quantity (Pills)</Label>
                    <Input
                      id="initialStock"
                      type="number"
                      min="1"
                      value={formData.initialStock}
                      onChange={(e) => setFormData({ ...formData, initialStock: Math.max(1, parseInt(e.target.value) || 1) })}
                      placeholder="e.g. 30"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="refillThreshold">Low Stock Alert (Pills)</Label>
                    <Input
                      id="refillThreshold"
                      type="number"
                      min="1"
                      value={formData.refillThreshold}
                      onChange={(e) => setFormData({ ...formData, refillThreshold: Math.max(1, parseInt(e.target.value) || 1) })}
                      placeholder="e.g. 5"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label>Daily Timings</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-primary font-bold gap-1 hover:bg-primary/10"
                      onClick={handleAddTimingSlot}
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Timing
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {timingSlots.map((slot, index) => (
                      <div key={index} className="flex items-center gap-2 bg-muted/40 p-2 rounded-lg border border-border">
                        {/* Hour Dropdown */}
                        <Select
                          value={slot.hour}
                          onValueChange={(val) => updateTimingSlot(index, "hour", val)}
                        >
                          <SelectTrigger className="w-[72px] bg-background font-medium">
                            <SelectValue placeholder="Hour" />
                          </SelectTrigger>
                          <SelectContent className="max-h-48">
                            {HOURS.map((h) => (
                              <SelectItem key={h} value={h}>{h}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <span className="font-bold text-foreground/80">:</span>

                        {/* Minute Dropdown */}
                        <Select
                          value={slot.minute}
                          onValueChange={(val) => updateTimingSlot(index, "minute", val)}
                        >
                          <SelectTrigger className="w-[72px] bg-background font-medium">
                            <SelectValue placeholder="Min" />
                          </SelectTrigger>
                          <SelectContent className="max-h-48">
                            {MINUTES.map((m) => (
                              <SelectItem key={m} value={m}>{m}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* AM/PM Dropdown */}
                        <Select
                          value={slot.period}
                          onValueChange={(val: "AM" | "PM") => updateTimingSlot(index, "period", val)}
                        >
                          <SelectTrigger className="w-[76px] bg-background font-medium">
                            <SelectValue placeholder="AM/PM" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AM">AM</SelectItem>
                            <SelectItem value="PM">PM</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Remove button if more than 1 slot */}
                        {timingSlots.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 ml-auto"
                            onClick={() => handleRemoveTimingSlot(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Quick Presets */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold mr-1">Presets:</span>
                    <button
                      type="button"
                      className="text-[11px] font-semibold bg-muted hover:bg-primary/10 hover:text-primary px-2 py-0.5 rounded border border-border transition-colors"
                      onClick={() => addPresetSlot("08", "00", "AM")}
                    >
                      + 08:00 AM (Morning)
                    </button>
                    <button
                      type="button"
                      className="text-[11px] font-semibold bg-muted hover:bg-primary/10 hover:text-primary px-2 py-0.5 rounded border border-border transition-colors"
                      onClick={() => addPresetSlot("01", "00", "PM")}
                    >
                      + 01:00 PM (Afternoon)
                    </button>
                    <button
                      type="button"
                      className="text-[11px] font-semibold bg-muted hover:bg-primary/10 hover:text-primary px-2 py-0.5 rounded border border-border transition-colors"
                      onClick={() => addPresetSlot("08", "00", "PM")}
                    >
                      + 08:00 PM (Night)
                    </button>
                  </div>
                  {formErrors.timings && (
                    <p className="text-xs text-destructive flex items-center gap-1 font-medium mt-1">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{formErrors.timings}</span>
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full font-bold" disabled={addMedicine.isPending}>
                    {addMedicine.isPending ? "Adding..." : "Add Medicine"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-3">
        {medicines?.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
            <p className="text-sm text-muted-foreground">No medicines added yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Add a medicine to start tracking its intake status.</p>
          </div>
        ) : (
          medicines?.map((med) => {
            const medDoses = doses?.filter(d => d.medicine_id === med.id) || [];
            const takenCount = medDoses.filter(d => d.status === 'taken').length;
            const totalCount = medDoses.length;

            return (
              <div key={med.id} className="card-medical flex items-center gap-4 hover:border-primary/30 transition-colors group">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Pill className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm uppercase tracking-wide">{med.name}</span>
                    <span className="caption">· {med.dosage}</span>
                  </div>
                  <p className="caption font-medium text-foreground/80 mt-0.5">
                    {med.members?.name} · {med.instructions}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                      <Clock className="h-3 w-3" />
                      {med.timings?.join(", ")}
                    </div>
                    <MedicineStockBadge medicineId={med.id} />
                  </div>
                </div>

                <div className="text-right hidden sm:block mr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Today:</span>
                    <span className={`text-xs font-bold ${takenCount === totalCount && totalCount > 0 ? 'text-success' : 'text-primary'}`}>
                      {takenCount}/{totalCount} TAKEN
                    </span>
                  </div>
                  <div className="h-1.5 w-24 bg-muted rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${totalCount > 0 ? (takenCount / totalCount) * 100 : 0}%` }}
                    />
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
                        className="gap-2 cursor-pointer font-bold text-primary focus:text-primary"
                        onClick={() => {
                          setRefillTarget(med);
                          setRefillCount(30);
                        }}
                      >
                        <PackagePlus className="h-4 w-4" />
                        Refill Bottle
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive gap-2 cursor-pointer font-bold"
                        onClick={() => {
                          setDeleteId(med.id);
                          setDeleteName(med.name);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove Medicine
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <span className="font-bold text-foreground">"{deleteName}"</span> from your family's records. This action cannot be undone.
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

      {/* Refill Bottle Dialog */}
      <Dialog open={!!refillTarget} onOpenChange={(open) => !open && setRefillTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PackagePlus className="h-5 w-5 text-primary" />
              <span>Refill Bottle: {refillTarget?.name}</span>
            </DialogTitle>
            <DialogDescription>
              Add newly purchased tablets to update your family inventory and clear low stock alerts.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="grid gap-2">
              <Label htmlFor="refillPillCount">Pills / Tablets to Add</Label>
              <Input
                id="refillPillCount"
                type="number"
                min="1"
                value={refillCount}
                onChange={(e) => setRefillCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="text-xl font-black h-12 text-primary"
              />
            </div>

            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-medium">Quick Presets:</p>
              <div className="grid grid-cols-4 gap-2">
                {[15, 30, 60, 90].map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setRefillCount(preset)}
                    className={refillCount === preset ? "border-primary bg-primary/10 text-primary font-bold shadow-sm" : "text-xs font-semibold"}
                  >
                    +{preset}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setRefillTarget(null)}>
              Cancel
            </Button>
            <Button
              className="font-bold gap-2"
              onClick={() => {
                if (!refillTarget) return;
                const updated = refillMedicineStock(refillTarget.id, refillCount);
                toast.success(`Refilled ${refillTarget.name}!`, {
                  description: `Added +${refillCount} pills. Total in bottle: ${updated.pillsRemaining} pills.`,
                  icon: <PackagePlus className="h-5 w-5 text-primary" />,
                });
                setRefillTarget(null);
              }}
            >
              <PackagePlus className="h-4 w-4" />
              Confirm Refill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
