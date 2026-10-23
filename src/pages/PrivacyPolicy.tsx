import { Shield, Lock, FileText, ArrowLeft, Heart, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ToggleTheme } from "@/components/ui/toggle-theme";
import { usePageMeta } from "@/components/shared/PageMeta";

export default function PrivacyPolicy() {
  usePageMeta(
    "Privacy Policy & Health Data Protection | FamilyHealth Hub",
    "Learn how FamilyHealth Hub safeguards personal medical data, encryption protocols, and user privacy rights."
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
            <Shield className="h-3.5 w-3.5" />
            <span>Health Privacy & Data Security</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed">
            Your family's health data is strictly private. We believe personal medical information belongs solely to you and the loved ones you choose to share it with.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2">
            <span>Last Updated: October 2026</span>
            <span>•</span>
            <span>Effective Version: 2.4</span>
            <span>•</span>
            <span className="text-primary font-medium">Zero Advertising Tracking</span>
          </div>
        </div>
      </section>

      {/* Main Legal Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12 leading-relaxed flex-1">
        {/* Core Guarantees Callout */}
        <div className="grid sm:grid-cols-3 gap-4 p-6 rounded-2xl bg-card border border-border shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Lock className="h-4 w-4" />
              <span>End-to-End Control</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Only authorized members in your care circle can view schedules and vitals.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="h-4 w-4" />
              <span>No Ad Selling</span>
            </div>
            <p className="text-xs text-muted-foreground">
              We never sell or broker medical records or member information to third-party advertisers.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
              <Shield className="h-4 w-4" />
              <span>Zero Model Training</span>
            </div>
            <p className="text-xs text-muted-foreground">
              AI medical report scans are processed ephemerally and never retained to train public AI models.
            </p>
          </div>
        </div>

        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span className="text-primary">1.</span> Information We Collect
          </h2>
          <p className="text-sm text-muted-foreground">
            To provide family care coordination, we collect only the information you voluntarily supply:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
            <li><strong className="text-foreground">Account Information:</strong> Your name, email address, password hash, and authentication credentials.</li>
            <li><strong className="text-foreground">Family Care Circle Data:</strong> Family name, member profiles (names, relations, ages, blood groups, known allergies).</li>
            <li><strong className="text-foreground">Medication & Schedule Records:</strong> Medicine names, dosages, frequencies, scheduled times, and logged adherence records (taken/missed timestamps).</li>
            <li><strong className="text-foreground">Doctor Appointments & Checkups:</strong> Clinician names, scheduled checkup dates, notes, and completion statuses.</li>
            <li><strong className="text-foreground">Diagnostic Lab Reports:</strong> PDF or image files uploaded for AI-assisted lab metric interpretation.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span className="text-primary">2.</span> How We Use Your Information
          </h2>
          <p className="text-sm text-muted-foreground">
            We use your data solely to deliver the health management features you request:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
            <li>Generating synchronized daily dose schedules and sending push or in-app refill/time alerts.</li>
            <li>Displaying adherence streaks and family health metrics on your shared dashboard.</li>
            <li>Allowing the designated Head of Family to invite and coordinate caregivers.</li>
            <li>Transmitting urgent emergency alerts with current GPS coordinates upon manual activation.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span className="text-primary">3.</span> AI Analysis & Document Privacy
          </h2>
          <p className="text-sm text-muted-foreground">
            When you upload a medical report or prescription image for AI summarization:
          </p>
          <div className="p-4 rounded-xl bg-muted/40 border border-border text-sm space-y-2">
            <p className="text-muted-foreground">
              Document contents are transmitted securely over TLS encryption to the Gemini Enterprise API for instant OCR and clinical metric breakdown.
            </p>
            <p className="text-muted-foreground">
              Under enterprise data confidentiality agreements, <strong>your medical files and diagnostic outputs are NOT used to train, refine, or improve Google Generative AI models</strong>. The documents remain strictly isolated within your authenticated workspace.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span className="text-primary">4.</span> Access Control & Family Permissions
          </h2>
          <p className="text-sm text-muted-foreground">
            Family health records are siloed using cryptographic Row-Level Security (RLS) within our PostgreSQL database:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
            <li>Only users who have entered your family's unique join code or accepted an invite link can view records associated with your family ID.</li>
            <li>The Head of Family retains full administrative authority to remove caregivers or revoke access at any time.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span className="text-primary">5.</span> Data Storage, Retention & Deletion Rights
          </h2>
          <p className="text-sm text-muted-foreground">
            You retain absolute ownership over your health data:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
            <li><strong className="text-foreground">Right of Rectification:</strong> You can edit or correct any medicine, checkup, or member profile at any moment.</li>
            <li><strong className="text-foreground">Right to Erasure (Forget Me):</strong> Deleting a family member or medication immediately cascades and permanently purges all associated doses, logs, and uploaded files from our live database.</li>
            <li><strong className="text-foreground">Account Termination:</strong> You may request complete account erasure by contacting our privacy team.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span className="text-primary">6.</span> Contact Our Privacy Officer
          </h2>
          <p className="text-sm text-muted-foreground">
            For questions regarding this privacy policy or to submit a data subject rights request, please contact:
          </p>
          <div className="p-4 rounded-xl border border-border bg-card space-y-1 text-sm">
            <p className="font-bold text-foreground">FamilyHealth Hub Data Privacy Officer</p>
            <p className="text-muted-foreground">Email: privacy@familyhealthhub.app</p>
            <p className="text-muted-foreground">Response Window: Within 48 business hours</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-card text-center text-xs text-muted-foreground">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 FamilyHealth Hub. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-foreground transition-colors underline-offset-4 hover:underline">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-primary font-semibold">
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
