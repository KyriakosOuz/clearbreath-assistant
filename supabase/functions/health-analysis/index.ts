
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const MISTRAL_API_KEY = Deno.env.get('MISTRAL_API_KEY')
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HealthData {
  heartRate: number;
  oxygenLevel: number;
  steps?: number;
  stressLevel?: number;
  aqiLevel: number;
  pollutants: {
    [key: string]: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { healthData }: { healthData: HealthData } = await req.json()
    
    if (!healthData) {
      throw new Error('Health data is required')
    }
    
    // Construct prompt with health and air quality data
    const prompt = `
      User's current health metrics:
      - Heart rate: ${healthData.heartRate} BPM
      - Blood oxygen level: ${healthData.oxygenLevel}%
      ${healthData.steps ? `- Steps today: ${healthData.steps}` : ''}
      ${healthData.stressLevel ? `- Stress level: ${healthData.stressLevel}/10` : ''}
      
      Current air quality:
      - AQI level: ${healthData.aqiLevel}
      - PM2.5: ${healthData.pollutants['PM2.5'] || 'N/A'} μg/m³
      - PM10: ${healthData.pollutants['PM10'] || 'N/A'} μg/m³
      - O3: ${healthData.pollutants['O3'] || 'N/A'} ppb
      - NO2: ${healthData.pollutants['NO2'] || 'N/A'} ppb
      
      Given these health metrics and current air quality:
      1. Assess if there's any immediate health risk.
      2. Provide a specific, personalized health recommendation.
      3. Determine if the user should reduce outdoor activity.
      4. If this is a dangerous situation requiring immediate action, start with "EMERGENCY ALERT:"
      
      Keep your response under 150 words, clear and actionable.
    `

    // Prepare the conversation history with system prompt
    const messages = [
      { 
        role: "system", 
        content: "You are AetherIQ's health and air quality specialist. You provide accurate, medically-sound advice based on users' health metrics and air quality data. Your recommendations should be personalized, practical, and based on established health guidelines. For high heart rates (>100 BPM) in poor air quality, recommend indoor activities. For low oxygen levels (<94%) in poor air quality, suggest medical attention. In dangerous situations, clearly mark your response as an emergency alert."
      },
      {
        role: "user",
        content: prompt
      }
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
        messages: messages,
        temperature: 0.7,
        max_tokens: 256
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Mistral API error:', error)
      throw new Error(`Mistral API error: ${error.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    
    // Extract the AI response
    const aiResponse = data.choices[0].message.content
    
    // Check if this is an emergency situation based on the response
    const isEmergency = aiResponse.toUpperCase().includes('EMERGENCY') || 
                        (healthData.heartRate > 120 && healthData.aqiLevel > 150) ||
                        (healthData.oxygenLevel < 92 && healthData.aqiLevel > 100)
    
    return new Response(JSON.stringify({
      recommendation: aiResponse,
      isEmergency: isEmergency,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error in health-analysis function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
