interface StatCardProps {
  label: string;
  value: number;
  colorClass: string;
}

function StatCard({ label, value, colorClass }: StatCardProps) {
  return (
    <div className="card-medical flex flex-col items-center justify-center py-4">
      <span className={`text-3xl font-bold ${colorClass}`}>{value}</span>
      <span className="caption mt-1">{label}</span>
    </div>
  );
}

interface DaySummaryStatsProps {
  total: number;
  taken: number;
  missed: number;
  upcoming: number;
}

export function DaySummaryStats({ total, taken, missed, upcoming }: DaySummaryStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard label="Total Doses" value={total} colorClass="text-foreground" />
      <StatCard label="Taken" value={taken} colorClass="text-success" />
      <StatCard label="Missed" value={missed} colorClass="text-destructive" />
      <StatCard label="Upcoming" value={upcoming} colorClass="text-warning" />
    </div>
  );
}
