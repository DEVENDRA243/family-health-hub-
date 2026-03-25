import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Pill, MoreHorizontal } from "lucide-react";

const demoMedicines = [
  { id: "1", name: "Metformin", dosage: "500mg", member: "Dad", instructions: "After food", timings: ["08:00 AM", "09:00 PM"], isActive: true },
  { id: "2", name: "Lisinopril", dosage: "10mg", member: "Mom", instructions: "Before food", timings: ["09:00 AM"], isActive: true },
  { id: "3", name: "Atorvastatin", dosage: "20mg", member: "Grandma", instructions: "No restriction", timings: ["10:00 AM"], isActive: true },
  { id: "4", name: "Amlodipine", dosage: "5mg", member: "Grandpa", instructions: "No restriction", timings: ["09:00 PM"], isActive: true },
  { id: "5", name: "Vitamin D3", dosage: "1000 IU", member: "Mom", instructions: "With food", timings: ["02:00 PM"], isActive: true },
  { id: "6", name: "Aspirin", dosage: "75mg", member: "Dad", instructions: "After food", timings: ["02:00 PM"], isActive: true },
];

export default function Medicines() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Medicines</h1>
          <p className="caption mt-1">{demoMedicines.length} active medicines</p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Medicine
        </Button>
      </div>

      <div className="space-y-3">
        {demoMedicines.map((med) => (
          <div key={med.id} className="card-medical flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <Pill className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{med.name}</span>
                <span className="caption">· {med.dosage}</span>
              </div>
              <p className="caption">
                {med.member} · {med.instructions} · {med.timings.join(", ")}
              </p>
            </div>
            {med.isActive && <StatusBadge status="taken" />}
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
