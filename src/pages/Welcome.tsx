import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Heart,
  CheckCircle2,
  Pill,
  Users,
  AlertTriangle,
  ArrowRight,
  Copy,
  Check,
  Sparkles,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFamilyInfo, useMembers } from "@/hooks/use-health-data";
import { toast } from "sonner";
import { usePageMeta } from "@/components/shared/PageMeta";

export default function Welcome() {
  const { data: familyInfo } = useFamilyInfo();
  const { data: members } = useMembers();
  const navigate = useNavigate();
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  usePageMeta(
    "Welcome to FamilyHealth Hub | Care Onboarding",
    "Your family health circle is now live. Learn the 3 quick steps to track daily medications and coordinate care."
  );

  const familyName = familyInfo?.name || "Your Family Care Circle";
  const inviteCode = familyInfo?.invite_code || "";

  const handleCopyCode = () => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    toast.success("Invite code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Celebration Header Card */}
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/10 via-card to-card p-6 sm:p-10 text-center shadow-xl space-y-4">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative inline-flex items-center justify-center">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-tr from-primary to-emerald-500 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30 animate-in zoom-in-75 duration-300">
              <Heart className="h-9 w-9 sm:h-11 sm:w-11 fill-current stroke-[1.5]" />
            </div>
            <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="space-y-2 relative">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Care Circle Activated</span>
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
              Welcome to {familyName}!
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
              Your centralized digital care hub is ready. Coordinate medications, monitor checkups, and keep loved ones safe in real time.
            </p>
          </div>

          {/* Invite Code Quick Share Box */}
          {inviteCode && (
            <div className="pt-2 relative max-w-sm mx-auto">
              <div className="p-3 rounded-2xl bg-muted/60 border border-border flex items-center justify-between gap-3">
                <div className="text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Family Invite Code
                  </span>
                  <span className="font-mono text-base font-black tracking-widest text-primary">
                    {inviteCode}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyCode}
                  className="gap-1.5 h-8 text-xs font-semibold"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Share Code</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* 3 Quick Start Milestones */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-2">
            3 Recommended Next Steps
          </h2>

          <div className="grid gap-3 sm:grid-cols-3">
            {/* Step 1 */}
            <Link
              to="/medicines"
              className="p-4 rounded-2xl border border-border bg-card hover:bg-muted/50 hover:border-primary/40 transition-all space-y-2 group flex flex-col justify-between text-left"
            >
              <div className="space-y-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                  <Pill className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-foreground">1. Schedule Meds</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Enter daily prescriptions with fixed-time dropdowns & dosage notes.
                </p>
              </div>
              <span className="text-[11px] font-bold text-primary inline-flex items-center gap-1 pt-2">
                <span>Add Medicines</span>
                <ArrowRight className="h-3 w-3" />
              </span>
            </Link>

            {/* Step 2 */}
            <Link
              to="/members"
              className="p-4 rounded-2xl border border-border bg-card hover:bg-muted/50 hover:border-primary/40 transition-all space-y-2 group flex flex-col justify-between text-left"
            >
              <div className="space-y-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-foreground">2. Add Members</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Create profiles for parents or children with blood types & allergies.
                </p>
              </div>
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 inline-flex items-center gap-1 pt-2">
                <span>View Profiles</span>
                <ArrowRight className="h-3 w-3" />
              </span>
            </Link>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl border border-border bg-card space-y-2 flex flex-col justify-between text-left">
              <div className="space-y-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emergency/10 text-emergency">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-foreground">3. Emergency Alert</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The red Emergency button in your top header transmits instant GPS alerts to members.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground pt-2">
                Ready in header
              </span>
            </div>
          </div>
        </div>

        {/* Enter Dashboard Primary Action */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button
            size="lg"
            onClick={() => navigate("/")}
            className="w-full sm:w-auto px-8 h-12 text-sm font-bold gap-2 rounded-xl shadow-lg shadow-primary/20"
          >
            <span>Enter Family Health Hub</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/members")}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Manage Caregivers & Invite Members
          </Button>
        </div>
      </div>
    </div>
  );
}
