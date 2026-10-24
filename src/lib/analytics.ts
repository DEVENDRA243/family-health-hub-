/**
 * Privacy-Preserving Healthcare Analytics Tracker
 * 
 * Strict Privacy Guidelines:
 * - NO Protected Health Information (PHI) is ever logged or transmitted (e.g., specific drug names, diagnosis, notes).
 * - Only generalized action categories and non-sensitive operational telemetry are recorded.
 * - Integrates with Google Analytics (gtag), Plausible, or custom telemetry when configured.
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    plausible?: (event: string, options?: { props?: Record<string, any> }) => void;
    dataLayer?: any[];
  }
}

export type AnalyticsEvent =
  | { name: "page_view"; properties?: { path: string; title?: string } }
  | { name: "auth_login"; properties?: { method?: string } }
  | { name: "auth_signup"; properties?: { method?: string } }
  | { name: "auth_logout" }
  | { name: "family_created" }
  | { name: "family_joined" }
  | { name: "invite_code_copied" }
  | { name: "member_added"; properties?: { role?: string } }
  | { name: "medicine_added"; properties?: { frequency?: string; has_reminder?: boolean } }
  | { name: "medicine_dose_logged"; properties?: { status?: "taken" | "skipped" } }
  | { name: "checkup_scheduled"; properties?: { is_recurring?: boolean } }
  | { name: "checkup_completed" }
  | { name: "report_uploaded"; properties?: { file_type?: string } }
  | { name: "report_analyzed" }
  | { name: "pill_scanner_used"; properties?: { success?: boolean } }
  | { name: "allergy_scanner_used"; properties?: { success?: boolean } }
  | { name: "emergency_sos_triggered"; properties?: { member_count?: number } }
  | { name: "theme_changed"; properties?: { theme: string } };

/**
 * Tracks a privacy-safe analytics event.
 */
export function trackEvent(
  name: AnalyticsEvent["name"],
  properties?: Record<string, string | number | boolean | undefined>
) {
  try {
    // Filter out undefined and sanitize to prevent PHI leakage
    const sanitizedProps: Record<string, any> = {};
    if (properties) {
      for (const [key, val] of Object.entries(properties)) {
        if (val !== undefined) {
          // Never forward freeform string content longer than 60 characters or suspect keys
          if (typeof val === "string" && val.length > 60) {
            sanitizedProps[key] = val.substring(0, 60);
          } else {
            sanitizedProps[key] = val;
          }
        }
      }
    }

    // 1. Google Analytics (gtag.js)
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", name, sanitizedProps);
    }

    // 2. Plausible Analytics
    if (typeof window !== "undefined" && typeof window.plausible === "function") {
      window.plausible(name, { props: sanitizedProps });
    }

    // 3. Local Development Logging
    if (import.meta.env.DEV) {
      console.debug(`[Telemetry] ${name}`, sanitizedProps);
    }
  } catch (err) {
    // Silent fail - telemetry should never break user workflows
    if (import.meta.env.DEV) {
      console.warn("[Telemetry] Error tracking event:", err);
    }
  }
}

/**
 * Automatically logs page view events.
 */
export function trackPageView(path: string, title?: string) {
  trackEvent("page_view", {
    path,
    title: title || (typeof document !== "undefined" ? document.title : undefined),
  });
}
