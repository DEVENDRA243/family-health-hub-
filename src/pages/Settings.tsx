import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, RefreshCw, Trash2 } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="page-title">Family Settings</h1>

      <div className="card-medical space-y-4">
        <h2 className="section-heading">Family Details</h2>
        <div className="space-y-3">
          <div>
            <Label htmlFor="familyName" className="caption">Family Name</Label>
            <Input id="familyName" defaultValue="Johnson Family" className="mt-1" />
          </div>
        </div>
      </div>

      <div className="card-medical space-y-4">
        <h2 className="section-heading">Invite Code</h2>
        <p className="text-sm text-muted-foreground">
          Share this code with family members so they can join your family.
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-lg border border-border bg-muted/50 px-4 py-3 font-mono text-lg font-bold tracking-widest text-center">
            ABC123
          </div>
          <Button variant="outline" size="icon" title="Copy code">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" title="Generate new code">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="card-medical space-y-4">
        <h2 className="section-heading text-destructive">Danger Zone</h2>
        <p className="text-sm text-muted-foreground">
          These actions are irreversible. Please proceed with caution.
        </p>
        <Button variant="destructive" size="sm" className="gap-1.5">
          <Trash2 className="h-4 w-4" />
          Delete Family
        </Button>
      </div>
    </div>
  );
}
