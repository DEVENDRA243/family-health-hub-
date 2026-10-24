import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Pill,
  Users,
  FileText,
  Plus,
  CalendarCheck,
  Upload,
  CheckCircle2,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { useDoses } from "@/hooks/use-health-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function MobileStickyBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [quickActionOpen, setQuickActionOpen] = useState(false);

  const todayDate = format(new Date(), "yyyy-MM-dd");
  const { data: doses } = useDoses(todayDate);
  const pendingDosesCount = doses?.filter((d) => d.status === "pending").length || 0;

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const handleNavigate = (path: string) => {
    navigate(path);
    setQuickActionOpen(false);
  };

  return (
    <>
      {/* Sticky Bottom Bar for Mobile Devices (< 768px) */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-card/95 backdrop-blur-lg border-t border-border shadow-[0_-4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.3)] pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid grid-cols-5 items-center h-16 px-1 max-w-lg mx-auto">
          {/* Dashboard Tab */}
          <button
            onClick={() => navigate("/")}
            className={`flex flex-col items-center justify-center h-full transition-colors relative ${
              isActive("/")
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-[10px] mt-1 tracking-tight">Home</span>
            {isActive("/") && (
              <span className="absolute top-1.5 w-1 h-1 rounded-full bg-primary" />
            )}
          </button>

          {/* Meds Tab */}
          <button
            onClick={() => navigate("/medicines")}
            className={`flex flex-col items-center justify-center h-full transition-colors relative ${
              isActive("/medicines")
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="relative">
              <Pill className="h-5 w-5" />
              {pendingDosesCount > 0 && (
                <span className="absolute -top-1 -right-2 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground shadow-sm">
                  {pendingDosesCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">Meds</span>
            {isActive("/medicines") && (
              <span className="absolute top-1.5 w-1 h-1 rounded-full bg-primary" />
            )}
          </button>

          {/* Center Elevated Action Button */}
          <div className="flex flex-col items-center justify-center">
            <button
              onClick={() => setQuickActionOpen(true)}
              aria-label="Quick Actions Menu"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-emerald-500 text-white shadow-lg shadow-primary/30 active:scale-95 transition-transform -mt-5 ring-4 ring-card"
            >
              <Plus className="h-6 w-6 stroke-[2.5]" />
            </button>
            <span className="text-[9px] font-semibold text-primary mt-0.5 uppercase tracking-wider">
              Quick
            </span>
          </div>

          {/* Members Tab */}
          <button
            onClick={() => navigate("/members")}
            className={`flex flex-col items-center justify-center h-full transition-colors relative ${
              isActive("/members")
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-5 w-5" />
            <span className="text-[10px] mt-1 tracking-tight">Members</span>
            {isActive("/members") && (
              <span className="absolute top-1.5 w-1 h-1 rounded-full bg-primary" />
            )}
          </button>

          {/* Reports Tab */}
          <button
            onClick={() => navigate("/reports")}
            className={`flex flex-col items-center justify-center h-full transition-colors relative ${
              isActive("/reports")
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="h-5 w-5" />
            <span className="text-[10px] mt-1 tracking-tight">Reports</span>
            {isActive("/reports") && (
              <span className="absolute top-1.5 w-1 h-1 rounded-full bg-primary" />
            )}
          </button>
        </div>
      </nav>

      {/* Quick Action Modal for Rapid Mobile Care Operations */}
      <Dialog open={quickActionOpen} onOpenChange={setQuickActionOpen}>
        <DialogContent className="sm:max-w-md max-w-[92vw] rounded-2xl p-6">
          <DialogHeader className="text-left">
            <DialogTitle className="text-lg font-bold flex items-center justify-between">
              <span>Quick Care Actions</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Fast shortcuts for daily medication and health management
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* Quick Action 1: View Pending Doses */}
            <button
              onClick={() => handleNavigate("/medicines")}
              className="flex flex-col items-start p-3.5 rounded-xl border border-border bg-card hover:bg-muted/60 hover:border-primary/40 transition-all text-left group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-2 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-foreground">Log Medication</span>
              <span className="text-[11px] text-muted-foreground mt-0.5">
                {pendingDosesCount > 0
                  ? `${pendingDosesCount} pending today`
                  : "Check today's schedule"}
              </span>
            </button>

            {/* Quick Action 2: Add New Medicine */}
            <button
              onClick={() => handleNavigate("/medicines")}
              className="flex flex-col items-start p-3.5 rounded-xl border border-border bg-card hover:bg-muted/60 hover:border-primary/40 transition-all text-left group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2 group-hover:scale-105 transition-transform">
                <Pill className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-foreground">New Medicine</span>
              <span className="text-[11px] text-muted-foreground mt-0.5">
                Set dosage & timing
              </span>
            </button>

            {/* Quick Action 3: Schedule Checkup */}
            <button
              onClick={() => handleNavigate("/checkups")}
              className="flex flex-col items-start p-3.5 rounded-xl border border-border bg-card hover:bg-muted/60 hover:border-primary/40 transition-all text-left group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-105 transition-transform">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-foreground">Doctor Checkup</span>
              <span className="text-[11px] text-muted-foreground mt-0.5">
                Book appointment
              </span>
            </button>

            {/* Quick Action 4: Upload Report */}
            <button
              onClick={() => handleNavigate("/reports")}
              className="flex flex-col items-start p-3.5 rounded-xl border border-border bg-card hover:bg-muted/60 hover:border-primary/40 transition-all text-left group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-2 group-hover:scale-105 transition-transform">
                <Upload className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-foreground">Lab Report</span>
              <span className="text-[11px] text-muted-foreground mt-0.5">
                AI report analysis
              </span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
