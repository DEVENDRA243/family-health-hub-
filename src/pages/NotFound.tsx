import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Stethoscope, ArrowLeft, Home, ShieldAlert, HeartPulse } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.warn("404 Error: Non-existent route accessed:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      {/* Subtle ambient medical glow background */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full text-center relative z-10 space-y-6">
        {/* Animated Badge */}
        <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5">
          <Stethoscope className="h-12 w-12 animate-pulse" />
        </div>

        {/* 404 Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-destructive/10 text-destructive border border-destructive/20">
            <ShieldAlert className="h-3.5 w-3.5" />
            Error 404 · Missing Record
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Page Not Found
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed pt-1">
            The health record, appointment, or page you were looking for doesn't exist, may have been moved, or the link has expired.
          </p>
        </div>

        {/* Quick Route Context */}
        <div className="bg-muted/40 border border-border/60 rounded-xl p-3 text-xs font-mono text-muted-foreground break-all">
          Requested URL: <span className="text-foreground font-semibold">{location.pathname}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            className="w-full sm:w-auto gap-2 font-semibold"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>

          <Button
            asChild
            className="w-full sm:w-auto gap-2 font-semibold shadow-md shadow-primary/20"
          >
            <Link to="/">
              <Home className="h-4 w-4" />
              Return to Hub
            </Link>
          </Button>
        </div>

        {/* Brand Footer */}
        <div className="pt-6 border-t border-border/50 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <HeartPulse className="h-4 w-4 text-primary" />
          <span>Family Health Hub · Secure Caregiving Portal</span>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
