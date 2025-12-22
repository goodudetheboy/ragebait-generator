import axios from 'axios';

const GROK_API_BASE = 'https://api.x.ai/v1';

export interface SceneDescription {
  duration: number;
  keywords: string;
  caption: string;
}

export interface VideoScript {
  script: string;
  scenes: SceneDescription[];
}

/**
 * Generate video script and scene descriptions using Grok LLM
 * Can optionally analyze images to generate ragebait content
 */
export async function generateScript(prompt: string, images?: string[]): Promise<VideoScript> {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) {
    throw new Error('GROK_API_KEY is not configured');
  }

  // Build system prompt based on whether images are provided
  const hasImages = images && images.length > 0;
  const imageCount = images?.length || 0;
  
  const systemPrompt = hasImages
    ? `You are a ragebait content generator. Given ${imageCount} image${imageCount > 1 ? 's' : ''}, analyze what you see and create a provocative 20-second video script about it with ${imageCount} scenes (one per image).

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "script": "The full spoken ragebait script about the image${imageCount > 1 ? 's' : ''} (provocative, attention-grabbing, under 50 words)",
  "scenes": [
    {"duration": ${imageCount === 1 ? 20 : imageCount === 2 ? 10 : 7}, "keywords": "describe the image", "caption": "TEXT ON SCREEN"}${imageCount > 1 ? `,
    {"duration": ${imageCount === 2 ? 10 : imageCount === 3 ? 7 : 6}, "keywords": "describe the image", "caption": "TEXT ON SCREEN"}` : ''}${imageCount === 3 ? `,
    {"duration": 6, "keywords": "describe the image", "caption": "TEXT ON SCREEN"}` : ''}
  ]
}

Rules:
- Total duration must be exactly 20 seconds
- ${imageCount} scene${imageCount > 1 ? 's' : ''} (one per image)
- Script should be provocative ragebait about what you see in the image${imageCount > 1 ? 's' : ''}
- Keywords should describe what's in each image
- Captions should be short (3-7 words max)
- Make it controversial and attention-grabbing`
    : `You are a ragebait content generator. Given a prompt, create a provocative 20-second video script with 2-3 scenes.

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "script": "The full spoken script (provocative, attention-grabbing, under 50 words)",
  "scenes": [
    {"duration": 7, "keywords": "search keywords for image", "caption": "TEXT ON SCREEN"},
    {"duration": 7, "keywords": "search keywords for image", "caption": "TEXT ON SCREEN"},
    {"duration": 6, "keywords": "search keywords for image", "caption": "TEXT ON SCREEN"}
  ]
}

Rules:
- Total duration must be exactly 20 seconds
- 2-3 scenes only
- Script should be provocative and attention-grabbing
- Keywords should be simple image search terms
- Captions should be short (3-7 words max)`;

  try {
    // Build messages with images if provided
    const messages: Array<{role: string; content: any}> = [
      { role: 'system', content: systemPrompt }
    ];
    
    if (hasImages) {
      // Grok Vision supports images
      const imageContents = images!.map(base64 => ({
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${base64}`
        }
      }));
      
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: prompt || 'Create provocative ragebait content about this image' },
          ...imageContents
        ]
      });
    } else {
      messages.push({ role: 'user', content: prompt });
    }

    const response = await axios.post(
      `${GROK_API_BASE}/chat/completions`,
      {
        model: 'grok-4-1-fast-non-reasoning',
        messages,
        temperature: 0.9,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0].message.content.trim();
    
    // Try to extract JSON if wrapped in markdown
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    
    const result = JSON.parse(jsonStr) as VideoScript;
    
    // Validate structure
    if (!result.script || !Array.isArray(result.scenes)) {
      throw new Error('Invalid response structure from Grok');
    }
    
    return result;
  } catch (error: any) {
    console.error('Grok API error:', error.response?.data || error.message);
    throw new Error(`Failed to generate script: ${error.message}`);
  }
}

// ElevenLabs Voice IDs - Mapped to RAGEBAIT personalities
export const ELEVENLABS_VOICES = {
  // MAXIMUM RAGE - Most engaging for ragebait
  'elli': 'MF3mGyEYCl7XYWbV9V6O',      // UNHINGED & EMOTIONAL ⭐
  'charlotte': 'XB0fDUnXU5powFXDhCwa',  // CONDESCENDING & SEDUCTIVE
  'adam': 'pNInz6obpgDQGcFmaJgB',       // ALPHA MALE ENERGY
  
  // ANNOYING AF - High irritation factor
  'rachel': 'IKne3meq5aSn9XLyUdCD',     // VALLEY GIRL ENERGY
  'bella': 'EXAVITQu4vr4xnSDxMaL',      // ASMR WHISPER CREEP
  'antoni': 'ErXwobaYiN019PkySvjV',     // SMUG KNOW-IT-ALL
  
  // PASSIVE AGGRESSIVE - Subtle but annoying
  'josh': 'TxGEqnHWrfWFTfGW9XjX',       // DEEP VOICE MANSPLAINER
  'dorothy': 'ThT5KcBeYPX3keUQqHPh',    // BRITISH KAREN
} as const;

/**
 * Generate speech audio using ElevenLabs API
 * More natural and expressive than OpenAI TTS
 */
export async function generateSpeech(
  text: string, 
  voiceId: string = ELEVENLABS_VOICES.rachel
): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY is not configured');
  }

  try {
    // Using ElevenLabs TTS - Tuned for MAXIMUM RAGEBAIT
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: text,
        model_id: 'eleven_turbo_v2_5', // Fastest, most cost-effective model
        voice_settings: {
          stability: 0.35, // Lower = more expressive/unhinged
          similarity_boost: 0.75, // Keep natural characteristics
          style: 0.75, // Higher = more exaggerated/annoying
          use_speaker_boost: true // Boost clarity for engagement
        }
      },
      {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      }
    );

    return Buffer.from(response.data);
  } catch (error: any) {
    console.error('ElevenLabs TTS API error:', error.response?.data || error.message);
    throw new Error(`Failed to generate speech: ${error.message}`);
  }
}

