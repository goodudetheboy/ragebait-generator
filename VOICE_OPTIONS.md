# 🎤 ElevenLabs Voice Options

This document explains the available voices and how to customize them for your Ragebait Generator.

## 📋 Available Voice Personalities

### 😤 MAXIMUM RAGE (Top Tier Ragebait)

| Personality | Voice ID | Description | Why It Works |
|-------------|----------|-------------|--------------|
| **UNHINGED & EMOTIONAL** ⭐ | `elli` | Expressive, dramatic, high energy | Most engaging, emotional range |
| **CONDESCENDING & SEDUCTIVE** | `charlotte` | Sultry but judgy | Attention-grabbing, irritating |
| **ALPHA MALE ENERGY** | `adam` | Deep, authoritative, aggressive | Mansplaining vibes |

### 🤬 ANNOYING AF (High Irritation Factor)

| Personality | Voice ID | Description | Why It's Annoying |
|-------------|----------|-------------|-------------------|
| **VALLEY GIRL ENERGY** | `rachel` | Young, upbeat, vocal fry | Stereotypically annoying |
| **ASMR WHISPER CREEP** | `bella` | Soft, breathy, unsettling | Uncomfortably intimate |
| **SMUG KNOW-IT-ALL** | `antoni` | Well-spoken, condescending | Punchable voice energy |

### 😏 PASSIVE AGGRESSIVE (Subtle Irritation)

| Personality | Voice ID | Description | Why It's Annoying |
|-------------|----------|-------------|-------------------|
| **DEEP VOICE MANSPLAINER** | `josh` | Deep narrator, patronizing | Explains obvious things |
| **BRITISH KAREN** | `dorothy` | British, entitled | Complains about everything |

## 🔥 Best Voice Personalities for Ragebait

### 1. **UNHINGED & EMOTIONAL** (Default) ⭐
- Maximum emotional range
- Dramatic, over-the-top delivery
- Perfect for controversial hot takes
- Most engagement potential

### 2. **CONDESCENDING & SEDUCTIVE**
- Sultry but judgmental combo
- Makes people simultaneously attracted and annoyed
- Great for "educating" the audience
- High irritation factor

### 3. **ALPHA MALE ENERGY**
- Deep, aggressive masculinity
- Perfect for toxic positivity / hustle culture takes
- Mansplaining energy
- Bros will love it, everyone else will hate it

## 🎭 Using Custom ElevenLabs Voices

### From Voice Library (Annoying/Unique Voices)

1. Visit https://elevenlabs.io/voice-library
2. Search for "annoying", "irritating", or browse categories
3. Find voices like:
   - "The Insufferable Know-It-All"
   - "The Hyperactive Valley Girl"
   - "Obnoxious Bro"
4. Click on a voice and copy its Voice ID
5. Use it in your code:

```typescript
const audioBuffer = await generateSpeech(
  videoScript.script, 
  'Voice_ID_Here'
);
```

### Create Your Own Voice

1. Go to https://elevenlabs.io/voice-lab
2. Use Voice Design to generate custom voices
3. Or clone a voice from audio samples
4. Copy the Voice ID and use it

## 🎛️ Voice Settings (Advanced)

The current configuration in `lib/grok.ts`:

```typescript
voice_settings: {
  stability: 0.5,           // Lower = more expressive/variable
  similarity_boost: 0.75,   // Higher = more like original voice
  style: 0.5,               // 0-1, higher = more exaggerated
  use_speaker_boost: true   // Enhances clarity
}
```

### For MORE Annoying/Irritating:
```typescript
voice_settings: {
  stability: 0.3,           // Very expressive
  similarity_boost: 0.5,    // Less natural
  style: 0.8,               // Very exaggerated
  use_speaker_boost: true
}
```

### For Natural/Calm:
```typescript
voice_settings: {
  stability: 0.75,          // More consistent
  similarity_boost: 0.85,   // Very natural
  style: 0.2,               // Subtle
  use_speaker_boost: true
}
```

## 💰 Pricing & Limits

### Free Tier
- **10,000 characters/month**
- ~200 videos (50 chars per script)
- Resets monthly

### Creator Tier ($5/month)
- **30,000 characters/month**
- Access to more voices
- Commercial license

### Pro Tier ($22/month)
- **100,000 characters/month**
- Voice cloning
- Professional voices

## 🔄 How to Change Voice

### ✅ Voice Selection is Now in the UI!

Simply select your desired voice from the dropdown when generating a video. No code changes needed!

**Available in the UI:**
- **Ragebait Voices** (Top section):
  - Elli - Emotional Female ⭐ (Default)
  - Charlotte - Seductive Female
  - Adam - Deep Male Authority

- **Professional Voices**:
  - Rachel - Young Female Natural
  - Bella - Soft Female ASMR
  - Antoni - Well-rounded Male
  - Josh - Deep Male Narrator
  - Dorothy - British Female

### Add More Voices to the Dropdown

Edit `app/page.tsx` and add to the select options:

```typescript
<option value="your_voice_id">YOUR VOICE NAME</option>
```

You can use:
1. Any voice ID from the `ELEVENLABS_VOICES` constant
2. Any custom voice ID from ElevenLabs Voice Library

## 🧪 Testing Different Voice Personalities

Try these prompts with different personalities:

1. **"Why avocado toast is ruining millennials"**
   - CONDESCENDING & SEDUCTIVE - Maximum smugness
   - VALLEY GIRL ENERGY - Ironically defend it
   - BRITISH KAREN - Complain about everything

2. **"Your phone is spying on you RIGHT NOW"**
   - UNHINGED & EMOTIONAL - Paranoid energy
   - DEEP VOICE MANSPLAINER - Explain "the truth"
   - ASMR WHISPER CREEP - Unsettling conspiracy

3. **"Gen Z is killing the handshake"**
   - ALPHA MALE ENERGY - Angry boomer vibes
   - SMUG KNOW-IT-ALL - Actually, here's why...
   - VALLEY GIRL ENERGY - Like, why would we?

## 📚 Resources

- [ElevenLabs Voice Library](https://elevenlabs.io/voice-library)
- [ElevenLabs Voice Lab](https://elevenlabs.io/voice-lab)
- [ElevenLabs API Docs](https://elevenlabs.io/docs)
- [Voice Settings Guide](https://elevenlabs.io/docs/speech-synthesis/voice-settings)

---

**Pro Tip**: The voice settings are already tuned for MAXIMUM ANNOYANCE with:
- **Stability: 0.35** (unhinged, variable delivery)
- **Style: 0.75** (exaggerated, dramatic)
- **Speaker Boost: ON** (crystal clear irritation)

Perfect for triggering engagement! 🔥

