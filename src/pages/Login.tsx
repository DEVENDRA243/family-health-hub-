import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { DarkProjectHero } from "@/components/ui/progressive-hero";
import { TextRotate } from "@/components/ui/text-rotate";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // If user is already logged in, redirect them
  useEffect(() => {
    if (user) {
      const pendingToken = localStorage.getItem("pending_invite_token");
      const pendingJoinCode = localStorage.getItem("pending_join_code");
      
      if (pendingToken) {
        navigate(`/invite/${pendingToken}`);
      } else if (pendingJoinCode) {
        // If we had a join code intent, stay on /join to complete it
        // but we need to actually join now. For now, just land them there.
        navigate("/join");
      } else {
        const from = (location.state as any)?.from?.pathname || "/";
        navigate(from, { replace: true });
      }
    }
  }, [user, navigate, location]);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      }
    });
    if (error) toast.error(error.message);
  };

  return (
    <DarkProjectHero>
      <div className="max-w-md w-full space-y-8 text-center relative z-20 p-4">
        <div className="space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-700 mb-2 shadow-[0_0_20px_rgba(185,28,28,0.5)] mx-auto">
            <Heart className="h-6 w-6 text-white" />
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              <TextRotate
                texts={["FamilyHealth Hub", "Care Hub", "Smart Health", "Family First"]}
                mainClassName="justify-center"
                staggerFrom="last"
                staggerDuration={0.02}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              />
            </h1>
            
            <p className="text-red-200 font-medium drop-shadow-[0_1px_5px_rgba(0,0,0,0.5)] h-6">
              <TextRotate
                texts={[
                  "Your family's health, synced in real-time.",
                  "Manage medication schedules securely.",
                  "Keep your loved ones healthy.",
                  "Real-time health monitoring."
                ]}
                mainClassName="justify-center text-sm sm:text-base"
                staggerDuration={0.01}
                rotationInterval={3000}
                transition={{ type: "spring", damping: 20, stiffness: 200 }}
              />
            </p>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-md border-2 border-red-900/50 rounded-xl p-8 space-y-6 shadow-2xl mt-8">
          <Button 
            onClick={handleGoogleLogin} 
            className="w-full h-12 text-lg font-bold bg-red-700 hover:bg-red-800 text-white border-none shadow-[0_0_15px_rgba(185,28,28,0.3)]"
          >
            Continue with Google
          </Button>
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate("/join")} 
              className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest bg-red-700 hover:bg-red-800 text-white border-none shadow-[0_0_15px_rgba(185,28,28,0.3)] px-2"
            >
              Join Family
            </Button>
            <Button 
              onClick={() => navigate("/join")} 
              className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest bg-red-700 hover:bg-red-800 text-white border-none shadow-[0_0_15px_rgba(185,28,28,0.3)] px-2"
            >
              Create Hub
            </Button>
          </div>
        </div>
      </div>
    </DarkProjectHero>
  );
}
