import { AlertTriangle, FileText, ArrowLeft, Heart, CheckCircle2, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ToggleTheme } from "@/components/ui/toggle-theme";
import { usePageMeta } from "@/components/shared/PageMeta";

export default function TermsOfService() {
  usePageMeta(
    "Terms of Service & Medical Disclaimer | FamilyHealth Hub",
    "Terms and conditions for using the FamilyHealth Hub care coordination and medication management platform."
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Top Header */}
      <header className="border-b border-border/80 sticky top-0 z-30 bg-background/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105">
              <Heart className="h-5 w-5 fill-current" />
            </div>
            <span className="font-bold text-base tracking-tight">FamilyHealth Hub</span>
          </Link>
          <div className="flex items-center gap-3">
            <ToggleTheme />
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                <span>Return to Hub</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="border-b border-border/60 bg-muted/30 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Platform Agreement & Disclaimers</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            Terms of Service
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed">
            Please read these terms carefully before utilizing FamilyHealth Hub to coordinate family prescriptions, doctor checkups, or health metrics.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2">
            <span>Last Updated: October 2026</span>
            <span>•</span>
            <span>Effective Version: 2.4</span>
            <span>•</span>
            <span className="text-primary font-medium">Caregiving Organizational Platform</span>
          </div>
        </div>
      </section>

      {/* Main Legal Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12 leading-relaxed flex-1">
        {/* Critical Medical Disclaimer Banner */}
        <div className="p-6 rounded-2xl bg-destructive/5 border-2 border-destructive/20 space-y-3">
          <div className="flex items-center gap-2.5 text-destructive font-black text-base uppercase tracking-tight">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>IMPORTANT MEDICAL DISCLAIMER</span>
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed font-medium">
            FamilyHealth Hub is an organizational digital logbook and care communication tool designed solely to assist families with scheduling and record-keeping. <strong>FamilyHealth Hub DOES NOT provide medical advice, diagnosis, treatment, or professional clinical opinions.</strong>
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Always consult your physician, pharmacist, or certified healthcare provider regarding medication dosages, interactions, allergic symptoms, or clinical lab results. Never disregard or delay seeking professional medical advice because of information displayed in this application.
          </p>
        </div>

        {/* Critical Emergency Service Disclaimer */}
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-700 dark:text-amber-400 font-bold text-sm uppercase tracking-tight">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>EMERGENCY ALERT LIMITATION (NOT 911 / 112)</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The in-app "Emergency Alert" function transmits an instant notification with your current location exclusively to the private dashboard and email addresses of members in your registered Family Circle. <strong>It DOES NOT alert government emergency personnel, police, fire, or ambulance dispatch services.</strong> If you or a loved one is experiencing a medical crisis, call your local emergency telephone number (e.g., 911 in the USA, 112 in Europe/India) immediately.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span className="text-primary">1.</span> Acceptance of Terms
          </h2>
          <p className="text-sm text-muted-foreground">
            By accessing or using FamilyHealth Hub (the "Service"), you agree to be bound by these Terms of Service. If you disagree with any portion of these terms, you must discontinue use of the Service immediately.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span className="text-primary">2.</span> Account Registration & Care Circle Roles
          </h2>
          <p className="text-sm text-muted-foreground">
            You must provide accurate and complete information when registering an account:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
            <li><strong className="text-foreground">Head of Family:</strong> The creator of a family care circle possesses administrative authority to manage members, generate invite codes, and revoke access.</li>
            <li><strong className="text-foreground">Caregiver Members:</strong> Members joining through an invite link agree to coordinate in good faith and respect the medical privacy of all individuals represented in the circle.</li>
            <li><strong className="text-foreground">Credential Security:</strong> You are responsible for safeguarding your login password and invite codes. Notify us immediately if you suspect unauthorized access.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span className="text-primary">3.</span> Accuracy of Medication & Dosing Data
          </h2>
          <p className="text-sm text-muted-foreground">
            You acknowledge and agree that you are solely responsible for ensuring the accuracy of all data entered into the system, including medication names, milligram dosages, scheduled dosing intervals, and allergy profiles. FamilyHealth Hub cannot be held responsible for adverse medical outcomes resulting from inaccurate data entry or missed medication notifications caused by device settings, network interruptions, or low battery states.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span className="text-primary">4.</span> Artificial Intelligence Features
          </h2>
          <p className="text-sm text-muted-foreground">
            Our automated lab report scanner and pill identification tools utilize Google Gemini AI models to assist with transcription and preliminary readability:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
            <li>AI outputs are computational estimates that may occasionally misinterpret blurry text, handwritten doctor notes, or non-standard laboratory reference ranges.</li>
            <li>All AI-generated summaries must be verified against original medical documents and confirmed by a certified physician before taking any health action.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span className="text-primary">5.</span> Limitation of Liability
          </h2>
          <p className="text-sm text-muted-foreground">
            To the maximum extent permitted by applicable law, FamilyHealth Hub and its developers, affiliates, and licensors shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of health data, bodily harm, or adverse drug events arising out of your access to or inability to use the Service.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span className="text-primary">6.</span> Governing Law & Inquiries
          </h2>
          <p className="text-sm text-muted-foreground">
            These Terms shall be governed by and construed in accordance with the applicable laws of the jurisdiction in which the service operates. For inquiries regarding these terms:
          </p>
          <div className="p-4 rounded-xl border border-border bg-card space-y-1 text-sm">
            <p className="font-bold text-foreground">FamilyHealth Hub Legal Department</p>
            <p className="text-muted-foreground">Email: legal@familyhealthhub.app</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-card text-center text-xs text-muted-foreground">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 FamilyHealth Hub. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="text-primary font-semibold">
              Terms of Service
            </Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors underline-offset-4 hover:underline">
              Privacy Policy
            </Link>
            <Link to="/login" className="hover:text-foreground transition-colors underline-offset-4 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
