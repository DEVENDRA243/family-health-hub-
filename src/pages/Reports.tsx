import { Button } from "@/components/ui/button";
import { Upload, FileText, MoreHorizontal } from "lucide-react";

const demoReports = [
  { id: "1", title: "Blood Test Results", member: "Dad", uploadedAt: "Mar 15, 2026", type: "PDF" },
  { id: "2", title: "X-Ray Report", member: "Grandpa", uploadedAt: "Mar 10, 2026", type: "JPG" },
  { id: "3", title: "Prescription - March", member: "Mom", uploadedAt: "Mar 5, 2026", type: "PDF" },
  { id: "4", title: "ECG Report", member: "Grandma", uploadedAt: "Feb 28, 2026", type: "PDF" },
];

export default function Reports() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Reports & Prescriptions</h1>
        <Button size="sm" className="gap-1.5">
          <Upload className="h-4 w-4" />
          Upload File
        </Button>
      </div>

      <div className="space-y-3">
        {demoReports.map((report) => (
          <div key={report.id} className="card-medical flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-medium text-sm">{report.title}</span>
              <p className="caption">{report.member} · {report.uploadedAt} · {report.type}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
