import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopNav } from "@/components/layout/TopNav";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useFamilyInfo } from "@/hooks/use-health-data";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

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
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
