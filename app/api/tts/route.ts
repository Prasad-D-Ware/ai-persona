import { personaConfig } from "@/utils/personas";

export async function POST(request: Request) {
  try {
    const { text, persona } = await request.json();
    
    if (!text || !persona) {
      return Response.json({ error: "Missing text or persona" }, { status: 400 });
    }

    const voiceId = personaConfig[persona as keyof typeof personaConfig]?.voiceId;
    
    if (!voiceId) {
      return Response.json({ error: "Invalid persona" }, { status: 400 });
    }

    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    
    if (!ELEVENLABS_API_KEY) {
      return Response.json({ error: "ElevenLabs API key not configured" }, { status: 500 });
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.0,
          use_speaker_boost: true
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('TTS Error:', error);
    return Response.json({ error: "Failed to generate audio" }, { status: 500 });
  }
}
