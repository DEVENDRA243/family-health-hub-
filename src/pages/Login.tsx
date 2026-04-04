import { Heart, Sparkles, Zap, Shield, Activity, Users, Flame, Info, Check, ChevronDown, Camera, FileText, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      const pendingToken = localStorage.getItem("pending_invite_token");
      const pendingJoinCode = localStorage.getItem("pending_join_code");
      
      if (pendingToken) {
        navigate(`/invite/${pendingToken}`);
      } else if (pendingJoinCode) {
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
    <div className="relative min-h-screen bg-maxbg text-maxfg overflow-x-hidden font-dm selection:bg-accent1 selection:text-white">
      {/* 
        ========================================================================
        SECTION 1: HERO / LOGIN (Magenta Dominant)
        ========================================================================
      */}
      <section className="relative min-h-screen flex items-center justify-center p-6 md:p-12 z-10 py-24">
        {/* Global Patterns */}
        <div className="absolute inset-0 pointer-events-none z-0 mix-blend-screen opacity-30 pattern-mesh"></div>
        <div className="absolute inset-0 pointer-events-none z-0 opacity-10 pattern-dots"></div>

        {/* Massive Background Typography */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none z-0">
          <h1 className="text-[12rem] md:text-[25rem] font-bangers opacity-10 text-accent1 whitespace-nowrap -rotate-12 animate-pulse-gentle">
            HEALTH!
          </h1>
        </div>

        {/* Floating Decor */}
        <div className="absolute top-[10%] left-[5%] animate-float z-20 hidden md:block">
          <div className="bg-accent2/20 border-4 border-accent2 p-4 rounded-full">
            <Sparkles className="h-12 w-12 text-accent2 animate-spin-slow" strokeWidth={3} />
          </div>
        </div>
        
        <div className="absolute bottom-[20%] right-[10%] animate-float-reverse z-20 text-7xl hover:animate-wiggle cursor-crosshair">
          💊
        </div>

        {/* Main Login Container (Card) */}
        <div className="relative z-30 w-full max-w-xl group">
          <div className="absolute inset-0 bg-accent5 border-4 border-accent3 rounded-[2rem] rotate-3 shadow-[16px_16px_0_#FF3AF2,32px_32px_0_#00F5D4] transition-all duration-300 group-hover:rotate-6 group-hover:shadow-[24px_24px_0_#FF3AF2,48px_48px_0_#00F5D4]"></div>
          
          <div className="relative bg-maxbg border-4 border-accent2 rounded-[2rem] p-8 md:p-12 shadow-glow-lg -rotate-1 hover:rotate-0 transition-transform duration-300 backdrop-blur-md">
            <div className="flex flex-col items-center gap-6 relative z-10 w-full">
              <div className="flex flex-col items-center gap-2 w-full text-center mt-4">
                <h2 className="text-4xl md:text-5xl font-outfit font-black tracking-tight uppercase text-white [text-shadow:2px_2px_0_#7B2FFF,4px_4px_0_#FF3AF2,6px_6px_0_#00F5D4]">
                  Family <span className="ml-3 md:ml-5">Hub</span>
                </h2>
                <h2 className="text-3xl font-bangers text-accent3 transform rotate-2 animate-bounce-subtle mt-2">
                  Care Without the Chaos!
                </h2>
              </div>
              
              <p className="text-lg md:text-xl font-dm text-white/90 font-medium text-center max-w-sm mt-4 bg-maxbg/60 px-4 py-2 border-2 border-dashed border-accent1 rounded-xl">
                 Real-time. Real chaotic. <br className="hidden md:block"/> Keep your loved ones healthy.
              </p>

              <div className="w-full h-1 bg-gradient-to-r from-accent1 via-accent2 to-accent3 my-6 rounded-full opacity-50"></div>

              <Button 
                onClick={handleGoogleLogin} 
                className="w-full h-auto py-4 md:py-6 px-4 md:px-12 text-base md:text-2xl whitespace-normal break-words leading-tight flex-wrap font-outfit font-black uppercase tracking-widest bg-gradient-to-r from-accent1 via-accent5 to-accent2 border-4 border-accent3 rounded-[2rem] text-white shadow-glow hover:scale-[1.02] hover:rotate-1 hover:shadow-[0_0_30px_rgba(255,58,242,0.6),8px_8px_0_#FFE600,16px_16px_0_#FF3AF2] active:scale-95 transition-all duration-300 relative overflow-hidden group/btn bg-[length:200%_auto] animate-gradient-shift"
              >
                <span className="relative z-10 [text-shadow:2px_2px_0_#0D0D1A]">Continue with Google</span>
                <div className="absolute inset-0 pattern-stripes opacity-30 mix-blend-overlay pointer-events-none"></div>
              </Button>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full mt-4">
                <Button 
                  onClick={() => navigate("/join")} 
                  variant="outline"
                  className="flex-1 h-auto py-3 md:py-4 px-2 whitespace-normal break-words leading-tight bg-maxbg border-4 border-accent4 rounded-2xl text-accent2 font-outfit font-black uppercase tracking-widest shadow-[4px_4px_0_#FF6B35,8px_8px_0_#00F5D4] hover:translate-x-1 hover:translate-y-1 hover:shadow-[0px_0px_0_#FF6B35,0px_0px_0_#00F5D4] transition-all hover:bg-accent4 hover:text-white hover:border-white"
                >
                  Join Family
                </Button>
                <Button 
                  onClick={() => navigate("/join")} 
                  variant="outline"
                  className="flex-1 h-auto py-3 md:py-4 px-2 whitespace-normal break-words leading-tight bg-transparent border-4 border-dashed border-accent2 rounded-2xl text-accent2 font-outfit font-black uppercase tracking-widest hover:bg-accent2 hover:text-maxbg hover:border-solid hover:scale-105 transition-all outline-dashed outline-offset-2 outline-transparent hover:outline-accent1"
                >
                  Create Hub
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        SECTION 2: FEATURES (Cyan Dominant)
        ========================================================================
      */}
      <section className="relative py-24 md:py-32 px-6 md:px-12 z-20 bg-accent2/5 border-t-8 border-dashed border-accent2 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0 opacity-10 pattern-stripes"></div>
        <div className="absolute -left-20 top-40 text-[10rem] animate-spin-slow opacity-20">⚙️</div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-6xl md:text-8xl font-black font-outfit uppercase tracking-tighter text-white [text-shadow:4px_4px_0_#FF3AF2,8px_8px_0_#7B2FFF] -rotate-2">
              What We Do!
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {[
              { title: "Medication Sync", icon: Zap, color: "accent1", rotate: "rotate-2", offset: "", desc: "Never double-dose again. Everyone in your family gets an instant ping when a pill is taken. Total transparency!" },
              { title: "SOS Alerts", icon: Activity, color: "accent3", rotate: "-rotate-2", offset: "md:translate-y-12", desc: "One tap alerts your entire circle with your location and medical vitals in seconds. Faster than a text!" },
              { title: "Health Passport", icon: Users, color: "accent5", rotate: "rotate-1", offset: "", desc: "Your complete medical history, allergies, and blood type accessible immediately from your pocket. Chaos-proof." },
            ].map((feature, i) => (
              <div key={i} className={`group bg-maxmuted/80 backdrop-blur-sm border-4 border-${feature.color} rounded-3xl p-8 shadow-[8px_8px_0_#00F5D4,16px_16px_0_#FF3AF2] ${feature.rotate} ${feature.offset} hover:scale-[1.02] hover:rotate-0 transition-all duration-300 relative`}>
                <div className={`absolute -top-6 -right-6 h-16 w-16 bg-${feature.color} border-4 border-maxbg rounded-full flex items-center justify-center animate-wiggle`}>
                  <feature.icon className="h-8 w-8 text-maxbg" strokeWidth={3} />
                </div>
                <h3 className={`text-3xl font-black font-outfit uppercase mt-4 mb-4 text-${feature.color}`}>
                  {feature.title}
                </h3>
                <p className="text-lg text-white/80 font-dm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        SECTION 2.5: DEEP DIVE FEATURES (Magenta Dominant)
        ========================================================================
      */}
      <section className="relative py-24 md:py-32 px-6 md:px-12 z-25 bg-maxbg border-t-8 border-accent1 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0 opacity-15 pattern-mesh mix-blend-screen"></div>
        <div className="absolute right-[-10%] top-[20%] text-[15rem] animate-pulse-gentle opacity-10">🤖</div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-20 leading-none">
            <h2 className="text-6xl md:text-8xl font-black font-outfit uppercase tracking-tighter text-white [text-shadow:4px_4px_0_#FFE600,8px_8px_0_#00F5D4] rotate-1">
              THE FEATURES
            </h2>
            <div className="bg-accent1 text-maxbg px-8 py-4 rounded-full border-4 border-white font-bangers text-3xl md:text-5xl -rotate-3 animate-wiggle">
              WITH AI POWER!
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mt-12">
            {[
              {
                title: "AI Medical Summaries",
                icon: FileText,
                color: "accent1",
                rotate: "rotate-2",
                offset: "",
                desc: "Don't understand your doctor's gibberish? Our AI instantly translates complex medical reports into plain English with key takeaways.",
              },
              {
                title: "Smart Pill Scanner",
                icon: Camera,
                color: "accent3",
                rotate: "-rotate-2",
                offset: "md:translate-y-12",
                desc: "Snap a photo of any pill bottle. The AI reads the label, extracts the dosage, and automatically schedules it.",
              },
              {
                title: "Multi-User Control",
                icon: Users,
                color: "accent4",
                rotate: "-rotate-1",
                offset: "",
                desc: "Granular access controls. Give grandparents read-only access while you handle the primary health scheduling.",
              },
              {
                title: "Growth & Vitals",
                icon: LineChart,
                color: "accent2",
                rotate: "rotate-1",
                offset: "md:translate-y-12",
                desc: "Interactive logging for your kids' growth spurts and your family's daily vitals, securely grouped in one hub.",
              }
            ].map((feat, i) => (
              <div key={i} className={`group bg-maxmuted/80 backdrop-blur-sm border-4 border-${feat.color} rounded-3xl p-8 shadow-[8px_8px_0_#FFE600,16px_16px_0_#00F5D4] ${feat.rotate} ${feat.offset} hover:scale-[1.02] hover:rotate-0 transition-all duration-300 relative`}>
                <div className={`absolute -top-6 -right-6 h-16 w-16 bg-${feat.color} border-4 border-maxbg rounded-full flex items-center justify-center animate-wiggle`}>
                  <feat.icon className="h-8 w-8 text-maxbg" strokeWidth={3} />
                </div>
                <h3 className={`text-3xl font-black font-outfit uppercase mt-4 mb-4 text-${feat.color}`}>
                  {feat.title}
                </h3>
                <p className="text-lg text-white/80 font-dm leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        SECTION 3: ABOUT (Orange Dominant)
        ========================================================================
      */}
      <section className="relative py-24 md:py-32 px-6 md:px-12 z-30 bg-maxbg border-t-8 border-accent4 overflow-visible">
        <div className="absolute inset-0 pointer-events-none z-0 opacity-15 pattern-checker"></div>
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none pointer-events-none opacity-5">
          <span className="text-[20rem] font-bangers text-accent4 whitespace-nowrap">WHO WE ARE WHO WE ARE</span>
        </div>

        <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center justify-center">
          <div className="w-full space-y-8 bg-maxmuted border-4 border-accent1 p-10 md:p-16 rounded-[2rem] shadow-[12px_12px_0_#00F5D4,24px_24px_0_#FFE600] rotate-1 flex flex-col items-center text-center">
            <h2 className="text-5xl md:text-7xl font-black font-outfit uppercase text-white [text-shadow:3px_3px_0_#FF6B35]">
              The Mission
            </h2>
            <p className="text-2xl md:text-3xl font-dm text-accent2 leading-relaxed">
              Managing a family's health is stressful enough. Your app shouldn't be.
            </p>
            <p className="text-xl md:text-2xl font-dm text-white/90 leading-relaxed max-w-3xl">
              We built Family Health Hub because keeping track of who took what pill, when the next appointment is, and who's allergic to what shouldn't require a master's degree in spreadsheets. We turned critical care into an interconnected, dopamine-filled command center.
            </p>
            <div className="inline-block bg-accent2 text-maxbg font-black px-8 py-4 text-xl rounded-full border-4 border-accent1 -rotate-2 hover:rotate-2 hover:scale-105 transition-all mt-4">
              NO MORE BORING APPS!
            </div>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        SECTION 4: CAPABILITIES (Purple Dominant)
        ========================================================================
      */}
      <section className="relative py-24 md:py-32 px-6 md:px-12 z-20 bg-accent5/10 border-t-8 border-accent5">
        <div className="absolute inset-0 pointer-events-none z-0 opacity-20 pattern-dots mix-blend-screen"></div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h2 className="text-6xl md:text-9xl font-black font-outfit uppercase tracking-tighter mb-16 inline-block bg-clip-text text-transparent bg-gradient-to-r from-accent1 via-accent2 to-accent3 bg-[length:300%_auto] animate-gradient-shift">
            FULL POWER.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mt-12">
            {[
              { icon: Shield, title: "Ironclad Privacy", desc: "Your medical data locked down tighter than a vault. We don't mess around with security." },
              { icon: Activity, title: "Hyper Tracking", desc: "Every heartbeat, every pill, every appointment logged and flagged in bright neon colors." },
            ].map((cap, i) => (
              <div key={i} className={`bg-maxbg border-4 border-accent${i%2 ? '2' : '3'} p-10 rounded-[3xl] shadow-[12px_12px_0_#7B2FFF] relative overflow-hidden group`}>
                <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-150 transition-transform duration-500">
                  <cap.icon className="w-64 h-64 text-accent5" />
                </div>
                <div className="relative z-10 text-left">
                  <div className={`text-accent${i%2 ? '2' : '3'} mb-6`}>
                    <cap.icon className="w-16 h-16 animate-pulse-glow" strokeWidth={2.5}/>
                  </div>
                  <h3 className="text-4xl font-outfit font-black text-white uppercase mb-4">{cap.title}</h3>
                  <p className="text-xl font-dm text-white/80">{cap.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        SECTION 5: FAQ (Yellow Dominant)
        ========================================================================
      */}
      <section className="relative py-24 md:py-32 px-6 md:px-12 z-30 bg-maxbg border-t-8 border-double border-accent3">
        <div className="absolute inset-0 pointer-events-none z-0 opacity-10 pattern-stripes mix-blend-screen"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center gap-6 mb-16 justify-center">
            <h2 className="text-5xl md:text-8xl font-black font-bangers text-accent3 rotate-2 [text-shadow:4px_4px_0_#FF3AF2] text-center">
              QUESTIONS??
            </h2>
            <span className="text-5xl md:text-7xl animate-bounce-subtle hidden md:block">🤔</span>
          </div>

          <div className="space-y-6">
            {[
              { q: "Is my family's medical data actually safe?", a: "Bank-level encryption secures every piece of data. Hosted on enterprise-tier infrastructure, your records are only visible to the family members you explicitly invite." },
              { q: "What happens in a medical emergency?", a: "Hit the SOS button! It instantly pushes a high-priority alert to your family loop, complete with your exact location and a rapid-access summary of your critical health info." },
              { q: "Can I manage care for elderly parents?", a: "That's exactly what this is for! Create multiple 'Hubs' to manage your kids' vaccines in one place, and your aging parents' daily medication schedules in another." },
              { q: "Do I need technical skills to use this?", a: "Nope! We designed the interface to be loud, clear, and impossible to mess up. Big buttons, simple flows, and real-time syncing mean anyone can jump in." },
            ].map((faq, i) => (
              <div 
                key={i} 
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="group bg-maxmuted border-4 border-solid border-accent1 hover:border-dashed p-6 md:p-8 rounded-2xl shadow-[8px_8px_0_#FFE600] transition-all hover:translate-x-1 cursor-pointer"
              >
                <h3 className="text-xl md:text-3xl font-outfit font-black text-white uppercase flex items-center justify-between gap-4">
                  <div className="flex items-start md:items-center gap-4">
                    <span className="bg-accent1 text-maxbg px-3 rounded text-lg md:text-xl shrink-0 mt-1 md:mt-0">Q.</span>
                    <span className="break-words text-left leading-tight">{faq.q}</span>
                  </div>
                  <ChevronDown className={`w-8 h-8 shrink-0 transition-transform duration-300 text-accent1 ${openFaq === i ? 'rotate-180' : ''}`} />
                </h3>
                <div className={`grid transition-all duration-300 ease-in-out ${openFaq === i ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0'}`}>
                  <p className="text-lg md:text-xl font-dm text-accent2 flex items-start gap-4 overflow-hidden">
                    <span className="bg-accent2 text-maxbg px-3 rounded text-lg md:text-xl font-bold shrink-0 mt-1">A.</span>
                    <span className="break-words leading-relaxed">{faq.a}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-24 text-center px-4">
             <Button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth'})}
                className="w-full sm:w-auto h-auto py-4 px-6 md:py-6 md:px-12 text-base md:text-xl whitespace-normal break-words leading-tight font-outfit font-black uppercase tracking-widest bg-accent1 border-4 border-white rounded-full text-white shadow-[0_0_20px_rgba(255,58,242,0.8)] hover:scale-110 active:scale-95 transition-all"
              >
                Take me back up! 🚀
              </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
