import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Search, 
  FileText, 
  MoreVertical, 
  Eye, 
  Download, 
  Trash2, 
  Upload, 
  X, 
  Sparkles, 
  Activity, 
  ShieldAlert, 
  Stethoscope, 
  ClipboardList, 
  Share2, 
  Copy,
  Info,
  Loader2
} from "lucide-react";
import { useReports, useMembers, useAddReport, useFamilyInfo, useDeleteReport } from "@/hooks/use-health-data";
import { useAuth } from "@/hooks/use-auth";
import { Report } from "@/types/health";
import { format, parseISO } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
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
import { supabase } from "@/lib/supabase";

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

  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState<Record<string, boolean>>({});
  const [selectedSummaryReport, setSelectedSummaryReport] = useState<Report | null>(null);

  const isAdmin = familyInfo?.created_by === user?.id;

  const currentMember = members?.find(m => m.user_id === user?.id);

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

  const handleAISummary = async (report: Report) => {
     if (summaries[report.id]) {
        setSelectedSummaryReport(report);
        return;
     }
     
     if (!report.file_url) {
        toast.error("File URL is missing.");
        return;
     }

     setIsAnalyzing(prev => ({ ...prev, [report.id]: true }));
     
     try {
       const url = report.file_url;
       const response = await fetch(url);
       if (!response.ok) throw new Error("Failed to fetch file");
       const blob = await response.blob();
       
       const extension = report.type.toLowerCase() || url.split('.').pop()?.toLowerCase() || '';
       let mimeType = blob.type;
       if (!mimeType || mimeType === 'application/octet-stream') {
           if (extension === 'pdf') mimeType = 'application/pdf';
           else if (extension === 'jpg' || extension === 'jpeg') mimeType = 'image/jpeg';
           else if (extension === 'png') mimeType = 'image/png';
       }

       const reader = new FileReader();
       const base64data = await new Promise<string>((resolve, reject) => {
         reader.onloadend = () => {
           const result = reader.result as string; 
           resolve(result.split(',')[1]);
         };
         reader.onerror = reject;
         reader.readAsDataURL(blob);
       });

       const getSummary = async (retryCount = 0): Promise<string> => {
          const messages = [{
               role: "user",
               content: [
                 {
                   type: "image_url",
                   image_url: {
                     url: `data:${mimeType};base64,${base64data}`
                   }
                 },
                 {
                   type: "text",
                   text: "You are a medical assistant. Analyze this medical report and provide:\n" +
                         "- Overall health status (1 line summary)\n" +
                         "- Key findings (bullet points in simple language)\n" +
                         "- Any abnormal values explained in plain English\n" +
                         "- Recommended next steps for the patient\n" +
                         "End with: This is AI-generated and not a substitute for medical advice."
                 }
               ]
          }];

          try {
              const { data, error } = await supabase.functions.invoke('analyze-medical-data', {
                body: {
                  messages,
                  model: "google/gemini-2.0-flash-exp"
                }
              });
              
              if (error) {
                 console.error("Supabase function error:", error);
                 if (error.status === 429) throw new Error("Too many requests. Please wait a minute and try again.");
                 throw new Error(error.message || "Connection failed");
              }
              
              if (data?.isAiError) {
                 console.error("AI service error:", data.error);
                 throw new Error(data.error || "AI service error");
              }
              
              return data.choices?.[0]?.message?.content || "No summary available.";
          } catch (err: any) {
             if (err instanceof TypeError && retryCount < 1) { 
                return getSummary(retryCount + 1);
             }
             throw err;
          }
       };

       const summaryText = await getSummary();
       setSummaries(prev => ({ ...prev, [report.id]: summaryText }));
       setSelectedSummaryReport(report);
     } catch (err: any) {
        console.error("AI Summary error:", err);
        toast.error(err.message || "Unable to analyze report. Please try again.");
     } finally {
        setIsAnalyzing(prev => ({ ...prev, [report.id]: false }));
     }
  };

  const renderText = (str: string) => {
      const parts = str.split(/(\*\*.*?\*\*)/g);
      return parts.map((p, i) => {
         if (p.startsWith('**') && p.endsWith('**')) {
            return <strong key={i} className="font-semibold text-foreground">{p.slice(2, -2)}</strong>;
         }
         return <span key={i}>{p}</span>;
      });
  };

  const formatSummary = (text: string) => {
    if (!text) return null;
    
    const sections: { title: string, content: string[], type: 'status' | 'findings' | 'abnormal' | 'steps' | 'note' }[] = [];
    let currentSection: { title: string, content: string[], type: 'status' | 'findings' | 'abnormal' | 'steps' | 'note' } | null = null;

    const findOrCreateSection = (title: string, type: 'status' | 'findings' | 'abnormal' | 'steps' | 'note') => {
      let existing = sections.find(s => s.type === type);
      if (existing) {
        currentSection = existing;
      } else {
        currentSection = { title, content: [], type };
        sections.push(currentSection);
      }
    };

    const lines = text.split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const lower = trimmed.toLowerCase();

      if (lower.match(/^#+|status|summary|^overall/)) {
        findOrCreateSection("Overall Health Status", 'status');
        // If the header itself contains specific text, add it (unless it's just the word "status")
        if (trimmed.split(' ').length > 2) currentSection?.content.push(trimmed.replace(/^#+\s*/, ''));
      } else if (lower.includes("findings")) {
        findOrCreateSection("Key Findings", 'findings');
      } else if (lower.includes("abnormal")) {
        findOrCreateSection("Abnormal Values Explained", 'abnormal');
      } else if (lower.includes("steps") || lower.includes("recommend")) {
        findOrCreateSection("Recommended Next Steps", 'steps');
      } else if (lower.includes("medical advice") || lower.includes("disclaimer")) {
        findOrCreateSection("Medical Disclaimer", 'note');
        currentSection?.content.push(trimmed); // Add the actual disclaimer text
      } else if (currentSection) {
        currentSection.content.push(trimmed.replace(/^[-*]\s*/, ''));
      } else {
        // Fallback for stray lines
        findOrCreateSection("Report Analysis", 'findings');
        currentSection?.content.push(trimmed.replace(/^[-*]\s*/, ''));
      }
    });

    // Cleanup: Remove empty sections
    const finalSections = sections.filter(s => s.content.length > 0);

    if (sections.length === 0) {
      return (
        <div className="p-4 rounded-xl border bg-muted/30">
          {lines.map((l, i) => <p key={i} className="mb-2 text-sm leading-relaxed">{renderText(l)}</p>)}
        </div>
      );
    }

    return (
      <div className="space-y-4 text-left">
        {finalSections.map((section, sIdx) => {
          let icon = <ClipboardList className="h-4 w-4" />;
          let bgColor = "bg-muted/30";
          let borderColor = "border-border/60";
          let headerColor = "text-foreground/70";
          
          if (section.type === 'status') {
            icon = <Activity className="h-4 w-4" />;
            bgColor = "bg-blue-50/40 dark:bg-blue-900/10";
            borderColor = "border-blue-200/50 dark:border-blue-800/50";
            headerColor = "text-blue-700 dark:text-blue-400";
          } else if (section.type === 'abnormal') {
            icon = <ShieldAlert className="h-4 w-4" />;
            bgColor = "bg-rose-50/40 dark:bg-rose-900/10";
            borderColor = "border-rose-200/50 dark:border-rose-800/50";
            headerColor = "text-rose-700 dark:text-rose-400";
          } else if (section.type === 'steps') {
            icon = <Stethoscope className="h-4 w-4" />;
            bgColor = "bg-emerald-50/40 dark:bg-emerald-900/10";
            borderColor = "border-emerald-200/50 dark:border-emerald-800/50";
            headerColor = "text-emerald-700 dark:text-emerald-400";
          } else if (section.type === 'note') {
            icon = <Info className="h-3.5 w-3.5 text-muted-foreground" />;
            bgColor = "bg-slate-50 dark:bg-slate-900/40";
            borderColor = "border-slate-200 dark:border-slate-800";
            headerColor = "text-slate-500";
          }

          return (
            <div key={sIdx} className={`rounded-xl border ${borderColor} ${bgColor} p-4 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both`} style={{ animationDelay: `${sIdx * 100}ms` }}>
              <h4 className={`font-black flex items-center gap-2 mb-3 text-[10px] tracking-wider uppercase ${headerColor}`}>
                {icon} {section.title}
              </h4>
              <div className="space-y-2">
                {section.content.map((item, iIdx) => (
                  <div key={iIdx} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground font-medium">
                    {section.type !== 'status' && section.type !== 'note' && (
                       <div className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${section.type === 'abnormal' ? 'bg-rose-500/40' : section.type === 'steps' ? 'bg-emerald-500/40' : 'bg-primary/40'}`} />
                    )}
                    <span className={section.type === 'status' ? 'text-foreground font-bold' : ''}>{renderText(item)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                      onClick={() => handleAISummary(report)}
                      disabled={isAnalyzing[report.id]}
                      title="AI Summary"
                    >
                      {isAnalyzing[report.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </Button>
                  </>
                )}
                {(isAdmin || report.user_id === user?.id) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground shrink-0">
                        <MoreVertical className="h-4 w-4" />
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

      <Dialog open={!!selectedSummaryReport} onOpenChange={(open) => !open && setSelectedSummaryReport(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
          {/* Custom Premium Header */}
          <div className="bg-gradient-to-r from-primary to-primary-foreground/10 px-6 py-6 text-white relative">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles className="h-20 w-20 rotate-12" />
             </div>
             <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 animate-pulse">
                   <Sparkles className="h-6 w-6 text-amber-300" />
                </div>
                <div>
                   <DialogTitle className="text-2xl font-black tracking-tight text-white m-0">AI Summary</DialogTitle>
                   <DialogDescription className="text-white/70 font-bold opacity-80 mt-0.5">
                     Verified medical report analysis · {selectedSummaryReport?.title}
                   </DialogDescription>
                </div>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-background">
            {selectedSummaryReport && summaries[selectedSummaryReport.id] && (
              <div className="pb-4">
                {formatSummary(summaries[selectedSummaryReport.id])}
              </div>
            )}
          </div>

          <DialogFooter className="bg-muted/30 px-6 py-4 flex-row items-center justify-between border-t border-border/50">
            <div className="flex gap-2">
               <Button variant="ghost" size="sm" className="h-9 px-3 gap-1.5 font-bold opacity-40 hover:opacity-100 transition-opacity">
                  <Copy className="h-4 w-4" />
                  Copy
               </Button>
               <Button variant="ghost" size="sm" className="h-9 px-3 gap-1.5 font-bold opacity-40 hover:opacity-100 transition-opacity">
                  <Share2 className="h-4 w-4" />
                  Email
               </Button>
            </div>
            <Button
              type="button"
              onClick={() => setSelectedSummaryReport(null)}
              className="font-black px-6 shadow-lg shadow-primary/20"
            >
              DONE
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
