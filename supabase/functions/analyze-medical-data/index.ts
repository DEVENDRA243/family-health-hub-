const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')
    if (!OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY is not set')
      throw new Error('Server configuration error: API key missing')
    }

    const requestData = await req.json()
    console.log('Received request for model:', requestData.model)

    if (!requestData.messages || !Array.isArray(requestData.messages)) {
      console.error('Invalid messages format:', JSON.stringify(requestData))
      throw new Error('Invalid request: messages array is required')
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://family-health-hub.vercel.app",
        "X-Title": "Family Health Hub"
      },
      body: JSON.stringify({
        model: requestData.model || "google/gemini-2.0-flash-exp",
        messages: requestData.messages,
      })
    })

    const data = await response.json()
    console.log('OpenRouter response status:', response.status)

    if (!response.ok) {
      console.error('OpenRouter error details:', JSON.stringify(data))
      return new Response(JSON.stringify({ 
        error: data.error?.message || `OpenRouter error: ${response.status}`,
        details: data
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status,
      })
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Function error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
