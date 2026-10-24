import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/analytics";

interface RouteMeta {
  title: string;
  description: string;
}

const ROUTE_META_MAP: Record<string, RouteMeta> = {
  "/": {
    title: "FamilyHealth Hub — Real-Time Family Care & Medication Tracking",
    description: "Monitor daily medications, log vitals, track doctor visits, and review AI health insights in one synchronized family care dashboard.",
  },
  "/medicines": {
    title: "Medications & Prescriptions | FamilyHealth Hub",
    description: "Track family medications, scheduled doses, adherence streaks, and automated refill reminders in real time.",
  },
  "/members": {
    title: "Family Members & Profiles | FamilyHealth Hub",
    description: "Manage loved ones' health profiles, emergency contacts, blood groups, and chronic conditions securely.",
  },
  "/checkups": {
    title: "Doctor Appointments & Checkups | FamilyHealth Hub",
    description: "Schedule, log, and never miss upcoming medical appointments, specialist visits, and routine health screenings.",
  },
  "/reports": {
    title: "Medical Reports & AI Diagnostics | FamilyHealth Hub",
    description: "Upload diagnostic lab reports and let Gemini AI explain bloodwork, prescriptions, and key clinical markers in plain language.",
  },
  "/analytics": {
    title: "Health Analytics & Adherence Trends | FamilyHealth Hub",
    description: "Analyze family medication compliance rates, weekly adherence trends, and longitudinal health metrics.",
  },
  "/settings": {
    title: "Account & Family Settings | FamilyHealth Hub",
    description: "Manage your personal profile, family care circle, notification preferences, and privacy controls.",
  },
  "/login": {
    title: "Sign In & Security | FamilyHealth Hub",
    description: "Access your synchronized family health hub securely with end-to-end data privacy.",
  },
  "/join": {
    title: "Join Family Care Circle | FamilyHealth Hub",
    description: "Enter your family invite code or link to collaborate with family caregivers and track loved ones' health.",
  },
  "/welcome": {
    title: "Welcome to Your Care Hub | FamilyHealth Hub",
    description: "Your family care circle is active. Quick start guide for medications, vitals, and emergency coordination.",
  },
  "/shader-demo": {
    title: "Visual Interactive Demo | FamilyHealth Hub",
    description: "Explore interactive fluid shader visualisations and health hub interface components.",
  },
  "/privacy": {
    title: "Privacy Policy | FamilyHealth Hub",
    description: "Learn how FamilyHealth Hub safeguards personal medical data, encryption protocols, and user privacy rights.",
  },
  "/terms": {
    title: "Terms of Service | FamilyHealth Hub",
    description: "Terms and conditions for using the FamilyHealth Hub care coordination and medication management platform.",
  },
};

export function setDocumentMeta(title: string, description: string) {
  // Update Document Title
  document.title = title;

  // Update Meta Description
  let descMeta = document.querySelector('meta[name="description"]');
  if (!descMeta) {
    descMeta = document.createElement("meta");
    descMeta.setAttribute("name", "description");
    document.head.appendChild(descMeta);
  }
  descMeta.setAttribute("content", description);

  // Update OpenGraph Title & Description
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", title);

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute("content", description);

  // Update Twitter Title & Description
  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitle) twitterTitle.setAttribute("content", title);

  const twitterDesc = document.querySelector('meta[name="twitter:description"]');
  if (twitterDesc) twitterDesc.setAttribute("content", description);
}

/**
 * Route-aware meta tag synchronizer
 */
export function PageMetaUpdater() {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;

    let meta: RouteMeta;

    if (ROUTE_META_MAP[pathname]) {
      meta = ROUTE_META_MAP[pathname];
    } else if (pathname.startsWith("/invite/")) {
      meta = {
        title: "Family Care Invitation | FamilyHealth Hub",
        description: "You've been invited to join a family care circle on FamilyHealth Hub. Accept your invitation to collaborate on care.",
      };
    } else {
      meta = {
        title: "404 - Page Not Found | FamilyHealth Hub",
        description: "The requested medical record or page could not be located in your health hub.",
      };
    }

    setDocumentMeta(meta.title, meta.description);
    trackPageView(pathname, meta.title);
  }, [location.pathname]);

  return null;
}

/**
 * Hook for pages needing dynamic title/descriptions (e.g., custom member profile names)
 */
export function usePageMeta(title?: string, description?: string) {
  useEffect(() => {
    if (title || description) {
      setDocumentMeta(
        title || document.title,
        description || "Your family's health, synced in real-time."
      );
    }
  }, [title, description]);
}
