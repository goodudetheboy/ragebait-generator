# 🎤 Voice Selection Feature

## ✅ Feature Added!

Voice selection is now available directly in the UI! Users can choose from multiple voices when generating ragebait videos.

## 🎯 What Was Added

### Frontend (`app/page.tsx`)
✅ Added `selectedVoice` state (default: 'elli')  
✅ Added voice selector dropdown in the form  
✅ Organized voices into two groups:
  - **🔥 Ragebait Voices** (Elli, Charlotte, Adam)
  - **💼 Professional Voices** (Rachel, Bella, Antoni, Josh, Dorothy)  
✅ Added helpful tip text below selector  
✅ Passes selected voice to API  

### Backend (`app/api/generate/route.ts`)
✅ Accepts `voice` parameter from request  
✅ Validates and defaults to 'elli' if not provided  
✅ Maps voice name to ElevenLabs voice ID  
✅ Supports custom voice IDs from ElevenLabs Voice Library  
✅ Logs selected voice for debugging  

### Documentation Updates
✅ Updated `README.md` - Usage section  
✅ Updated `SETUP.md` - Testing instructions  
✅ Updated `VOICE_OPTIONS.md` - How to change voice  

## 🎨 UI Design

The voice selector uses the same bold, uppercase styling as the rest of the app:

```
🎤 VOICE:
┌─────────────────────────────────────────┐
│ ELLI - Emotional Female ⭐ (Default)    │
│                                         │
│ 🔥 RAGEBAIT VOICES                      │
│   ELLI - Emotional Female ⭐            │
│   CHARLOTTE - Seductive Female          │
│   ADAM - Deep Male Authority            │
│                                         │
│ 💼 PROFESSIONAL VOICES                  │
│   RACHEL - Young Female Natural         │
│   BELLA - Soft Female ASMR              │
│   ANTONI - Well-rounded Male            │
│   JOSH - Deep Male Narrator             │
│   DOROTHY - British Female              │
└─────────────────────────────────────────┘
💡 TIP: ELLI & CHARLOTTE ARE BEST FOR RAGEBAIT
```

## 📋 Available Voices

### 🔥 Ragebait Voices (Top of List)

| Voice | Description | Why It's Good |
|-------|-------------|---------------|
| **Elli** ⭐ | Emotional female | Most expressive, engaging |
| **Charlotte** | Seductive female | Attention-grabbing, unique |
| **Adam** | Deep male | Authoritative, serious |

### 💼 Professional Voices

| Voice | Description | Use Case |
|-------|-------------|----------|
| Rachel | Young female, natural | General content |
| Bella | Soft female, ASMR-like | Calming content |
| Antoni | Well-rounded male | Narration |
| Josh | Deep male, narrator | Documentary style |
| Dorothy | British female | Sophisticated content |

## 🔧 How It Works

1. **User selects voice** from dropdown (defaults to Elli)
2. **Frontend sends** voice name to `/api/generate` endpoint
3. **Backend receives** voice parameter
4. **Backend maps** voice name to ElevenLabs voice ID using `ELEVENLABS_VOICES` constant
5. **Backend generates** speech with selected voice
6. **Video created** with the chosen voice

## 💡 Adding Custom Voices

### Option 1: Add to Dropdown

Edit `app/page.tsx`, find the `<select>` element:

```typescript
<optgroup label="🔥 RAGEBAIT VOICES">
  <option value="elli">ELLI - Emotional Female ⭐ (Default)</option>
  <option value="charlotte">CHARLOTTE - Seductive Female</option>
  <option value="adam">ADAM - Deep Male Authority</option>
  <option value="new_voice_id">YOUR CUSTOM VOICE</option> {/* Add here */}
</optgroup>
```

### Option 2: Add to Backend Constants

Edit `lib/grok.ts`, add to `ELEVENLABS_VOICES`:

```typescript
export const ELEVENLABS_VOICES = {
  // ... existing voices ...
  'new_voice': 'voice_id_from_elevenlabs',
} as const;
```

### Option 3: Use Voice ID Directly

Users can also pass custom voice IDs directly. The backend will use it if it's not in the `ELEVENLABS_VOICES` constant:

```typescript
// In route.ts, this line handles custom IDs:
const voiceId = ELEVENLABS_VOICES[selectedVoice as keyof typeof ELEVENLABS_VOICES] || selectedVoice;
```

## 🎯 Default Voice

**Default: Elli** - Emotional female voice, perfect for ragebait content.

Selected because:
- ✅ Most expressive and emotional
- ✅ Engaging delivery
- ✅ Works great for controversial content
- ✅ High energy and attention-grabbing

## 🧪 Testing

1. Open the app
2. Enter password
3. Type a prompt
4. Try different voices from the dropdown
5. Generate videos and compare voice quality

### Recommended Tests

1. **Elli vs Charlotte** - Compare female ragebait voices
2. **Adam** - Test authoritative male voice
3. **Rachel** - Test natural female voice
4. **Josh** - Test narrator voice

## 📊 User Experience

### Before
❌ Voice was hardcoded to 'elli'  
❌ Had to edit code to change voices  
❌ No visibility into available options  

### After
✅ Voice selector in UI  
✅ 8 voices available without code changes  
✅ Organized by use case  
✅ Clear descriptions and recommendations  
✅ Tip text helps users choose  

## 🔒 Validation

The backend validates the voice parameter:
- ✅ Optional parameter (defaults to 'elli')
- ✅ Maps known voice names to IDs
- ✅ Supports custom voice IDs
- ✅ Logs selected voice for debugging

## 🚀 Future Enhancements

Possible improvements:
- [ ] Add voice preview/sample audio
- [ ] Save user's preferred voice in localStorage
- [ ] Show voice characteristics (pitch, speed, emotion)
- [ ] Add "Random Voice" option
- [ ] Category filters (male/female, serious/fun)
- [ ] Search voices by name

## ✨ Benefits

✅ **Better UX** - No code changes needed to try voices  
✅ **Experimentation** - Easy to test different voices  
✅ **Flexibility** - Supports both preset and custom voices  
✅ **Discoverability** - Users can see all options  
✅ **Personalization** - Each user can choose their favorite  

## 📝 Code Summary

### Frontend State
```typescript
const [selectedVoice, setSelectedVoice] = useState('elli');
```

### Frontend UI
```typescript
<select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)}>
  <option value="elli">ELLI - Emotional Female ⭐</option>
  {/* ... more options ... */}
</select>
```

### API Call
```typescript
body: JSON.stringify({ password, prompt, voice: selectedVoice })
```

### Backend Processing
```typescript
const { password, prompt, voice } = await req.json();
const selectedVoice = voice || 'elli';
const voiceId = ELEVENLABS_VOICES[selectedVoice] || selectedVoice;
const audioBuffer = await generateSpeech(script, voiceId);
```

---

**Status**: ✅ **COMPLETE AND READY TO USE!**

Users can now select from 8 different voices directly in the UI when generating ragebait videos! 🎉

