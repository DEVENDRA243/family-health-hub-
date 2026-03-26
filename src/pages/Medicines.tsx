import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Pill, MoreHorizontal, Loader2, CheckCircle2, Clock, Trash2 } from "lucide-react";
import { useMedicines, useMembers, useAddMedicine, useDoses, useDeleteMedicine, useFamilyInfo } from "@/hooks/use-health-data";
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

export default function Medicines() {
  const { data: medicines, isLoading: isMedLoading } = useMedicines();
  const { data: members } = useMembers();
  const { data: familyInfo } = useFamilyInfo();
  const { user } = useAuth();
  const { data: doses } = useDoses(format(new Date(), "yyyy-MM-dd"));
  const addMedicine = useAddMedicine();
  const deleteMedicine = useDeleteMedicine();
  const [isOpen, setIsOpen] = useState(false);
  
  const isAdmin = familyInfo?.created_by === user?.id;

  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    member_id: "",
    instructions: "",
    timings: "",
  });

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.member_id) {
      toast.error("Please select a family member.");
      return;
    }
    try {
      await addMedicine.mutateAsync({
        name: formData.name,
        dosage: formData.dosage,
        member_id: formData.member_id,
        instructions: formData.instructions,
        timings: formData.timings.split(",").map(t => t.trim()).filter(t => t !== ""),
        is_active: true,
      });
      setIsOpen(false);
      setFormData({ name: "", dosage: "", member_id: "", instructions: "", timings: "" });
      toast.success("Medicine added successfully! It's now live on the dashboard.");
    } catch (err) {
      toast.error("Failed to add medicine.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name}?`)) {
      try {
        await deleteMedicine.mutateAsync(id);
        toast.success(`${name} has been removed.`);
      } catch (err) {
        toast.error("Failed to remove medicine.");
      }
    }
  };

  if (isMedLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Medicines List</h1>
          <p className="caption mt-1">{medicines?.length || 0} active medicines tracked</p>
        </div>
        {isAdmin && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
              <form onSubmit={handleAddMedicine} className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Medicine Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Paracetamol"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="dosage">Dosage (mg/ml/count)</Label>
                    <Input
                      id="dosage"
                      value={formData.dosage}
                      onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                      placeholder="e.g. 500mg"
                      required
                    />
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
                  <Label htmlFor="instructions">Eating Instructions</Label>
                  <Input
                    id="instructions"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="e.g. After food / Empty stomach"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="timings">Daily Timings (comma separated)</Label>
                  <Input
                    id="timings"
                    value={formData.timings}
                    onChange={(e) => setFormData({ ...formData, timings: e.target.value })}
                    placeholder="e.g. 08:00 AM, 05:00 PM, 09:00 PM"
                    required
                  />
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
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                      <Clock className="h-3 w-3" />
                      {med.timings?.join(", ")}
                    </div>
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
                        className="text-destructive focus:text-destructive gap-2 cursor-pointer font-bold"
                        onClick={() => handleDelete(med.id, med.name)}
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
    </div>
  );
}
