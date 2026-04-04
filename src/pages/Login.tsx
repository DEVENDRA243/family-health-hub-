import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Instagram, Twitter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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

// --- Video Crossfade Component ---

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

// --- Main Page Component ---

export default function Login() {
  const navigate = useNavigate();

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
    <div className="bg-black text-white min-h-screen selection:bg-white/20">
      
      {/* SECTION 1: HERO */}
      <SectionWrapper className="h-screen flex flex-col">
        {/* Background Video */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <CinematicVideo 
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260404_050931_6b868bbb-85a4-498d-921e-e815d5a55906.mp4"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />
        </div>

        {/* Navbar */}
        <nav className="fixed top-6 md:top-8 left-1/2 -translate-x-1/2 w-full max-w-5xl z-50 px-4 md:px-6">
          <div className="liquid-glass rounded-full px-4 md:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4 md:gap-8 transition-all">
              <div className="flex items-center gap-1.5 md:gap-2 cursor-pointer shrink-0" onClick={() => navigate("/")}>
                <img src="/favicon.png" alt="Family Hub Logo" className="w-5 h-5 md:w-6 md:h-6 object-contain" />
                <span className="font-bold text-xs md:text-sm tracking-[0.2em] uppercase">Family Hub</span>
              </div>
              <div className="hidden md:flex items-center gap-8 text-[10px] tracking-[0.2em] font-bold uppercase text-white/40">
                <a href="#about" className="hover:text-white transition-colors">Mission</a>
                <a href="#featured" className="hover:text-white transition-colors">Capabilities</a>
                <a href="#philosophy" className="hover:text-white transition-colors">Safety</a>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <button 
                onClick={() => navigate("/join")}
                className="liquid-glass rounded-full px-4 md:px-6 py-2.5 text-[10px] tracking-[0.2em] font-bold uppercase hover:bg-white/5 transition"
              >
                Join Family
              </button>
              <button 
                onClick={handleGoogleLogin}
                className="liquid-glass rounded-full px-4 md:px-6 py-2.5 text-[10px] tracking-[0.2em] font-bold uppercase hover:bg-white/5 transition whitespace-nowrap"
              >
                Login
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center -translate-y-[2%] md:-translate-y-[5%] px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl tracking-tight mb-8 md:mb-12 md:whitespace-nowrap text-white"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Family health, <InstrumentItalic>perfectly in sync.</InstrumentItalic>
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="w-full max-w-xl px-4"
          >
            <p className="text-base md:text-lg text-white leading-relaxed font-light tracking-wide">
              A coordinated ecosystem for family health. Track vitals, sync medications, and analyze reports with AI—all in one secure, shared hub.
            </p>
          </motion.div>
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

      {/* SECTION 2: ABOUT */}
      <AboutSection />

      {/* SECTION 3: FEATURED VIDEO */}
      <FeaturedVideoSection />

      {/* SECTION 4: PHILOSOPHY */}
      <PhilosophySection />
    </div>
  );
}

// --- Section Components ---

function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <SectionWrapper id="about" className="pt-32 md:pt-44 pb-12 md:pb-20 px-6 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.03)_0%,_transparent_70%)] text-center md:text-left">
      <div ref={ref} className="max-w-6xl mx-auto">
        <motion.p 
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-white/40 text-xs md:text-sm tracking-widest uppercase mb-8 md:mb-12"
        >
          THE MISSION
        </motion.p>
        <motion.h2 
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl leading-[1.1] tracking-tight max-w-5xl mb-24 md:mb-32 mx-auto md:mx-0"
        >
          Intelligent care for <br className="hidden md:block" /> 
          families that <InstrumentItalic className="text-white/60">support,</InstrumentItalic>{" "}
          <InstrumentItalic className="text-white/60">protect,</InstrumentItalic>{" "}
          and <InstrumentItalic className="text-white/60">heal.</InstrumentItalic>
        </motion.h2>

        <motion.p 
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-white/40 text-xs md:text-sm tracking-widest uppercase mb-4"
        >
          CAPABILITIES
        </motion.p>
      </div>
    </SectionWrapper>
  );
}

const FeatureCard = ({ title, desc, isRight }: { title: string; desc: string; isRight?: boolean }) => (
  <div className={`liquid-glass rounded-2xl p-6 md:p-8 hover:bg-white/5 transition group/card border border-white/5 shadow-xl ${isRight ? 'md:text-right text-left' : 'text-left'}`}>
    <p className="text-white/50 text-[10px] md:text-xs tracking-widest uppercase mb-2 md:mb-3">{title}</p>
    <p className="text-white text-xs md:text-base leading-relaxed">{desc}</p>
  </div>
);

function FeaturedVideoSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const leftFeatures = [
    { title: "MEDICAL AI", desc: "AI-powered analysis of complex medical reports for instant clarity." },
    { title: "SOS ALERTS", desc: "One-tap emergency notifications sent directly to your family circle." }
  ];

  const rightFeatures = [
    { title: "PILL SCANNER", desc: "Smart OCR technology to effortlessly synchronize medication schedules." },
    { title: "VITALS SYNC", desc: "Your family's health data, perfectly mirrored across all devices." }
  ];

  return (
    <SectionWrapper id="featured" className="relative min-h-screen md:h-screen w-full overflow-hidden flex flex-col justify-center">
      {/* Background Video (Full Bleed) */}
      <div ref={ref} className="absolute inset-0 z-0">
        <video 
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4"
          className="absolute inset-0 w-full h-full object-cover scale-105"
          muted autoPlay loop playsInline
        />
        {/* Gradient overlays to ensure text/card readability and smooth section transitions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black/60" />
      </div>
      
      {/* Unified Overlay (Floating Edge-to-Edge) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24 md:py-0 flex flex-col md:grid md:grid-cols-4 gap-6 md:gap-12 justify-center items-center min-h-full">
        {/* Left side Features */}
        <div className="flex flex-col justify-center gap-6 md:gap-10 order-1 w-full max-w-sm md:max-w-none">
          {leftFeatures.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -40 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
              transition={{ duration: 0.9, delay: i * 0.2 }}
            >
              <FeatureCard {...f} />
            </motion.div>
          ))}
        </div>

        {/* Clear Center Gap (Maintaining the focal point of the video) */}
        <div className="hidden md:block col-span-2 pointer-events-none order-2" />

        {/* Right side Features */}
        <div className="flex flex-col justify-center gap-6 md:gap-10 order-3 w-full max-w-sm md:max-w-none">
          {rightFeatures.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 40 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
              transition={{ duration: 0.9, delay: i * 0.2 }}
            >
              <FeatureCard {...f} isRight />
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}

function PhilosophySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <SectionWrapper id="philosophy" className="py-24 md:py-40 px-6">
      <div ref={ref} className="max-w-6xl mx-auto">
        <motion.h2 
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tight mb-16 md:mb-24"
        >
          Care <InstrumentItalic className="text-white/40">x</InstrumentItalic> Connection
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-10 md:gap-20">
          <motion.div 
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="rounded-[2rem] md:rounded-3xl overflow-hidden aspect-[4/3] md:aspect-[4/3]"
          >
            <video 
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4"
              className="w-full h-full object-cover"
              muted autoPlay loop playsInline
            />
          </motion.div>

          <motion.div 
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col justify-center gap-8 md:gap-12"
          >
            <div>
              <p className="text-white/40 text-[10px] md:text-xs tracking-widest uppercase mb-3 md:mb-4">CHOOSE SAFETY</p>
              <p className="text-white/70 text-sm md:text-lg leading-relaxed">
                Every vital sign we track is a promise of transparency. We operate at the crossroads of secure data and human empathy, turning medical complexity into peace of mind.
              </p>
            </div>
            <div className="w-full h-px bg-white/10" />
            <div>
              <p className="text-white/40 text-[10px] md:text-xs tracking-widest uppercase mb-3 md:mb-4">EMPOWER THE CIRCLE</p>
              <p className="text-white/70 text-sm md:text-lg leading-relaxed">
                We believe that the best health outcomes emerge when the family loop is strong. Our process is designed to uncover risks before they become emergencies.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}

