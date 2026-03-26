import { Button } from "@/components/ui/button";
import { Upload, FileText, MoreHorizontal, Loader2, Trash2 } from "lucide-react";
import { useReports, useMembers, useAddReport, useFamilyInfo, useDeleteReport } from "@/hooks/use-health-data";
import { useAuth } from "@/hooks/use-auth";
import { format, parseISO } from "date-fns";
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

export default function Reports() {
  const { data: reports, isLoading, error } = useReports();
  const { data: members } = useMembers();
  const { data: familyInfo } = useFamilyInfo();
  const { user } = useAuth();
  const addReport = useAddReport();
  const deleteReport = useDeleteReport();
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = familyInfo?.created_by === user?.id;

  const [formData, setFormData] = useState({
    title: "",
    member_id: "",
    type: "PDF" as const,
  });

  const handleAddReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.member_id) {
      toast.error("Please select a family member.");
      return;
    }
    try {
      await addReport.mutateAsync({
        title: formData.title,
        member_id: formData.member_id,
        type: formData.type,
        uploaded_at: new Date().toISOString(),
      });
      setIsOpen(false);
      setFormData({ title: "", member_id: "", type: "PDF" });
      toast.success("Report added successfully!");
    } catch (err) {
      toast.error("Failed to add report.");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to remove ${title}?`)) {
      try {
        await deleteReport.mutateAsync(id);
        toast.success(`${title} has been removed.`);
      } catch (err) {
        toast.error("Failed to remove report.");
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
        Error loading reports.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="page-title text-2xl font-bold">Reports & Prescriptions</h1>
        {isAdmin && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 font-bold">
                <Upload className="h-4 w-4" />
                Upload File
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Report</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddReport} className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Report Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Blood Test Results"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                  <div className="grid gap-2">
                    <Label htmlFor="type">File Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PDF">PDF</SelectItem>
                        <SelectItem value="JPG">JPG</SelectItem>
                        <SelectItem value="PNG">PNG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full font-bold" disabled={addReport.isPending}>
                    {addReport.isPending ? "Adding..." : "Add Report"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-3">
        {reports?.length === 0 ? (
          <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed border-border">
            <p className="text-sm text-muted-foreground">No reports uploaded yet.</p>
          </div>
        ) : (
          reports?.map((report) => (
            <div key={report.id} className="card-medical flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm">{report.title}</span>
                <p className="caption">
                  {report.members?.name || "Unknown"} · {format(parseISO(report.uploaded_at), "MMM d, yyyy")} · {report.type}
                </p>
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
                      onClick={() => handleDelete(report.id, report.title)}
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
    </div>
  );
}
