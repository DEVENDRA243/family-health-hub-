import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { Heart } from "lucide-react";

import { ThemeProvider } from "@/components/theme-provider";
import { PageMetaUpdater } from "@/components/shared/PageMeta";
import { CookieConsentBanner } from "@/components/shared/CookieConsentBanner";

// Lazy-loaded routes for optimal initial bundle size and near-instant FCP
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Members = lazy(() => import("./pages/Members"));
const Medicines = lazy(() => import("./pages/Medicines"));
const Checkups = lazy(() => import("./pages/Checkups"));
const Reports = lazy(() => import("./pages/Reports"));
const Analytics = lazy(() => import("./pages/Analytics"));
const SettingsPage = lazy(() => import("./pages/Settings"));
const Login = lazy(() => import("./pages/Login"));
const JoinFamily = lazy(() => import("./pages/JoinFamily"));
const InviteLanding = lazy(() => import("./pages/InviteLanding"));
const ShaderHeroDemo = lazy(() => import("./pages/ShaderHeroDemo"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Welcome = lazy(() => import("./pages/Welcome"));

function PageSuspenseFallback() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4 animate-in fade-in duration-300">
      <div className="relative flex items-center justify-center">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary animate-pulse">
          <Heart className="h-6 w-6 fill-primary/20" />
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
        <span>Loading Care Circle...</span>
      </div>
    </div>
  );
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PageMetaUpdater />
          <CookieConsentBanner />
          <Suspense fallback={<PageSuspenseFallback />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/shader-demo" element={<ShaderHeroDemo />} />
              <Route path="/join" element={<JoinFamily />} />
              <Route path="/invite/:token" element={<InviteLanding />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route element={<ProtectedLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/members" element={<Members />} />
                <Route path="/medicines" element={<Medicines />} />
                <Route path="/checkups" element={<Checkups />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
