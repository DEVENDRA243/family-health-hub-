import { DaySummaryStats } from "@/components/dashboard/DaySummaryStats";
import { DoseCard } from "@/components/dashboard/DoseCard";
import { CheckupCard } from "@/components/dashboard/CheckupCard";
import { CalendarDays, Loader2, CheckCircle2, AlertCircle, History, Stethoscope } from "lucide-react";
import { format, isPast, parse, isSameDay, parseISO } from "date-fns";
import { useDoses, useUpdateDoseStatus, useCheckups, useUpdateCheckupStatus } from "@/hooks/use-health-data";
import { toast } from "sonner";

export default function Dashboard() {
  const todayDate = format(new Date(), "yyyy-MM-dd");
  const todayFormatted = format(new Date(), "EEEE, MMMM d, yyyy");
  
  const { data: doses, isLoading: isDosesLoading, error: dosesError } = useDoses(todayDate);
  const { data: checkups, isLoading: isCheckupsLoading, error: checkupsError } = useCheckups();
  const updateStatus = useUpdateDoseStatus();
  const updateCheckupStatus = useUpdateCheckupStatus();

  const handleMarkTaken = async (doseId: string, medicineName: string, memberName: string) => {
    try {
      await updateStatus.mutateAsync({ id: doseId, status: 'taken' });
      toast.success(`${memberName} marked ${medicineName} as TAKEN!`, {
        description: `Logged at ${format(new Date(), "hh:mm a")}`,
        icon: <CheckCircle2 className="h-5 w-5 text-success" />,
      });
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const handleMarkMissed = async (doseId: string, medicineName: string, memberName: string) => {
    try {
      await updateStatus.mutateAsync({ id: doseId, status: 'missed' });
      toast.error(`${memberName} marked ${medicineName} as NOT TAKEN!`, {
        description: `Logged at ${format(new Date(), "hh:mm a")}`,
        icon: <AlertCircle className="h-5 w-5 text-destructive" />,
      });
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const handleMarkCheckupCompleted = async (checkupId: string, title: string, memberName: string) => {
    try {
      await updateCheckupStatus.mutateAsync({ id: checkupId, status: 'completed' });
      toast.success(`${memberName}'s ${title} marked as COMPLETED!`, {
        icon: <CheckCircle2 className="h-5 w-5 text-success" />,
      });
    } catch (err) {
      toast.error("Failed to update checkup status.");
    }
  };

  if (isDosesLoading || isCheckupsLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (dosesError || checkupsError) {
    return (
      <div className="p-4 text-destructive bg-destructive/10 rounded-lg">
        <p className="font-bold">Error loading dashboard data:</p>
        <p className="text-sm">{(dosesError as any)?.message || (checkupsError as any)?.message || "Unknown error"}</p>
      </div>
    );
  }

  // Filter today's checkups
  const todayCheckups = checkups?.filter(checkup => 
    isSameDay(parseISO(checkup.scheduled_date), new Date())
  ) || [];

  // Auto-identify missed doses (if time is past and still pending)
  const processedDoses = doses?.map(dose => {
    const doseTime = parse(dose.scheduled_time, "hh:mm a", new Date());
    if (dose.status === 'pending' && isPast(doseTime)) {
      return { ...dose, status: 'missed' as const };
    }
    return dose;
  }) || [];

  const sortedSchedules = [...processedDoses].sort((a, b) => {
    const order = { missed: 0, pending: 1, taken: 2 };
    return order[a.status as keyof typeof order] - order[b.status as keyof typeof order];
  });

  const stats = {
    total: processedDoses.length,
    taken: processedDoses.filter((s) => s.status === "taken").length,
    missed: processedDoses.filter((s) => s.status === "missed").length,
    upcoming: processedDoses.filter((s) => s.status === "pending").length,
  };

  const recentTaken = processedDoses
    .filter(d => d.status === 'taken')
    .slice(0, 3);

  const recentCheckups = todayCheckups
    .filter(c => c.status === 'completed')
    .slice(0, 2);

  // Side Panel for the Head of the Family
  return (
    <div className="space-y-6 max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title text-2xl font-bold">Family Health Control</h1>
            <p className="caption flex items-center gap-1.5 mt-1 font-bold text-primary uppercase tracking-wider">
              <CalendarDays className="h-3.5 w-3.5" />
              LIVE MONITORING: {todayFormatted}
            </p>
          </div>
        </div>

        {/* HEAD'S STATUS SUMMARY */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card-medical bg-success/10 border-success/20 p-3 text-center">
            <p className="text-[10px] font-bold text-success uppercase">Taken</p>
            <p className="text-2xl font-black text-success">{stats.taken}</p>
          </div>
          <div className="card-medical bg-warning/10 border-warning/20 p-3 text-center text-warning">
            <p className="text-[10px] font-bold uppercase">Pending</p>
            <p className="text-2xl font-black">{stats.upcoming}</p>
          </div>
          <div className="card-medical bg-destructive/10 border-destructive/20 p-3 text-center text-destructive">
            <p className="text-[10px] font-bold uppercase">Missed</p>
            <p className="text-2xl font-black">{stats.missed}</p>
          </div>
        </div>

        {stats.missed > 0 && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex items-center gap-3 animate-pulse">
            <AlertCircle className="text-destructive h-5 w-5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-destructive">ATTENTION HEAD: {stats.missed} doses missed!</p>
              <p className="caption">Please check on family members who haven't taken their meds.</p>
            </div>
          </div>
        )}

        <div>
          <h2 className="section-heading mb-3 flex items-center gap-2">
            Today's Live Schedule 
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
          </h2>
          
          <div className="space-y-6">
            {/* MEDICINES SECTION */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Medicines</span>
              </div>
              {sortedSchedules.length === 0 ? (
                <div className="text-center py-8 bg-muted/30 rounded-xl border border-dashed border-border">
                  <p className="text-xs text-muted-foreground font-medium">No medicines scheduled for today.</p>
                </div>
              ) : (
                sortedSchedules.map((dose) => (
                  <DoseCard
                    key={dose.id}
                    memberName={dose.medicines?.members?.name || "Unknown"}
                    medicineName={dose.medicines?.name || "Unknown"}
                    dosage={dose.medicines?.dosage || ""}
                    scheduledTime={dose.scheduled_time}
                    instructions={dose.medicines?.instructions || ""}
                    status={dose.status}
                    onMarkTaken={() => handleMarkTaken(
                      dose.id, 
                      dose.medicines?.name, 
                      dose.medicines?.members?.name
                    )}
                    onMarkMissed={() => handleMarkMissed(
                      dose.id, 
                      dose.medicines?.name, 
                      dose.medicines?.members?.name
                    )}
                  />
                ))
              )}
            </div>

            {/* CHECKUPS SECTION */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <div className="h-1.5 w-1.5 rounded-full bg-warning" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Today's Checkups</span>
              </div>
              {todayCheckups.length === 0 ? (
                <div className="text-center py-8 bg-muted/30 rounded-xl border border-dashed border-border">
                  <p className="text-xs text-muted-foreground font-medium">No checkups scheduled for today.</p>
                </div>
              ) : (
                todayCheckups.map((checkup) => (
                  <CheckupCard
                    key={checkup.id}
                    memberName={checkup.members?.name || "Unknown"}
                    title={checkup.title}
                    type={checkup.type}
                    scheduledDate={checkup.scheduled_date}
                    status={checkup.status}
                    onMarkCompleted={() => handleMarkCheckupCompleted(
                      checkup.id,
                      checkup.title,
                      checkup.members?.name
                    )}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Side Panel for the Head of the Family */}
      <div className="space-y-6">
        <div className="card-medical border-primary/20 bg-primary/5">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <History className="h-4 w-4" />
            Live Activity Feed
          </h3>
          <div className="space-y-4">
            {recentTaken.length === 0 && recentCheckups.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-4">
                No activity yet. Waiting for members to take meds or finish checkups...
              </p>
            ) : (
              <>
                {recentTaken.map((dose) => (
                  <div key={dose.id} className="flex items-start gap-3 border-l-2 border-success pl-3 py-1">
                    <div className="flex-1">
                      <p className="text-xs">
                        <span className="font-bold text-primary">{dose.medicines?.members?.name}</span> took 
                        <span className="font-bold"> {dose.medicines?.name}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Successfully logged at {dose.scheduled_time}
                      </p>
                    </div>
                    <CheckCircle2 className="h-3 w-3 text-success shrink-0 mt-1" />
                  </div>
                ))}
                {recentCheckups.map((checkup) => (
                  <div key={checkup.id} className="flex items-start gap-3 border-l-2 border-warning pl-3 py-1">
                    <div className="flex-1">
                      <p className="text-xs">
                        <span className="font-bold text-warning">{checkup.members?.name}</span> completed 
                        <span className="font-bold"> {checkup.title}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Appointment finished at {format(parseISO(checkup.scheduled_date), "h:mm a")}
                      </p>
                    </div>
                    <CheckCircle2 className="h-3 w-3 text-warning shrink-0 mt-1" />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="card-medical">
          <h3 className="font-bold text-sm mb-2">Head's Quick Tip</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Red alerts appear if a dose is past its time and hasn't been marked. 
            Green checks confirm the member clicked the button.
          </p>
        </div>
      </div>
    </div>
  );
}
