import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, RefreshCw, Trash2, Loader2 } from "lucide-react";
import { useFamilyInfo, useUpdateFamilyInfo, useDeleteFamily } from "@/hooks/use-health-data";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const { data: familyInfo, isLoading } = useFamilyInfo();
  const updateFamily = useUpdateFamilyInfo();
  const deleteFamily = useDeleteFamily();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const isAdmin = familyInfo?.created_by === user?.id;

  useEffect(() => {
    if (familyInfo) {
      setName(familyInfo.name);
      setCode(familyInfo.invite_code);
    }
  }, [familyInfo]);

  const handleUpdateName = async () => {
    try {
      await updateFamily.mutateAsync({ id: familyInfo?.id, name });
      toast.success("Family name updated!");
    } catch (err) {
      toast.error("Failed to update name.");
    }
  };

  const handleGenerateCode = async () => {
    if (!familyInfo) return;
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
      await updateFamily.mutateAsync({ id: familyInfo.id, invite_code: newCode });
      setCode(newCode);
      toast.success("New invite code generated!");
    } catch (err) {
      toast.error("Failed to generate code.");
    }
  };

  const handleDeleteFamily = async () => {
    if (!familyInfo) return;
    
    try {
      await deleteFamily.mutateAsync(familyInfo.id);
      toast.success("Family Hub deleted successfully.");
      // Sign out the user to allow a fresh start on next login
      await signOut();
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error("Failed to delete Family Hub.");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Family Settings</h1>
        {!isAdmin && (
          <span className="text-[10px] font-black text-warning bg-warning/10 px-2 py-1 rounded-full uppercase tracking-tighter border border-warning/20">
            View Only Mode
          </span>
        )}
      </div>

      <div className="card-medical space-y-4">
        <h2 className="section-heading">Family Details</h2>
        <div className="space-y-3">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label htmlFor="familyName" className="caption">Family Name</Label>
              <Input 
                id="familyName" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Johnson Family"
                className="mt-1" 
                disabled={!isAdmin}
              />
            </div>
            {isAdmin && (
              <Button onClick={handleUpdateName} disabled={updateFamily.isPending}>
                {updateFamily.isPending ? "Saving..." : "Save"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="card-medical space-y-4">
        <h2 className="section-heading">Invite Code</h2>
        <p className="text-sm text-muted-foreground">
          {isAdmin 
            ? "Share this code with family members so they can join your family."
            : "Your family's unique invite code."}
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-lg border border-border bg-muted/50 px-4 py-3 font-mono text-lg font-bold tracking-widest text-center">
            {code || "---"}
          </div>
          <Button variant="outline" size="icon" title="Copy code" onClick={copyToClipboard}>
            <Copy className="h-4 w-4" />
          </Button>
          {isAdmin && (
            <Button 
              variant="outline" 
              size="icon" 
              title="Generate new code" 
              onClick={handleGenerateCode}
              disabled={updateFamily.isPending}
            >
              <RefreshCw className={`h-4 w-4 ${updateFamily.isPending ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="card-medical space-y-4">
          <h2 className="section-heading text-destructive">Danger Zone</h2>
          <p className="text-sm text-muted-foreground">
            These actions are irreversible. Please proceed with caution.
          </p>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm" 
                className="gap-1.5"
                disabled={deleteFamily.isPending}
              >
                {deleteFamily.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete Family
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your entire family hub,
                  including all members, medication schedules, and medical records.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>No, Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteFamily}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, Delete Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
