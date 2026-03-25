import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, CalendarCheck } from "lucide-react";
import { format } from "date-fns";

const demoCheckups = [
  { id: "1", type: "doctor visit", title: "Annual checkup - Dad", scheduledDate: new Date(2026, 3, 2, 10, 0), member: "Dad", status: "upcoming" as const },
  { id: "2", type: "lab test", title: "Blood work - Mom", scheduledDate: new Date(2026, 3, 5, 9, 30), member: "Mom", status: "upcoming" as const },
  { id: "3", type: "vaccination", title: "Flu vaccine - Grandma", scheduledDate: new Date(2026, 2, 20, 14, 0), member: "Grandma", status: "completed" as const },
  { id: "4", type: "scan", title: "X-ray - Grandpa", scheduledDate: new Date(2026, 2, 15, 11, 0), member: "Grandpa", status: "completed" as const },
];

const upcoming = demoCheckups.filter((c) => c.status === "upcoming");
const past = demoCheckups.filter((c) => c.status !== "upcoming");

export default function Checkups() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Health Checkups</h1>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Schedule Checkup
        </Button>
      </div>

      <section>
        <h2 className="section-heading mb-3">Upcoming</h2>
        <div className="space-y-3">
          {upcoming.map((checkup) => (
            <div key={checkup.id} className="card-medical flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning shrink-0">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <span className="font-medium text-sm">{checkup.title}</span>
                <p className="caption">{checkup.type} · {format(checkup.scheduledDate, "MMM d, yyyy 'at' h:mm a")}</p>
              </div>
              <StatusBadge status={checkup.status} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-heading mb-3">Past</h2>
        <div className="space-y-3">
          {past.map((checkup) => (
            <div key={checkup.id} className="card-medical flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success shrink-0">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <span className="font-medium text-sm">{checkup.title}</span>
                <p className="caption">{checkup.type} · {format(checkup.scheduledDate, "MMM d, yyyy 'at' h:mm a")}</p>
              </div>
              <StatusBadge status={checkup.status} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
