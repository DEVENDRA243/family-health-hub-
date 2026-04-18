export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: { message: "Method Not Allowed" } }), { 
      status: 405, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  // Safely read the API key from Vercel's secure environment.
  // We use VITE_OPENROUTER_API_KEY to be backward compatible with what the user already set.
  const apiKey = process.env.VITE_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: { message: "Server API key missing. Please configure it in Vercel project settings." } }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  try {
    const body = await req.json();

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": req.headers.get("referer") || "https://family-health-hub.vercel.app",
        "X-Title": "The Ambanis Health App"
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("OpenRouter API Error:", error);
    return new Response(JSON.stringify({ error: { message: "Internal server error connecting to AI backend." } }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
