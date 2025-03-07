
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const MISTRAL_API_KEY = Deno.env.get('MISTRAL_API_KEY')
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { messages, systemPrompt } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid messages format')
    }

    // Prepare the conversation history with system prompt
    const formattedMessages = [
      { 
        role: "system", 
        content: systemPrompt || "You are AetherIQ's air quality and health expert. Provide accurate, helpful information about air pollution, its health effects, and safety recommendations. Base your advice on scientific evidence and current air quality data when provided. Keep responses concise and practical."
      },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ]

    // Make request to Mistral AI
    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1024
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Mistral API error:', error)
      throw new Error(`Mistral API error: ${error.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    console.log('Mistral API response:', JSON.stringify(data, null, 2))

    return new Response(JSON.stringify({
      reply: data.choices[0].message.content,
      usage: data.usage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error in mistral-chat function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
