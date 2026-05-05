import { useState, useRef } from "react";
import { Camera, Loader2, ScanSearch, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useMembers } from "@/hooks/use-health-data";

export function AllergyScanner() {
  const { data: members } = useMembers();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string>("everyone");

  const startCameraScan = () => cameraInputRef.current?.click();
  const startGalleryScan = () => galleryInputRef.current?.click();

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset state and open dialog
    setResult(null);
    setIsOpen(true);
    setIsAnalyzing(true);

    const isDev = import.meta.env.DEV;
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    
    if (isDev && !apiKey) {
      toast.error("OpenRouter API key is missing. Check .env configuration.");
      setIsOpen(false);
      return;
    }

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      // Convert to base64
      const reader = new FileReader();
      const base64data = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const res = reader.result as string;
          resolve(res.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Prepare context about allergies and health conditions
      let healthContext = "";
      if (selectedMember === "everyone") {
        healthContext = "Here are the health conditions and allergies for everyone in the family:\n";
        members?.forEach(m => {
          if (m.conditions && m.conditions.length > 0) {
            healthContext += `- ${m.name}: ${m.conditions.join(", ")}\n`;
          }
        });
        if (healthContext === "Here are the health conditions and allergies for everyone in the family:\n") {
            healthContext = "There are no known health conditions or allergies in the family.";
        }
      } else {
        const member = members?.find(m => m.id === selectedMember);
        if (member) {
          healthContext = `Here are the health conditions and allergies for ${member.name}:\n`;
          if (member.conditions && member.conditions.length > 0) {
            healthContext += `- ${member.conditions.join(", ")}\n`;
          } else {
            healthContext = `${member.name} has no known health conditions or allergies recorded.`;
          }
        }
      }

      const body = {
         model: "google/gemini-2.5-flash",
         max_tokens: 1024,
         messages: [{
           role: "user",
           content: [
             {
               type: "image_url",
               image_url: {
                 url: `data:${file.type || 'image/jpeg'};base64,${base64data}`
               }
             },
             {
               type: "text",
               text: "You are a professional dietician and medical AI. Identify the food/meal in this image.\n\n" +
                     healthContext + "\n\n" +
                     "CRITICAL INSTRUCTION: Keep your answer EXTREMELY brief, clean, and to the point. No fluff, no introductory words. Use bullet points where applicable.\n\n" +
                     "Please provide your answer formatted in simple markdown using EXACTLY these headings:\n" +
                     "### Food Identification\n(1 short sentence max)\n\n" +
                     "### Allergy & Health Warning\n(1 short sentence max. CLEARLY state SAFE or UNSAFE based on the provided conditions)\n\n" +
                     "### Nutritional Highlights\n(2-3 short bullet points max)"
             }
           ]
         }]
      };

      let res;
      if (isDev) {
        res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": window.location.origin,
            "X-Title": "The Ambanis Health App"
          },
          body: JSON.stringify(body)
        });
      } else {
        res = await fetch("/api/openrouter", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        });
      }
      
      if (!res.ok) {
        let errMessage = `Server returned ${res.status}`;
        try {
           const errData = await res.json();
           if (errData.error?.message) errMessage = errData.error.message;
        } catch(e) {
           const errText = await res.text();
           console.error("Vercel error:", errText);
        }
        throw new Error(errMessage);
      }
      const data = await res.json();
      setResult(data.choices?.[0]?.message?.content || "Could not identify the food.");
    } catch (err) {
      console.error("AllergyScanner Error:", err);
      if (err instanceof Error) {
        toast.error(`Fail: ${err.message}`);
      } else {
        toast.error("Failed to analyze the food.");
      }
      setIsOpen(false);
    } finally {
      setIsAnalyzing(false);
      // reset file inputs
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const formatSummary = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;
      
      const renderText = (str: string) => {
          const parts = str.split(/(\*\*.*?\*\*)/g);
          return parts.map((p, i) => {
             if (p.startsWith('**') && p.endsWith('**')) {
                return <strong key={i} className="font-semibold text-foreground">{p.slice(2, -2)}</strong>;
             }
             return <span key={i}>{p}</span>;
          });
      };

      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        return (
          <div key={idx} className="flex items-start gap-2 mb-2 ml-2">
             <div className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60"></div>
             <span className="text-muted-foreground leading-relaxed flex-1">{renderText(trimmed.replace(/^[\*\-] /, ''))}</span>
          </div>
        );
      } else if (trimmed.startsWith('###')) {
         let icon = "🍽️";
         if (trimmed.includes("Identification")) icon = "🔍";
         else if (trimmed.includes("Warning") || trimmed.includes("Allergy")) icon = "⚠️";
         else if (trimmed.includes("Nutritional")) icon = "📊";

         return (
           <h4 key={idx} className="font-bold text-foreground mt-5 mb-2 flex items-center gap-1.5 text-base border-b pb-1 border-border/50">
             {icon} {trimmed.replace(/^###+ /, '')}
           </h4>
         );
      }
      return <p key={idx} className="mb-2 text-muted-foreground leading-relaxed">{renderText(trimmed)}</p>;
    });
  };

  return (
    <>
      <div className="card-medical border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent flex flex-col p-5 mb-6 shadow-sm border">
        <div className="flex items-center gap-4 mb-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-base">AI Allergy Scanner</h3>
            <p className="text-xs text-muted-foreground">Is this food safe?</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          Select who is eating, then point your camera at any food, menu, or ingredient label. The AI will cross-reference it with health conditions.
        </p>

        <div className="mb-4">
          <Select value={selectedMember} onValueChange={setSelectedMember}>
            <SelectTrigger className="w-full text-xs h-9 bg-background/50">
              <SelectValue placeholder="Who is this food for?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="everyone">Everyone (Shared Meal)</SelectItem>
              {members?.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2 w-full">
          <Button onClick={startCameraScan} className="w-full text-xs font-bold shadow-md bg-orange-600 text-white hover:bg-orange-700 px-2">
            <Camera className="h-4 w-4 mr-1.5" />
            Camera
          </Button>
          <Button onClick={startGalleryScan} variant="outline" className="w-full text-xs font-bold shadow-sm px-2 border-orange-500/20 text-foreground hover:bg-orange-500/10">
            <ScanSearch className="h-4 w-4 mr-1.5" />
            Gallery
          </Button>
        </div>
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          className="hidden" 
          ref={cameraInputRef}
          onChange={handleCapture}
        />
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={galleryInputRef}
          onChange={handleCapture}
        />
      </div>

      <Dialog open={isOpen} onOpenChange={(val) => { if (!isAnalyzing) setIsOpen(val); }}>
        <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-4 sm:p-6">
          <DialogHeader className="shrink-0 mb-2">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <UtensilsCrossed className="h-5 w-5 text-orange-500" />
              Food Analysis
            </DialogTitle>
            <DialogDescription>
              AI-powered safety check for your family
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar px-1 min-h-[300px]">
            {imagePreview && (
              <div className="mb-4 rounded-xl overflow-hidden border border-border relative bg-muted h-32 flex items-center justify-center">
                 <img src={imagePreview} alt="Captured food" className="w-full h-full object-cover opacity-60" />
                 {isAnalyzing && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] flex flex-col items-center justify-center z-10">
                       <Loader2 className="h-8 w-8 animate-spin text-orange-500 mb-2 shadow-sm" />
                       <span className="text-xs font-bold text-orange-600 tracking-widest bg-background/80 px-2 py-0.5 rounded uppercase">Analyzing...</span>
                    </div>
                 )}
              </div>
            )}
            
            {!isAnalyzing && result && (
              <div className="text-sm pb-4 animate-in fade-in duration-500">
                {formatSummary(result)}
              </div>
            )}
          </div>
          
          <div className="flex-shrink-0 mt-4 flex justify-end">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isAnalyzing} className="font-bold">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
