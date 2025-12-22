# 🎤 Migration to ElevenLabs TTS

## What Changed

We've switched from OpenAI TTS to ElevenLabs for better voice quality and more expressive options.

## ✅ Changes Made

### 1. Updated `lib/grok.ts`
- Replaced OpenAI TTS implementation with ElevenLabs API
- Added voice ID constants for easy voice selection
- Using `eleven_turbo_v2_5` model (fastest, most cost-effective)
- Configured voice settings for expressive delivery

### 2. Updated `app/api/generate/route.ts`
- Changed to use ElevenLabs voices
- Default voice: `elli` (emotional female, perfect for ragebait)
- Imported `ELEVENLABS_VOICES` constant

### 3. Updated Documentation
- `README.md` - Updated features, tech stack, setup instructions
- `SETUP.md` - Added ElevenLabs API key instructions
- `VOICE_OPTIONS.md` - New comprehensive voice guide

## 🔑 Required: Get ElevenLabs API Key

1. Go to https://elevenlabs.io/
2. Sign up for free account
3. Navigate to Profile → API Keys
4. Create a new API key
5. Add to `.env.local`:

```bash
ELEVENLABS_API_KEY=sk_your_key_here
```

## 💰 Pricing Comparison

### OpenAI TTS
- ~$0.015 per 1,000 characters
- 6 voices (alloy, echo, fable, onyx, nova, shimmer)
- Good quality, but robotic

### ElevenLabs (New)
- **Free tier**: 10,000 characters/month (FREE!)
- **Paid**: ~$0.30 per 1,000 characters
- Hundreds of voices + custom voices
- Much more natural and expressive
- Emotion control

**For typical usage**: ~50 chars per video = **200 free videos/month**

## 🎯 Voice Recommendations

### For Ragebait Content:

1. **`elli`** (Default) - Emotional female, expressive
2. **`charlotte`** - Seductive, attention-grabbing
3. **`adam`** - Deep male, authoritative

### For Annoying/Irritating Content:

Visit https://elevenlabs.io/voice-library/annoying and search for:
- "The Insufferable Know-It-All"
- "The Hyperactive Valley Girl"
- "Obnoxious Bro"

Copy the Voice ID and use it directly.

## 🔄 How to Switch Voices

Edit `app/api/generate/route.ts` line ~55:

```typescript
// Option 1: Use pre-configured voice
const audioBuffer = await generateSpeech(
  videoScript.script, 
  ELEVENLABS_VOICES.charlotte  // Change this
);

// Option 2: Use custom voice ID
const audioBuffer = await generateSpeech(
  videoScript.script, 
  'your_custom_voice_id_here'
);
```

## 🎛️ Customize Voice Settings

Edit `lib/grok.ts` voice_settings:

```typescript
voice_settings: {
  stability: 0.3,        // Lower = more expressive (0.3-0.5 for ragebait)
  similarity_boost: 0.75, // Higher = more natural (0.7-0.85)
  style: 0.7,            // Higher = more exaggerated (0.5-0.9 for ragebait)
  use_speaker_boost: true // Keep enabled
}
```

## 🚀 Testing

1. Add `ELEVENLABS_API_KEY` to `.env.local`
2. Restart dev server: `npm run dev`
3. Generate a video
4. Listen to the voice quality difference!

## 🔙 Rollback (If Needed)

If you want to go back to OpenAI TTS:

1. Restore `OPENAI_API_KEY` in `.env.local`
2. In `lib/grok.ts`, replace the `generateSpeech` function with:

```typescript
export async function generateSpeech(text: string, voice: string = 'onyx'): Promise<Buffer> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');

  const response = await axios.post(
    'https://api.openai.com/v1/audio/speech',
    { model: 'tts-1', input: text, voice: voice },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      responseType: 'arraybuffer',
    }
  );

  return Buffer.from(response.data);
}
```

3. In `app/api/generate/route.ts`:
```typescript
const audioBuffer = await generateSpeech(videoScript.script, 'onyx');
```

## 📚 Resources

- [ElevenLabs Documentation](https://elevenlabs.io/docs)
- [Voice Library](https://elevenlabs.io/voice-library)
- [Voice Settings Guide](https://elevenlabs.io/docs/speech-synthesis/voice-settings)
- [API Reference](https://elevenlabs.io/docs/api-reference)

## ✨ Benefits

✅ Much more natural-sounding voices  
✅ Emotional expression and tone control  
✅ Access to "annoying" voices perfect for ragebait  
✅ 10,000 free characters per month  
✅ Better engagement and retention  
✅ Professional voice quality  

---

**Next Steps**: Get your ElevenLabs API key and start generating better-sounding ragebait! 🔥

