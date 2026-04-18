export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: "Method Not Allowed" } });
  }

  // Support both standard env and Vite env syntax just in case
  const apiKey = process.env.VITE_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: { message: "Server API key missing in Vercel settings. Ensure VITE_OPENROUTER_API_KEY is configured." } });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": req.headers.referer || "https://family-health-hub.vercel.app",
        "X-Title": "The Ambanis Health App"
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error("OpenRouter API Error:", error);
    return res.status(500).json({ error: { message: `Backend error: ${error.message || "Unknown error"}` } });
  }
}
