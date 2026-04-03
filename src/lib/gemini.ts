import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || "");

export async function analyzeMedicalReport(fileBase64: string, mimeType: string) {
  if (!API_KEY) throw new Error("VITE_GEMINI_API_KEY is missing.");

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are a medical assistant. Analyze this medical report and provide:
   - Overall health status (1 line)
   - Key findings (bullet points, simple language)
   - Any abnormal values explained simply
   - Recommended next steps
   Add a disclaimer: This is AI-generated, not medical advice.`;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: fileBase64,
          mimeType: mimeType,
        },
      },
    ]);

    return result.response.text();
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to analyze report with Gemini AI");
  }
}

/**
 * Analyzes a voice transcript against a family health snapshot and returns a natural voice response.
 */
export async function processVoiceCommand(transcript: string, snapshot: any) {
  if (!API_KEY) {
    return "I'm sorry, my brain is currently missing its API key. Please add it to the settings.";
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are a helpful family health assistant. 
    User Question: "${transcript}"
    Current Context: ${JSON.stringify(snapshot)}
    Answer concisely in 1-2 sentences. Use the data provided.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return text || "I understood that, but couldn't generate a response.";
  } catch (error: any) {
    console.error("Gemini Voice Error:", error);
    return "I'm having trouble processing that right now.";
  }
}

/**
 * Helper to convert a Blob/File to base64 string
 */
export async function fileToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data area (e.g. "data:image/png;base64,")
      const base64Data = base64String.split(",")[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
