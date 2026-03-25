import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const weeklyData = [
  { day: "Mon", taken: 8, missed: 1 },
  { day: "Tue", taken: 9, missed: 0 },
  { day: "Wed", taken: 7, missed: 2 },
  { day: "Thu", taken: 9, missed: 0 },
  { day: "Fri", taken: 6, missed: 3 },
  { day: "Sat", taken: 8, missed: 1 },
  { day: "Sun", taken: 9, missed: 0 },
];

const adherenceData = [
  { medicine: "Metformin", member: "Dad", adherence: 93 },
  { medicine: "Lisinopril", member: "Mom", adherence: 100 },
  { medicine: "Atorvastatin", member: "Grandma", adherence: 78 },
  { medicine: "Amlodipine", member: "Grandpa", adherence: 86 },
  { medicine: "Vitamin D3", member: "Mom", adherence: 100 },
  { medicine: "Aspirin", member: "Dad", adherence: 93 },
];

export default function Analytics() {
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
              {adherenceData.map((row, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="py-2.5 font-medium">{row.medicine}</td>
                  <td className="py-2.5 text-muted-foreground">{row.member}</td>
                  <td className="py-2.5 text-right">
                    <span
                      className={`font-semibold ${
                        row.adherence >= 90
                          ? "text-success"
                          : row.adherence >= 75
                          ? "text-warning"
                          : "text-destructive"
                      }`}
                    >
                      {row.adherence}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
