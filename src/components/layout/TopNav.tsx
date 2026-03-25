import { SidebarTrigger } from "@/components/ui/sidebar";
import { EmergencyButton } from "@/components/layout/EmergencyButton";
import { AvatarWithFallback } from "@/components/shared/AvatarWithFallback";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopNav() {
  return (
    <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-card">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="text-muted-foreground" />
      </div>
      <div className="flex items-center gap-3">
        <EmergencyButton />
        <Button variant="ghost" size="icon" className="relative text-muted-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emergency" />
        </Button>
        <AvatarWithFallback name="User" size="sm" />
      </div>
    </header>
  );
}
