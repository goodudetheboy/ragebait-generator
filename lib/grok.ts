import axios from 'axios';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

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

  const hasImages = images && images.length > 0;
  const imageCount = images?.length || 0;
  
  const systemPrompt = `You are a ragebait content generator. ${
    hasImages 
      ? `Given ${imageCount} image${imageCount > 1 ? 's' : ''}, analyze what you see and create a provocative 20-second video script about it with ${imageCount} scenes (one per image).`
      : `Given a prompt, create a provocative 20-second video script with 2-3 scenes.`
  }

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "script": "The full spoken script (provocative, attention-grabbing, under 50 words)",
  "scenes": [
    {"duration": 7, "keywords": "${hasImages ? 'describe the image' : 'search keywords for image'}", "caption": "TEXT ON SCREEN"},
    {"duration": 7, "keywords": "${hasImages ? 'describe the image' : 'search keywords for image'}", "caption": "TEXT ON SCREEN"},
    {"duration": 6, "keywords": "${hasImages ? 'describe the image' : 'search keywords for image'}", "caption": "TEXT ON SCREEN"}
  ]
}

Rules:
- Total duration must be exactly 20 seconds
- ${hasImages ? `${imageCount} scene${imageCount > 1 ? 's' : ''} (one per image)` : `2-3 scenes only`}
- Script should be provocative and attention-grabbing and rage-inducing, but has to be humanlike speech and not AI generated vibes
- Keywords should ${hasImages ? 'describe what\'s in each image' : 'be simple image search terms'}
- This is using ElevenLabs, so you can include audio tags wrapped in [] like [laughs], [shouting], anything you can think of to make it more engaging and rage-inducing
- Captions should be short (3-7 words max)
- Make it controversial and attention-grabbing`;

  try {
    // Build messages with images if provided
    const messages: Array<{role: string; content: any}> = [
      { role: 'system', content: systemPrompt }
    ];
    
    if (hasImages) {
      // Validate and clean base64 strings
      const cleanedImages = images!.map(base64 => {
        // Remove any whitespace, newlines, or extra characters
        let cleaned = base64.trim().replace(/\s/g, '');
        
        // Remove data URL prefix if it exists
        if (cleaned.startsWith('data:image')) {
          cleaned = cleaned.split(',')[1];
        }
        
        console.log(`Image size: ${cleaned.length} characters`);
        return cleaned;
      });
      
      // Grok Vision supports images
      const imageContents = cleanedImages.map(base64 => ({
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
    console.error('Full error:', error);
    
    // Better error message for common issues
    if (error.response?.data) {
      const errorData = error.response.data;
      if (errorData.error?.includes('Base64') || errorData.error?.includes('image')) {
        throw new Error('Image format error. Please try a different image.');
      }
      if (errorData.error?.includes('model')) {
        throw new Error(`Model error: ${errorData.error}`);
      }
      throw new Error(`Grok API error: ${errorData.error || errorData.message || 'Unknown error'}`);
    }
    
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
    const elevenlabs = new ElevenLabsClient({
      apiKey: apiKey,
    });

    const audio = await elevenlabs.textToSpeech.convert(voiceId, {
      text: text,
      modelId: 'eleven_v3',
      voiceSettings: {
        stability: 0.00, // Lower = more expressive/unhinged
        similarityBoost: 0.75, // Keep natural characteristics
        style: 0.75, // Higher = more exaggerated/annoying
        useSpeakerBoost: true // Boost clarity for engagement
      }
    });

    // Convert ReadableStream to Buffer
    const reader = audio.getReader();
    const chunks: Uint8Array[] = [];
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    return Buffer.concat(chunks.map(chunk => Buffer.from(chunk)));
  } catch (error: any) {
    console.error('ElevenLabs TTS API error:', error.message);
    throw new Error(`Failed to generate speech: ${error.message}`);
  }
}

