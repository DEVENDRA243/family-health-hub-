import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopNav } from "@/components/layout/TopNav";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useFamilyInfo } from "@/hooks/use-health-data";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { MobileStickyBar } from "@/components/layout/MobileStickyBar";

export function ProtectedLayout() {
  const { user, loading: authLoading } = useAuth();
  const { data: familyInfo, isLoading: familyLoading } = useFamilyInfo();
  const location = useLocation();

  if (authLoading || familyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user has a pending invite link from before login, route them to accept it
  const pendingInviteToken = localStorage.getItem("pending_invite_token");
  if (pendingInviteToken) {
    localStorage.removeItem("pending_invite_token");
    return <Navigate to={`/invite/${pendingInviteToken}`} replace />;
  }

  // If no family exists in the database, redirect to the Join/Create page
  if (!familyInfo) {
    return <Navigate to="/join" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 relative">
          <TopNav />
          <main className="flex-1 p-3 sm:p-5 md:p-6 pb-24 md:pb-6 overflow-auto">
            <Outlet />
          </main>
          <MobileStickyBar />
        </div>
      </div>
    </SidebarProvider>
  );
}
