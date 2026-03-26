import { AvatarWithFallback } from "@/components/shared/AvatarWithFallback";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Loader2, Trash2, Mail, Copy, CheckCircle2, Clock } from "lucide-react";
import { useMembers, useAddMember, useDeleteMember, useFamilyInfo } from "@/hooks/use-health-data";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

export default function Members() {
  const { data: members, isLoading, error } = useMembers();
  const { data: familyInfo } = useFamilyInfo();
  const { user } = useAuth();
  const addMember = useAddMember();
  const deleteMember = useDeleteMember();
  
  const isAdmin = familyInfo?.created_by === user?.id;
  const [isOpen, setIsOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<{ id: string; name: string } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "male" as const,
    conditions: "",
    email: "",
  });

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isInvited = formData.email.trim() !== "";
      await addMember.mutateAsync({
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        conditions: formData.conditions.split(",").map(c => c.trim()).filter(c => c !== ""),
        email: formData.email || null,
        status: isInvited ? 'invited' : 'manual',
      });
      setIsOpen(false);
      setFormData({ name: "", age: "", gender: "male", conditions: "", email: "" });
      toast.success(isInvited ? "Member invited! Copy the link to share." : "Member added successfully!");
    } catch (err) {
      toast.error("Failed to add member.");
    }
  };

  const handleDelete = async () => {
    if (!memberToDelete) return;
    try {
      await deleteMember.mutateAsync(memberToDelete.id);
      toast.success(`${memberToDelete.name} has been removed.`);
      setMemberToDelete(null);
    } catch (err) {
      toast.error("Failed to delete member.");
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Invite link copied to clipboard!", {
      description: "Send this link to the family member.",
    });
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
        <p className="font-bold">Error loading family members:</p>
        <p className="text-sm">{(error as any)?.message || "Unknown error"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title text-2xl font-bold">Family Members</h1>
          <p className="caption mt-1">{members?.length || 0} members in your hub</p>
        </div>
        {isAdmin && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 font-bold">
                <Plus className="h-4 w-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Family Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddMember} className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dad"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="e.g. 55"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value: "male" | "female" | "other") => setFormData({ ...formData, gender: value })}
                    >
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address (Optional - For phone access)</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-9"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="member@email.com"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                    If you add an email, we'll generate a Discord-style invite link.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="conditions">Medical Conditions (comma separated)</Label>
                  <Input
                    id="conditions"
                    value={formData.conditions}
                    onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                    placeholder="e.g. Diabetes, Hypertension"
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full font-bold" disabled={addMember.isPending}>
                    {addMember.isPending ? "Adding..." : "Add to Family Hub"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {members?.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-muted/30 rounded-xl border-2 border-dashed border-border">
            <p className="text-sm text-muted-foreground font-medium">No family members added yet.</p>
          </div>
        ) : (
          members?.map((member) => {
            const isHead = member.user_id === familyInfo?.created_by;
            const isMe = member.user_id === user?.id;
            
            // Prefer metadata for the current user to ensure Gmail name shows up
            // For others, use the name stored in DB (which is now Gmail name during join)
            const displayName = isMe 
              ? (user?.user_metadata?.full_name || user?.email?.split('@')[0] || member.name) 
              : (member.name === 'Head' ? 'Family Head' : member.name);
            
            // Logic to determine if we should show details (age, gender, conditions)
            // Based on user request: Admin adds these after they get finally connected.
            // For now, let's hide them if the user explicitly wants them added by admin later.
            const showDetails = member.age > 0 || (member.conditions && member.conditions.length > 0);

            return (
              <div key={member.id} className={`card-medical group transition-all hover:border-primary/30 ${member.status === 'invited' ? 'border-dashed border-warning/50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <AvatarWithFallback name={displayName} size="lg" />
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          {isHead && (
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-1">
                              Head of the Family
                            </span>
                          )}
                          <h3 className="font-bold uppercase tracking-tight leading-tight">
                            {displayName}
                          </h3>
                        </div>
                        {member.status === 'connected' ? (
                          <span className="flex items-center gap-0.5 text-[9px] font-black text-success bg-success/10 px-1.5 py-0.5 rounded-full uppercase">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Connected
                          </span>
                        ) : member.status === 'invited' ? (
                          <span className="flex items-center gap-0.5 text-[9px] font-black text-warning bg-warning/10 px-1.5 py-0.5 rounded-full uppercase">
                            <Clock className="h-2.5 w-2.5" /> Invited
                          </span>
                        ) : null}
                      </div>
                      {!isHead && showDetails && (
                        <p className="caption font-medium">{member.age} yrs · {member.gender}</p>
                      )}
                    </div>
                  </div>
                  {isAdmin && !isMe && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {member.invite_token && member.status === 'invited' && (
                          <DropdownMenuItem 
                            className="gap-2 cursor-pointer font-bold text-primary"
                            onClick={() => copyInviteLink(member.invite_token!)}
                          >
                            <Copy className="h-4 w-4" />
                            Copy Invite Link
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive gap-2 cursor-pointer font-bold"
                          onClick={() => setMemberToDelete({ id: member.id, name: displayName })}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                
                {isAdmin && member.status === 'invited' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-3 h-7 text-[10px] font-black uppercase tracking-widest gap-1.5 border-warning/30 text-warning hover:bg-warning/5"
                    onClick={() => copyInviteLink(member.invite_token!)}
                  >
                    <Copy className="h-3 w-3" /> Copy Discord-style Link
                  </Button>
                )}

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {member.conditions && member.conditions.length > 0 && member.conditions.map((condition) => (
                    <span
                      key={condition}
                      className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      <AlertDialog open={!!memberToDelete} onOpenChange={(open) => !open && setMemberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {memberToDelete?.name}? This will also delete their medicines and records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
