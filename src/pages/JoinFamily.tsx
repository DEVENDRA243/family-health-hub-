import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Users, ArrowRight, Loader2, LogIn, Sparkles } from "lucide-react";
import { useCreateFamily, useFamilyInfo, useJoinFamilyByCode } from "@/hooks/use-health-data";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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
      <div className="min-h-screen flex items-center justify-center bg-maxbg pattern-checker">
        <Loader2 className="h-16 w-16 animate-spin text-accent1" />
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
    <div className="relative min-h-screen bg-maxbg text-maxfg overflow-x-hidden font-dm selection:bg-accent1 selection:text-white">
      {/* Top Left Sign Out / Back Button */}
      <div className="fixed top-6 left-6 z-50">
        <Button
          onClick={user ? handleGoToLogin : () => navigate("/login")}
          className="h-auto py-3 gap-2 bg-maxbg border-4 border-accent1 text-accent1 hover:bg-accent1 hover:text-white transition-all duration-300 shadow-[4px_4px_0_#FFE600] hover:shadow-[0_0_0_#FFE600] hover:translate-x-1 hover:translate-y-1 font-outfit font-black tracking-widest uppercase rounded-full px-6"
        >
          <LogIn className="h-5 w-5" />
          <span className="hidden sm:inline">{user ? "Sign Out" : "Back to Login"}</span>
        </Button>
      </div>

      <section className="relative min-h-screen flex items-center justify-center p-6 md:p-12 z-10 py-24">
        {/* Global Patterns */}
        <div className="absolute inset-0 pointer-events-none z-0 mix-blend-screen opacity-30 pattern-mesh"></div>
        <div className="absolute inset-0 pointer-events-none z-0 opacity-10 pattern-checker"></div>

        {/* Massive Background Typography */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none z-0">
          <h1 className="text-[10rem] md:text-[22rem] font-bangers opacity-10 text-accent4 whitespace-nowrap rotate-6 animate-pulse-gentle">
            CONNECT!
          </h1>
        </div>

        {/* Floating Decor */}
        <div className="absolute top-[15%] right-[10%] animate-float z-20 hidden md:block">
          <div className="bg-accent3/20 border-4 border-accent3 p-4 rounded-full">
            <Users className="h-12 w-12 text-accent3 animate-spin-slow" strokeWidth={3} />
          </div>
        </div>
        
        <div className="absolute bottom-[10%] left-[8%] animate-float-reverse z-20 text-7xl hover:animate-wiggle cursor-crosshair">
          🚀
        </div>

        {/* Main Create/Join Container (Card) */}
        <div className="relative z-30 w-full max-w-xl group">
          <div className="absolute inset-0 bg-accent4 border-4 border-accent2 rounded-[2rem] -rotate-2 shadow-[16px_16px_0_#7B2FFF,32px_32px_0_#FF3AF2] transition-all duration-300 group-hover:-rotate-4 group-hover:shadow-[24px_24px_0_#7B2FFF,48px_48px_0_#FF3AF2]"></div>
          
          <div className="relative bg-maxbg border-4 border-accent1 rounded-[2rem] p-8 md:p-12 shadow-glow-lg rotate-1 hover:rotate-0 transition-transform duration-300 backdrop-blur-md">
            <div className="flex flex-col items-center gap-6 relative z-10 w-full">
              <div className="flex flex-col items-center gap-2 w-full text-center mt-4">
                <h2 className="text-4xl md:text-5xl font-outfit font-black tracking-tight uppercase text-white [text-shadow:2px_2px_0_#FF6B35,4px_4px_0_#FFE600,6px_6px_0_#00F5D4] mb-2">
                  Family <span className="ml-3 md:ml-5">Hub</span>
                </h2>
              </div>
              
              <div className="flex w-full p-2 bg-maxmuted border-4 border-accent3 rounded-2xl gap-2 relative z-10 shadow-[4px_4px_0_#FF3AF2]">
                <button
                  onClick={() => setIsJoining(false)}
                  className={`flex-1 py-3 text-sm md:text-lg font-outfit font-black uppercase tracking-[0.1em] rounded-xl transition-all ${!isJoining ? 'bg-accent1 text-white shadow-[0_0_15px_rgba(255,58,242,0.5)] scale-[1.02]' : 'bg-transparent text-white/50 hover:bg-white/10'}`}
                >
                  Create New
                </button>
                <button
                  onClick={() => setIsJoining(true)}
                  className={`flex-1 py-3 text-sm md:text-lg font-outfit font-black uppercase tracking-[0.1em] rounded-xl transition-all ${isJoining ? 'bg-accent5 text-white shadow-[0_0_15px_rgba(123,47,255,0.5)] scale-[1.02]' : 'bg-transparent text-white/50 hover:bg-white/10'}`}
                >
                  Join Existing
                </button>
              </div>

              <div className="w-full mt-2">
                {isJoining ? (
                  <form onSubmit={handleJoinFamily} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="code" className="font-outfit font-black uppercase tracking-widest text-accent2 text-lg">Enter Invite Code</Label>
                      <Input
                        id="code"
                        placeholder="e.g. ABC123"
                        className="h-16 text-2xl font-black font-dm text-center tracking-[0.2em] uppercase bg-maxbg border-4 border-dashed border-accent2 text-white placeholder:text-white/20 focus:border-solid focus:border-accent5 focus:ring-accent5 rounded-2xl"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-auto py-5 text-lg md:text-xl font-outfit font-black uppercase tracking-widest bg-gradient-to-r from-accent5 to-accent1 border-4 border-white rounded-full text-white shadow-[0_0_20px_rgba(123,47,255,0.8)] hover:scale-[1.02] active:scale-95 transition-all outline-none animate-gradient-shift bg-[length:200%_auto] whitespace-normal" 
                      disabled={joinFamily.isPending}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3 [text-shadow:2px_2px_0_#0D0D1A]">
                        {!user ? "Next: Sign In to Join" : joinFamily.isPending ? <Loader2 className="animate-spin w-6 h-6" /> : "Connect"} 
                        {user && !joinFamily.isPending && <ArrowRight className="h-6 w-6 shrink-0" />}
                      </span>
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleCreateFamily} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="font-outfit font-black uppercase tracking-widest text-accent4 text-lg">Family Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g. The Johnsons"
                        className="h-16 text-xl font-black font-dm px-6 bg-maxbg border-4 border-dashed border-accent4 text-white placeholder:text-white/20 focus:border-solid focus:border-accent1 focus:ring-accent1 rounded-2xl"
                        value={familyName}
                        onChange={(e) => setFamilyName(e.target.value)}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-auto py-5 text-lg md:text-xl font-outfit font-black uppercase tracking-widest bg-gradient-to-r from-accent4 to-accent1 border-4 border-white rounded-full text-white shadow-[0_0_20px_rgba(255,107,53,0.8)] hover:scale-[1.02] active:scale-95 transition-all outline-none animate-gradient-shift bg-[length:200%_auto] whitespace-normal" 
                      disabled={createFamily.isPending}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3 [text-shadow:2px_2px_0_#0D0D1A]">
                        {!user ? "Next: Sign In to Create" : createFamily.isPending ? <Loader2 className="animate-spin w-6 h-6" /> : "Start My Hub"} 
                        {user && !createFamily.isPending && <Sparkles className="h-6 w-6 shrink-0" />}
                      </span>
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
