import { DaySummaryStats } from "@/components/dashboard/DaySummaryStats";
import { DoseCard } from "@/components/dashboard/DoseCard";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";

// Demo data for the UI shell
const demoSchedules = [
  { id: "1", memberName: "Dad", medicineName: "Metformin", dosage: "500mg", scheduledTime: "08:00 AM", instructions: "After food", status: "taken" as const },
  { id: "2", memberName: "Mom", medicineName: "Lisinopril", dosage: "10mg", scheduledTime: "09:00 AM", instructions: "Before food", status: "taken" as const },
  { id: "3", memberName: "Grandma", medicineName: "Atorvastatin", dosage: "20mg", scheduledTime: "10:00 AM", instructions: "No restriction", status: "missed" as const },
  { id: "4", memberName: "Dad", medicineName: "Aspirin", dosage: "75mg", scheduledTime: "02:00 PM", instructions: "After food", status: "pending" as const },
  { id: "5", memberName: "Mom", medicineName: "Vitamin D3", dosage: "1000 IU", scheduledTime: "02:00 PM", instructions: "With food", status: "pending" as const },
  { id: "6", memberName: "Grandpa", medicineName: "Amlodipine", dosage: "5mg", scheduledTime: "09:00 PM", instructions: "No restriction", status: "pending" as const },
];

// Sort: missed first, then pending, then taken
const sortedSchedules = [...demoSchedules].sort((a, b) => {
  const order = { missed: 0, pending: 1, taken: 2 };
  return order[a.status] - order[b.status];
});

const stats = {
  total: demoSchedules.length,
  taken: demoSchedules.filter((s) => s.status === "taken").length,
  missed: demoSchedules.filter((s) => s.status === "missed").length,
  upcoming: demoSchedules.filter((s) => s.status === "pending").length,
};

export default function Dashboard() {
  const today = format(new Date(), "EEEE, MMMM d, yyyy");

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="caption flex items-center gap-1.5 mt-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {today}
          </p>
        </div>
      </div>

      <DaySummaryStats {...stats} />

      {/* Refill warning banner */}
      <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 flex items-center gap-3">
        <span className="text-warning text-lg">💊</span>
        <div className="flex-1">
          <p className="text-sm font-medium">Low supply: Metformin for Dad ends in 3 days</p>
          <p className="caption">Consider refilling the prescription soon.</p>
        </div>
      </div>

      <div>
        <h2 className="section-heading mb-3">Today's Schedule</h2>
        <div className="space-y-3">
          {sortedSchedules.map((dose) => (
            <DoseCard
              key={dose.id}
              memberName={dose.memberName}
              medicineName={dose.medicineName}
              dosage={dose.dosage}
              scheduledTime={dose.scheduledTime}
              instructions={dose.instructions}
              status={dose.status}
              onMarkTaken={() => {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
