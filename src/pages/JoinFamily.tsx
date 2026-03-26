import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Users, ArrowRight, Loader2, LogIn } from "lucide-react";
import { useCreateFamily, useFamilyInfo, useJoinFamilyByCode } from "@/hooks/use-health-data";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { DarkProjectHero } from "@/components/ui/progressive-hero";
import { TextRotate } from "@/components/ui/text-rotate";

export default function JoinFamily() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { data: familyInfo, isLoading: familyLoading } = useFamilyInfo();
  const [isJoining, setIsJoining] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [familyName, setFamilyName] = useState("");
  const createFamily = useCreateFamily();
  const joinFamily = useJoinFamilyByCode();
  const navigate = useNavigate();

  // Redirect if already has a family
  useEffect(() => {
    if (!familyLoading && familyInfo) {
      navigate("/");
    }
  }, [familyInfo, familyLoading, navigate]);

  if (authLoading || familyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-red-600" />
      </div>
    );
  }

  const handleGoToLogin = async () => {
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
      navigate("/login");
    }
  };

  const handleJoinFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    if (!user) {
      // If not logged in, save the code and redirect to login
      localStorage.setItem("pending_join_code", inviteCode.toUpperCase());
      toast.info("Please login to join the family");
      navigate("/login");
      return;
    }

    try {
      await joinFamily.mutateAsync(inviteCode);
      toast.success("Joined family successfully!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to join family. Check the code.");
    }
  };

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyName.trim()) return;

    if (!user) {
      toast.error("Please login to create a family");
      navigate("/login");
      return;
    }

    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
      await createFamily.mutateAsync({ name: familyName, invite_code: newCode });
      toast.success("Family created successfully!");
      navigate("/", { replace: true });
    } catch (err: any) {
      console.error("Family creation error details:", err);
      toast.error(`Failed to create family: ${err.message || 'Unknown error'}`);
    }
  };

  return (
    <DarkProjectHero>
      {/* Top Left Login Button (Only if logged in) */}
      {user && (
        <div className="fixed top-6 left-6 z-50">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 bg-black/20 backdrop-blur-md border border-red-900/30 text-red-400 hover:bg-red-900/40 hover:text-white transition-all duration-300 shadow-xl"
            onClick={handleGoToLogin}
          >
            <LogIn className="h-4 w-4" />
            <span className="font-bold tracking-tight uppercase text-xs">Sign Out</span>
          </Button>
        </div>
      )}

      {/* Top Left Login Button (If NOT logged in) */}
      {!user && (
        <div className="fixed top-6 left-6 z-50">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 bg-black/20 backdrop-blur-md border border-red-900/30 text-red-400 hover:bg-red-900/40 hover:text-white transition-all duration-300 shadow-xl"
            onClick={() => navigate("/login")}
          >
            <LogIn className="h-4 w-4" />
            <span className="font-bold tracking-tight uppercase text-xs">Back to Login</span>
          </Button>
        </div>
      )}

      <div className="max-w-md w-full space-y-8 relative z-20 p-4">
        <div className="text-center space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-700 mb-2 shadow-[0_0_20px_rgba(185,28,28,0.5)] mx-auto">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
            <TextRotate
              texts={["FamilyHealth Hub", "Start Journey", "Create Legacy", "Join Family"]}
              mainClassName="justify-center"
              staggerFrom="last"
              staggerDuration={0.02}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            />
          </h1>
          <p className="text-red-200 font-medium drop-shadow-[0_1px_5px_rgba(0,0,0,0.5)] h-6">
            <TextRotate
              texts={[
                "Keep your loved ones healthy.",
                "Sync medical data in real-time.",
                "Manage family health securely.",
                "Stay on top of every schedule."
              ]}
              mainClassName="justify-center text-sm sm:text-base"
              staggerDuration={0.01}
              rotationInterval={3000}
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
            />
          </p>
        </div>

        <div className="bg-black/40 backdrop-blur-md border-2 border-red-900/50 rounded-xl p-8 space-y-6 shadow-2xl mt-8">
          <div className="flex p-1 bg-red-950/30 rounded-lg border border-red-900/30">
            <button
              onClick={() => setIsJoining(false)}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${!isJoining ? 'bg-red-700 shadow-lg text-white' : 'text-red-300/60 hover:text-red-200'}`}
            >
              Create Family
            </button>
            <button
              onClick={() => setIsJoining(true)}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${isJoining ? 'bg-red-700 shadow-lg text-white' : 'text-red-300/60 hover:text-red-200'}`}
            >
              Join Family
            </button>
          </div>

          {isJoining ? (
            <form onSubmit={handleJoinFamily} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="font-bold uppercase text-[10px] tracking-widest text-red-200/80">Enter Family Invite Code</Label>
                <Input
                  id="code"
                  placeholder="e.g. ABC123"
                  className="font-mono text-lg text-center tracking-widest uppercase bg-black/40 border-red-900/50 text-white placeholder:text-red-900/50 focus:border-red-700 focus:ring-red-700"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full gap-2 font-black uppercase tracking-widest py-6 bg-red-700 hover:bg-red-800 text-white border-none shadow-[0_0_15px_rgba(185,28,28,0.3)]" 
                disabled={joinFamily.isPending}
              >
                {!user ? "Next: Sign In to Join" : joinFamily.isPending ? <Loader2 className="animate-spin" /> : "Connect to Family"} <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleCreateFamily} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-bold uppercase text-[10px] tracking-widest text-red-200/80">Family Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. The Johnsons"
                  className="font-bold bg-black/40 border-red-900/50 text-white placeholder:text-red-900/50 focus:border-red-700 focus:ring-red-700"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full gap-2 font-black uppercase tracking-widest py-6 bg-red-700 hover:bg-red-800 text-white border-none shadow-[0_0_15px_rgba(185,28,28,0.3)]" 
                disabled={createFamily.isPending}
              >
                {!user ? "Next: Sign In to Create" : createFamily.isPending ? <Loader2 className="animate-spin" /> : "Start My Family Hub"} <Users className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-[10px] text-red-300/60 uppercase font-bold tracking-tighter">
          Secure · Real-time · Dynamic
        </p>
      </div>
    </DarkProjectHero>
  );
}
