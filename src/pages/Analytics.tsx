import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Loader2, TrendingUp, AlertCircle } from "lucide-react";
import { useWeeklyStats, useMedicineStats } from "@/hooks/use-health-data";

export default function Analytics() {
  const { data: weeklyData, isLoading: isWeeklyLoading, error: weeklyError } = useWeeklyStats();
  const { data: medicineStats, isLoading: isMedLoading, error: medError } = useMedicineStats();

  const isLoading = isWeeklyLoading || isMedLoading;
  const error = weeklyError || medError;

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
        Error loading analytics.
      </div>
    );
  }

  const hasData = weeklyData && weeklyData.some(d => d.taken > 0 || d.missed > 0);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="page-title text-2xl font-bold">Health Analytics</h1>
      </div>

      <div className="card-medical">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="section-heading">Doses: Taken vs Missed (Last 7 Days)</h2>
        </div>
        
        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No dose data recorded for the last 7 days.</p>
            <p className="caption">Start marking doses as taken or missed on the dashboard.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis 
                dataKey="day" 
                className="text-xs fill-muted-foreground" 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                className="text-xs fill-muted-foreground" 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend />
              <Bar dataKey="taken" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} name="Taken" barSize={30} />
              <Bar dataKey="missed" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} name="Missed" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card-medical">
        <h2 className="section-heading mb-4">Adherence by Medicine</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 font-medium text-muted-foreground">Medicine</th>
                <th className="text-left py-2 font-medium text-muted-foreground">Member</th>
                <th className="text-right py-2 font-medium text-muted-foreground">Total Doses</th>
                <th className="text-right py-2 font-medium text-muted-foreground">Adherence</th>
              </tr>
            </thead>
            <tbody>
              {medicineStats?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground">
                    No medicines registered yet.
                  </td>
                </tr>
              ) : (
                medicineStats?.map((med) => (
                  <tr key={med.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 font-medium">{med.name}</td>
                    <td className="py-3 text-muted-foreground">{med.memberName}</td>
                    <td className="py-3 text-right text-muted-foreground">{med.total}</td>
                    <td className="py-3 text-right">
                      <span className={`font-semibold ${
                        med.adherence >= 80 ? 'text-success' : 
                        med.adherence >= 50 ? 'text-warning' : 
                        'text-destructive'
                      }`}>
                        {med.adherence}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
