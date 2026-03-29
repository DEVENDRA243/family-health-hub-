import { Button } from "@/components/ui/button";
import { Upload, FileText, MoreHorizontal, Loader2, Trash2, Eye, Download, X } from "lucide-react";
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
import { useState, useRef } from "react";
import { toast } from "sonner";

export default function Reports() {
  const { data: reports, isLoading, error } = useReports();
  const { data: members } = useMembers();
  const { data: familyInfo } = useFamilyInfo();
  const { user } = useAuth();
  const addReport = useAddReport();
  const deleteReport = useDeleteReport();
  const [isOpen, setIsOpen] = useState(false);
  const [deleteData, setDeleteData] = useState<{ id: string; title: string; fileUrl?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = familyInfo?.created_by === user?.id;

  // Find the current user's member record
  const currentMember = members?.find(m => m.user_id === user?.id);

  // Filter members for the dropdown: 
  // Admin sees everyone, Members see only themselves
  const selectableMembers = isAdmin 
    ? members 
    : members?.filter(m => m.user_id === user?.id);

  const [formData, setFormData] = useState({
    title: "",
    member_id: "",
    type: "PDF" as "PDF" | "JPG" | "PNG",
  });
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Auto-detect type if not set
      const ext = selectedFile.name.split('.').pop()?.toUpperCase();
      if (ext === 'PDF' || ext === 'JPG' || ext === 'PNG') {
        setFormData(prev => ({ ...prev, type: ext as any }));
      }
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: selectedFile.name.split('.')[0] }));
      }
    }
  };

  const handleAddReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.member_id) {
      toast.error("Please select a family member.");
      return;
    }
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    try {
      await addReport.mutateAsync({
        report: {
          title: formData.title,
          member_id: formData.member_id,
          type: formData.type,
          uploaded_at: new Date().toISOString(),
        },
        file: file,
      });
      setIsOpen(false);
      setFormData({ title: "", member_id: "", type: "PDF" });
      setFile(null);
      toast.success("Report added successfully!");
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || "Unknown error occurred";
      if (errorMessage.includes("bucket not found")) {
        toast.error("Upload failed: 'reports' storage bucket not found in Supabase.");
      } else if (errorMessage.includes("column \"file_url\" does not exist")) {
        toast.error("Database error: 'file_url' column is missing from 'reports' table.");
      } else {
        toast.error(`Failed to add report: ${errorMessage}`);
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteData) return;
    try {
      await deleteReport.mutateAsync({ id: deleteData.id, fileUrl: deleteData.fileUrl });
      toast.success(`${deleteData.title} has been removed.`);
      setDeleteData(null);
    } catch (err) {
      toast.error("Failed to remove report.");
    }
  };

  const handlePreview = (url: string) => {
    window.open(url, '_blank');
  };

  const handleDownload = (url: string, title: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setFile(null);
            setFormData({ title: "", member_id: "", type: "PDF" });
          } else if (!isAdmin && currentMember) {
            // Auto-select the member if they are not an admin
            setFormData(prev => ({ ...prev, member_id: currentMember.id }));
          }
        }}>
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
                  <Label htmlFor="file">Select File</Label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    {file ? (
                      <div className="flex items-center gap-2 text-primary font-medium">
                        <FileText className="h-5 w-5" />
                        <span>{file.name}</span>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 ml-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click to select PDF, JPG or PNG</p>
                      </>
                    )}
                  </div>
                </div>

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
                        {selectableMembers?.map((member) => (
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
                    {addReport.isPending ? "Uploading..." : "Add Report"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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
              
              <div className="flex items-center gap-1">
                {report.file_url && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => handlePreview(report.file_url!)}
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => handleDownload(report.file_url!, report.title)}
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </>
                )}
                {(isAdmin || report.user_id === user?.id) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive gap-2 cursor-pointer font-bold"
                        onClick={() => setDeleteData({ id: report.id, title: report.title, fileUrl: report.file_url })}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove Record
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <AlertDialog open={!!deleteData} onOpenChange={(open) => !open && setDeleteData(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the report <span className="font-bold text-foreground">"{deleteData?.title}"</span> from your family's records. This action cannot be undone.
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
