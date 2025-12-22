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
 */
export async function generateScript(prompt: string): Promise<VideoScript> {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) {
    throw new Error('GROK_API_KEY is not configured');
  }

  const systemPrompt = `You are a ragebait content generator. Given a prompt, create a provocative 20-second video script with 2-3 scenes.

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
    const response = await axios.post(
      `${GROK_API_BASE}/chat/completions`,
      {
        model: 'grok-4-1-fast-non-reasoning',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
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

/**
 * Generate speech audio using OpenAI TTS API
 * (Grok Voice API not yet publicly available)
 */
export async function generateSpeech(text: string, voice: string = 'onyx'): Promise<Buffer> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  try {
    // Using OpenAI TTS - voices: alloy, echo, fable, onyx, nova, shimmer
    const response = await axios.post(
      'https://api.openai.com/v1/audio/speech',
      {
        model: 'tts-1',
        input: text,
        voice: voice,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      }
    );

    return Buffer.from(response.data);
  } catch (error: any) {
    console.error('OpenAI TTS API error:', error.response?.data || error.message);
    throw new Error(`Failed to generate speech: ${error.message}`);
  }
}

