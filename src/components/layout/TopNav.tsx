import { SidebarTrigger } from "@/components/ui/sidebar";
import { EmergencyButton } from "@/components/layout/EmergencyButton";
import { AvatarWithFallback } from "@/components/shared/AvatarWithFallback";
import { Bell, CheckCircle2, AlertCircle, Clock, Info, UserPlus, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useNotifications, useMarkNotificationRead, useClearNotifications } from "@/hooks/use-health-data";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export function TopNav() {
  const { data: notifications } = useNotifications();
  const markRead = useMarkNotificationRead();
  const clearNotifications = useClearNotifications();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;
  const hasUnread = unreadCount > 0;

  const handleClearAll = async () => {
    try {
      await clearNotifications.mutateAsync();
      toast.success("All notifications cleared");
    } catch (error) {
      toast.error("Failed to clear notifications");
    }
  };

  const handleGoToLogin = async () => {
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login");
    }
  };

  return (
    <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-card">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="text-muted-foreground" />
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 font-bold transition-all duration-200"
          onClick={handleGoToLogin}
        >
          <LogIn className="h-4 w-4" />
          <span className="hidden sm:inline">Go to Login</span>
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <EmergencyButton />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground">
              <Bell className="h-5 w-5" />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emergency text-[10px] font-bold text-white border-2 border-card">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-3 flex items-center justify-between">
              <span className="font-bold text-sm uppercase tracking-tight">Activity Hub</span>
              {hasUnread && (
                <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-tighter">
                  {unreadCount} New
                </span>
              )}
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-[400px] overflow-auto">
              {!notifications || notifications.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <Bell className="h-8 w-8 text-muted-foreground/20 mx-auto" />
                  <p className="text-xs text-muted-foreground italic">
                    No recent activity to show.
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <DropdownMenuItem 
                    key={n.id} 
                    className={`flex items-start gap-3 p-3 cursor-pointer transition-colors ${!n.is_read ? 'bg-primary/[0.03]' : 'opacity-60'}`}
                    onClick={() => !n.is_read && markRead.mutate(n.id)}
                  >
                    <div className={`mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                      n.type === 'alert' ? 'bg-destructive/10 text-destructive' : 
                      n.type === 'info' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'
                    }`}>
                      {n.title.includes('Member') ? <UserPlus className="h-4 w-4" /> : 
                       n.type === 'alert' ? <AlertCircle className="h-4 w-4" /> :
                       n.type === 'info' ? <Info className="h-4 w-4" /> :
                       <CheckCircle2 className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-black uppercase tracking-tight leading-none">
                          {n.title}
                        </span>
                        <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-snug">
                        {n.message}
                      </p>
                    </div>
                    {!n.is_read && (
                      <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    )}
                  </DropdownMenuItem>
                ))
              )}
            </div>
            <DropdownMenuSeparator />
            <Button 
              variant="ghost" 
              className="w-full text-[10px] uppercase font-bold tracking-widest h-10 hover:bg-muted/50"
              onClick={handleClearAll}
              disabled={!notifications || notifications.length === 0 || clearNotifications.isPending}
            >
              {clearNotifications.isPending ? "Clearing..." : "Clear All Notifications"}
            </Button>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none">
              <AvatarWithFallback 
                name={user?.email || "User"} 
                size="sm" 
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={() => signOut()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
