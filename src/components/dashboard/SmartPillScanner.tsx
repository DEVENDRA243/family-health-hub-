import { useState, useRef } from "react";
import { Camera, Loader2, ScanSearch, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useMedicines } from "@/hooks/use-health-data";
import { supabase } from "@/lib/supabase";

export function SmartPillScanner() {
  const { data: medicines } = useMedicines();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const startCameraScan = () => cameraInputRef.current?.click();
  const startGalleryScan = () => galleryInputRef.current?.click();

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset state and open dialog
    setResult(null);
    setIsOpen(true);
    setIsAnalyzing(true);

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

      // Prepare context about family medicines
      let familyContext = "No medicines are currently scheduled for the family.";
      if (medicines && medicines.length > 0) {
        familyContext = "The family has the following medicines scheduled. See if the image matches any of these by strictly checking the generic or brand names:\n";
        medicines.forEach(m => {
          familyContext += `- ${m.name} (${m.dosage}) for ${m.members?.name}\n`;
        });
      }

      const messages = [{
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
               text: "You are a professional pharmacist AI. Identify the medicine in this image.\n\n" +
                     familyContext + "\n\n" +
                     "Please provide your answer formatted in simple markdown using exactly these headings:\n" +
                     "### Medicine Identity\n(tell me what it is and its generic name)\n\n" +
                     "### Used For\n(simple terms)\n\n" +
                     "### Family Tracker Status\n(Does it match anything in the family's schedule provided above? If yes, who is it for? If no, clearly say it doesn't match.)\n\n" +
                     "### Side Effects & Warnings\n(brief, plain English caution)"
             }
           ]
      }];

      const { data, error } = await supabase.functions.invoke('analyze-medical-data', {
        body: {
          messages,
          model: "google/gemini-2.0-flash-exp"
        }
      });
      
      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message || "Connection to AI service failed");
      }
      
      if (data?.isAiError) {
        console.error("AI service error:", data.error);
        throw new Error(data.error || "AI service returned an error");
      }
      
      setResult(data.choices?.[0]?.message?.content || "Could not identify medicine.");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to analyze the medicine.");
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
         let icon = "💊";
         if (trimmed.includes("Identity")) icon = "🔍";
         else if (trimmed.includes("Used For")) icon = "📋";
         else if (trimmed.includes("Family")) icon = "👨‍👩‍👦";
         else if (trimmed.includes("Effects")) icon = "⚠️";

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
      <div className="card-medical border-primary/20 bg-gradient-to-br from-primary/5 to-transparent flex flex-col p-5 mb-6 shadow-sm border">
        <div className="flex items-center gap-4 mb-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <ScanSearch className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-base">Smart Pill Scanner</h3>
            <p className="text-xs text-muted-foreground">What is this medicine?</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          Point your camera at any pill or medicine strip. The AI will identify it and check if it belongs to someone in your family schedule.
        </p>
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button onClick={startCameraScan} className="w-full text-xs font-bold shadow-md bg-foreground text-background hover:bg-foreground/90 px-2">
            <Camera className="h-4 w-4 mr-1.5" />
            Camera
          </Button>
          <Button onClick={startGalleryScan} variant="outline" className="w-full text-xs font-bold shadow-sm px-2 border-foreground/20 text-foreground">
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
              <ScanSearch className="h-5 w-5 text-primary" />
              Pill Identity
            </DialogTitle>
            <DialogDescription>
              AI-powered analysis of your medicine
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar px-1 min-h-[300px]">
            {imagePreview && (
              <div className="mb-4 rounded-xl overflow-hidden border border-border relative bg-muted h-32 flex items-center justify-center">
                 <img src={imagePreview} alt="Captured pill" className="w-full h-full object-cover opacity-60" />
                 {isAnalyzing && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] flex flex-col items-center justify-center z-10">
                       <Loader2 className="h-8 w-8 animate-spin text-primary mb-2 shadow-sm" />
                       <span className="text-xs font-bold text-primary tracking-widest bg-background/80 px-2 py-0.5 rounded uppercase">Identifying...</span>
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
