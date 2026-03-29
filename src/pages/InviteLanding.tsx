import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useMemberByToken, useJoinFamilyByToken } from "@/hooks/use-health-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const InviteLanding = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: member, isLoading: memberLoading, error: memberError } = useMemberByToken(token || "");
  const joinFamily = useJoinFamilyByToken();
  const hasAttemptedJoin = useRef(false);

  useEffect(() => {
    // Wait for auth to load before making any redirect decisions
    if (authLoading) return;

    // 1. If not authenticated, store token and go to login
    if (!user && token) {
      localStorage.setItem("pending_invite_token", token);
      console.log("User not authenticated, stored token and redirecting to login");
      navigate("/login");
      return;
    }

    // 2. Handle member already connected
    if (member && member.status === 'connected') {
      console.log("Member already connected, redirecting to dashboard");
      navigate("/", { replace: true });
      return;
    }

    // 3. Auto-join if user is authenticated and member exists
    if (user && member && member.status === 'invited' && !memberLoading && !joinFamily.isPending && !hasAttemptedJoin.current) {
      const performAutoJoin = async () => {
        try {
          hasAttemptedJoin.current = true;
          console.log("Auto-joining family with token:", token);
          await joinFamily.mutateAsync(token || "");
          toast.success("Successfully joined the family!");
          navigate("/", { replace: true });
        } catch (error: any) {
          console.error("Auto-join failed:", error);
          toast.error(error.message || "Failed to join family automatically");
          hasAttemptedJoin.current = false; // Reset on failure so they can retry
        }
      };
      performAutoJoin();
    }
  }, [user, member, memberLoading, authLoading, token, navigate, joinFamily]);

  const handleJoin = async () => {
    if (!user) {
      // Store the invite token in local storage to join after login
      localStorage.setItem("pending_invite_token", token || "");
      navigate("/login");
      return;
    }

    try {
      await joinFamily.mutateAsync(token || "");
      toast.success("Successfully joined the family!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to join family");
    }
  };

  if (authLoading || memberLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (memberError || !member) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle>Invalid Invite</CardTitle>
            <CardDescription>
              This invitation link is invalid or has expired. Please ask the family head for a new link.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => navigate("/")} variant="outline">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Cast member to any to access the joined family_info
  const memberData = member as any;
  const familyName = memberData.family_info?.name || "their family";

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="max-w-md w-full shadow-lg border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary">
                {member.name[0].toUpperCase()}
              </span>
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome, {member.name}!</CardTitle>
          <CardDescription className="text-base mt-2">
            You've been invited to join the <span className="font-semibold text-foreground">{familyName}</span> on Family Health Hub.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-primary/5 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <p className="text-sm text-muted-foreground">Monitor your health metrics together</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <p className="text-sm text-muted-foreground">Get medication reminders</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <p className="text-sm text-muted-foreground">Coordinate checkups and reports</p>
            </div>
          </div>

          <Button 
            className="w-full h-12 text-lg" 
            onClick={handleJoin}
            disabled={joinFamily.isPending}
          >
            {joinFamily.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Joining...
              </>
            ) : user ? (
              "Join Family Now"
            ) : (
              "Sign in to Join"
            )}
          </Button>
          
          <p className="text-center text-xs text-muted-foreground">
            By joining, you'll be able to share and view health data with your family members.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteLanding;
