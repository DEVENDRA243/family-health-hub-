import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2, LogIn, Sparkles, Instagram, Twitter } from "lucide-react";
import { useCreateFamily, useFamilyInfo, useJoinFamilyByCode } from "@/hooks/use-health-data";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// --- Utility Components ---

const SectionWrapper = ({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) => {
  return (
    <section id={id} className={`relative w-full overflow-hidden ${className}`}>
      {children}
    </section>
  );
};

const InstrumentItalic = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span 
    className={`not-italic ${className}`} 
    style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
  >
    {children}
  </span>
);

const CinematicVideo = ({ src, className = "", delay = 0 }: { src: string; className?: string; delay?: number }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let rafId: number;
    const fadeDuration = 0.5; // seconds

    const handleUpdate = () => {
      const { currentTime, duration } = video;
      if (duration > 0) {
        if (currentTime < fadeDuration) {
          // Fade in
          setOpacity(currentTime / fadeDuration);
        } else if (duration - currentTime < fadeDuration + 0.05) {
          // Fade out (slight buffer to ensure transition before end)
          setOpacity((duration - currentTime - 0.05) / fadeDuration);
        } else {
          setOpacity(1);
        }
      }
      rafId = requestAnimationFrame(handleUpdate);
    };

    const onEnded = () => {
      setOpacity(0);
      setTimeout(() => {
        video.currentTime = 0;
        video.play();
      }, 100);
    };

    video.addEventListener("ended", onEnded);
    video.addEventListener("canplay", () => {
       setTimeout(() => video.play(), delay);
    });

    rafId = requestAnimationFrame(handleUpdate);

    return () => {
      cancelAnimationFrame(rafId);
      video.removeEventListener("ended", onEnded);
    };
  }, [delay]);

  return (
    <video
      ref={videoRef}
      src={src}
      className={`${className} transition-opacity duration-100 ease-linear`}
      style={{ opacity }}
      muted
      autoPlay
      playsInline
      preload="auto"
    />
  );
};

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
        <Loader2 className="h-8 w-8 animate-spin text-white/20" />
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
      toast.error(`Failed to create family: ${err.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen selection:bg-white/20">
      <SectionWrapper className="h-screen flex flex-col">
        {/* Background Video */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <CinematicVideo 
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />
        </div>

        {/* Navbar */}
        <nav className="fixed top-6 md:top-8 left-1/2 -translate-x-1/2 w-full max-w-5xl z-50 px-4 md:px-6">
          <div className="liquid-glass rounded-full px-4 md:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4 md:gap-8 transition-all">
              <div className="flex items-center gap-1.5 md:gap-2 cursor-pointer shrink-0" onClick={() => navigate("/login")}>
                <img src="/favicon.png" alt="Family Hub Logo" className="w-5 h-5 md:w-6 md:h-6 object-contain" />
                <span className="font-bold text-xs md:text-sm tracking-[0.2em] uppercase">Family Hub</span>
              </div>
            </div>
            <button 
              onClick={user ? handleGoToLogin : () => navigate("/login")}
              className="liquid-glass rounded-full px-4 md:px-6 py-2.5 text-[10px] tracking-[0.2em] font-bold uppercase text-white hover:bg-white/5 transition flex items-center gap-2"
            >
              {user ? (
                <>
                  <LogIn className="h-3 w-3" />
                  <span>Sign Out</span>
                </>
              ) : (
                "Login"
              )}
            </button>
          </div>
        </nav>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-full max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center mb-12"
            >
              <h1 
                className="text-4xl md:text-6xl tracking-tight mb-4"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Join the <InstrumentItalic>Circle.</InstrumentItalic>
              </h1>
              <p className="text-white/60 font-light tracking-wide text-sm md:text-base">
                Create a new hub for your family or join an existing one to sync health data.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="liquid-glass rounded-3xl p-8 md:p-10 border border-white/10"
            >
              {/* Toggle Switch */}
              <div className="flex gap-2 p-1.5 liquid-glass rounded-2xl mb-8 bg-white/5 border border-white/5">
                <button
                  onClick={() => setIsJoining(false)}
                  className={`flex-1 py-2.5 text-xs md:text-sm font-medium rounded-xl transition-all duration-300 ${!isJoining ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                >
                  Create Family
                </button>
                <button
                  onClick={() => setIsJoining(true)}
                  className={`flex-1 py-2.5 text-xs md:text-sm font-medium rounded-xl transition-all duration-300 ${isJoining ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                >
                  Join Existing
                </button>
              </div>

              {isJoining ? (
                <form onSubmit={handleJoinFamily} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] md:text-xs tracking-widest uppercase text-white/40 ml-1">Invite Code</Label>
                    <Input
                      placeholder="Enter 6-digit code"
                      className="bg-white/5 border-white/10 h-12 md:h-14 text-lg md:text-xl font-medium tracking-widest text-center uppercase placeholder:text-white/10 focus:border-white/20 transition-all rounded-2xl"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 md:h-14 bg-white text-black hover:bg-white/90 rounded-2xl font-medium text-sm md:text-base transition-all group shadow-xl shadow-white/5"
                    disabled={joinFamily.isPending}
                  >
                    {!user ? "Sign In to Join" : joinFamily.isPending ? <Loader2 className="animate-spin w-5 h-5" /> : "Connect Family"}
                    {user && !joinFamily.isPending && <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleCreateFamily} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] md:text-xs tracking-widest uppercase text-white/40 ml-1">Family Name</Label>
                    <Input
                      placeholder="e.g. The Johnsons"
                      className="bg-white/5 border-white/10 h-12 md:h-14 text-base md:text-lg px-6 placeholder:text-white/10 focus:border-white/20 transition-all rounded-2xl"
                      value={familyName}
                      onChange={(e) => setFamilyName(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 md:h-14 bg-white text-black hover:bg-white/90 rounded-2xl font-medium text-sm md:text-base transition-all group shadow-xl shadow-white/5"
                    disabled={createFamily.isPending}
                  >
                    {!user ? "Sign In to Create" : createFamily.isPending ? <Loader2 className="animate-spin w-5 h-5" /> : "Start Family Hub"}
                    {user && !createFamily.isPending && <Sparkles className="ml-2 w-4 h-4 transition-transform group-hover:scale-110" />}
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        </div>

        {/* Social Icons */}
        <div className="fixed bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-10 flex gap-3 md:gap-4 scale-90 md:scale-100">
          {[Instagram, Twitter, "logo"].map((item, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
              className="liquid-glass rounded-full p-4 text-white/60 hover:text-white hover:bg-white/5 transition"
            >
              {item === "logo" ? (
                <img src="/favicon.png" alt="Logo" className="w-5 h-5 object-contain opacity-60" />
              ) : (
                (() => {
                  const Icon = item as any;
                  return <Icon className="w-5 h-5" />;
                })()
              )}
            </motion.button>
          ))}
        </div>
      </SectionWrapper>
    </div>
  );
}
