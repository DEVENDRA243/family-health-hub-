import { supabase } from "./supabase";

export async function analyzeMedicalReport(fileBase64: string, mimeType: string) {
  const prompt = `You are a medical assistant. Analyze this medical report and provide:
   - Overall health status (1 line)
   - Key findings (bullet points, simple language)
   - Any abnormal values explained simply
   - Recommended next steps
   Add a disclaimer: This is AI-generated, not medical advice.`;

  try {
    const { data, error } = await supabase.functions.invoke('analyze-medical-data', {
      body: {
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${fileBase64}`,
                },
              },
            ],
          },
        ],
        model: "google/gemini-2.0-flash-exp",
      },
    });

    if (error) throw error;
    return data.choices?.[0]?.message?.content || "No analysis available.";
  } catch (error: any) {
    console.error("AI Error:", error);
    throw new Error(error.message || "Failed to analyze report");
  }
}

/**
 * Analyzes a voice transcript against a family health snapshot and returns a natural voice response.
 */
export async function processVoiceCommand(transcript: string, snapshot: any) {
  const prompt = `You are a helpful family health assistant. 
    User Question: "${transcript}"
    Current Context: ${JSON.stringify(snapshot)}
    Answer concisely in 1-2 sentences. Use the data provided.`;

  try {
    const { data, error } = await supabase.functions.invoke('analyze-medical-data', {
      body: {
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "google/gemini-2.0-flash-exp",
      },
    });

    if (error) throw error;
    return data.choices?.[0]?.message?.content?.trim() || "I understood that, but couldn't generate a response.";
  } catch (error: any) {
    console.error("AI Voice Error:", error);
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
