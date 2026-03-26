import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Loader2 } from "lucide-react";
import { useMedicines } from "@/hooks/use-health-data";

export default function Analytics() {
  const { data: medicines, isLoading, error } = useMedicines();

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

  // Note: For a real app, you'd fetch this from a 'stats' table in Supabase
  // For now, we'll keep the static chart but make the table dynamic based on medicines
  const weeklyData = [
    { day: "Mon", taken: 8, missed: 1 },
    { day: "Tue", taken: 9, missed: 0 },
    { day: "Wed", taken: 7, missed: 2 },
    { day: "Thu", taken: 9, missed: 0 },
    { day: "Fri", taken: 6, missed: 3 },
    { day: "Sat", taken: 8, missed: 1 },
    { day: "Sun", taken: 9, missed: 0 },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="page-title">Weekly Analytics</h1>

      <div className="card-medical">
        <h2 className="section-heading mb-4">Doses: Taken vs Missed (Last 7 Days)</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="day" className="text-xs fill-muted-foreground" />
            <YAxis className="text-xs fill-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend />
            <Bar dataKey="taken" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} name="Taken" />
            <Bar dataKey="missed" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} name="Missed" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card-medical">
        <h2 className="section-heading mb-4">Adherence by Medicine</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 font-medium text-muted-foreground">Medicine</th>
                <th className="text-left py-2 font-medium text-muted-foreground">Member</th>
                <th className="text-right py-2 font-medium text-muted-foreground">Adherence</th>
              </tr>
            </thead>
            <tbody>
              {medicines?.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-muted-foreground">No data available.</td>
                </tr>
              ) : (
                medicines?.map((med) => (
                  <tr key={med.id} className="border-b border-border last:border-0">
                    <td className="py-2.5 font-medium">{med.name}</td>
                    <td className="py-2.5 text-muted-foreground">{med.members?.name || "Unknown"}</td>
                    <td className="py-2.5 text-right">
                      <span className="font-semibold text-success">100%</span>
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
