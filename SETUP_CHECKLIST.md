# ✅ ElevenLabs Setup Checklist

## Quick Setup (5 minutes)

### Step 1: Get ElevenLabs API Key
- [ ] Go to https://elevenlabs.io/
- [ ] Sign up for free account
- [ ] Navigate to Profile → API Keys
- [ ] Click "Create API Key"
- [ ] Copy the key (starts with `sk_`)

### Step 2: Update Environment Variables
- [ ] Open `.env.local` (or create it if it doesn't exist)
- [ ] Add this line:
```bash
ELEVENLABS_API_KEY=sk_your_key_here
```
- [ ] Make sure you also have:
  - `GROK_API_KEY=xai-...`
  - `PEXELS_API_KEY=...`
  - `ADMIN_PASSWORD=...`

### Step 3: Restart Dev Server
- [ ] Stop your dev server (Ctrl+C)
- [ ] Run `npm run dev`
- [ ] Wait for it to start

### Step 4: Test It!
- [ ] Open http://localhost:3000
- [ ] Enter your password
- [ ] Try a prompt like: "Why pineapple belongs on pizza"
- [ ] Generate video
- [ ] Listen to the new voice quality! 🎤

## ✨ What's Different?

### Before (OpenAI TTS)
- ❌ Robotic voice
- ❌ Limited emotion
- ❌ Only 6 voices
- ❌ No free tier

### After (ElevenLabs)
- ✅ Natural, human-like voice
- ✅ Emotional and expressive
- ✅ Hundreds of voices
- ✅ 10,000 free characters/month
- ✅ Can use "annoying" voices for ragebait!

## 🎯 Current Voice

**Default: `elli`** - Emotional female voice, perfect for ragebait

Want to change it? Edit `app/api/generate/route.ts` line 56.

## 📚 Need Help?

- **Voice options**: See `VOICE_OPTIONS.md`
- **Migration details**: See `ELEVENLABS_MIGRATION.md`
- **Full summary**: See `MIGRATION_SUMMARY.md`
- **Setup guide**: See `SETUP.md`

## 🔥 Pro Tips

1. **For maximum ragebait**: Use `elli` or `charlotte` voices
2. **For annoying content**: Visit https://elevenlabs.io/voice-library/annoying
3. **For authority**: Use `adam` or `josh` voices
4. **Free tier is generous**: 10,000 chars = ~200 videos/month

## ⚠️ Common Issues

### "ELEVENLABS_API_KEY is not configured"
→ Make sure you added it to `.env.local` and restarted the server

### "Failed to generate speech"
→ Check your API key is valid at https://elevenlabs.io/app/settings/api-keys

### Voice sounds weird
→ Try a different voice from `ELEVENLABS_VOICES` constant

## 🎉 You're Done!

That's it! Your Ragebait Generator now has professional-quality voices that sound way more natural and engaging.

Start generating some viral content! 🔥

