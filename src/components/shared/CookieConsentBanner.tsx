import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Cookie, ShieldCheck, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const CONSENT_STORAGE_KEY = "fhh_cookie_consent_choice";

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  // ONLY allow the banner on outside / public routes (Login, Join, Invites, Privacy, Terms)
  // NEVER render inside the authenticated care hub
  const isOutsideRoute =
    location.pathname === "/login" ||
    location.pathname === "/join" ||
    location.pathname.startsWith("/invite/") ||
    location.pathname === "/privacy" ||
    location.pathname === "/terms";

  useEffect(() => {
    if (!isOutsideRoute) return;

    // Check if the user has already recorded a choice
    const consent = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!consent) {
      // Show smoothly shortly after landing on the page
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isOutsideRoute]);

  if (!isOutsideRoute) {
    return null;
  }

  const handleChoice = (choice: "all" | "essential") => {
    localStorage.setItem(CONSENT_STORAGE_KEY, choice);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          aria-label="Cookie & Health Data Storage Consent"
          className="fixed bottom-0 left-0 right-0 w-full z-50 border-t border-white/15 bg-slate-950/95 backdrop-blur-2xl text-white shadow-[0_-12px_40px_rgba(0,0,0,0.65)] pb-[env(safe-area-inset-bottom)]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
            {/* Left Content Area */}
            <div className="flex items-start gap-3.5 sm:gap-4 max-w-4xl">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0 shadow-inner">
                <Cookie className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold tracking-tight text-white">
                    We Value Your Family's Health Privacy
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Zero Ad Trackers</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  FamilyHealth Hub uses essential local storage and encrypted cookies to keep you signed in, preserve offline medication schedules, and remember your care preferences. We never sell your medical records or broker data to third parties.
                </p>
                <div className="pt-0.5">
                  <Link
                    to="/privacy"
                    className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 underline-offset-4 hover:underline transition-colors font-medium"
                  >
                    <span>Read our Health Privacy Policy</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2.5 w-full lg:w-auto shrink-0 justify-end pt-1 lg:pt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleChoice("essential")}
                className="flex-1 lg:flex-none h-10 px-4 text-xs font-semibold rounded-xl bg-white/5 hover:bg-white/10 text-white border-white/20 hover:border-white/30 transition-all"
              >
                Essential Only
              </Button>
              <Button
                size="sm"
                onClick={() => handleChoice("all")}
                className="flex-1 lg:flex-none h-10 px-6 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 transition-all"
              >
                Accept All Cookies
              </Button>
              <button
                onClick={() => handleChoice("essential")}
                aria-label="Dismiss cookie notice"
                className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 ml-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
