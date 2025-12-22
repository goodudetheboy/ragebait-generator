# Quick Setup Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Get Your API Keys

#### Grok API Key (xAI)
1. Go to https://x.ai/ or https://console.x.ai/
2. Sign up/login
3. Navigate to API section
4. Generate a new API key
5. Copy the key

#### ElevenLabs API Key
1. Go to https://elevenlabs.io/
2. Sign up for a free account
3. Go to Profile → API Keys (or https://elevenlabs.io/app/settings/api-keys)
4. Click "Create API Key"
5. Copy the key (Free tier: 10,000 characters/month)

#### Pexels API Key
1. Go to https://www.pexels.com/api/
2. Click "Get Started" or "Sign Up"
3. After signup, go to https://www.pexels.com/api/new/
4. Your API key will be shown immediately
5. Copy the key (Free tier: 200 requests/hour)

### Step 3: Create Environment File

Create a file named `.env.local` in the project root:

```bash
GROK_API_KEY=xai-xxxxxxxxxxxxxxxxxxxxx
ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxx
PEXELS_API_KEY=xxxxxxxxxxxxxxxxxxxxx
ADMIN_PASSWORD=your_secure_password_123
```

⚠️ Replace the `x` values with your actual API keys and choose a strong password!

### Step 4: Run the App

```bash
npm run dev
```

Open http://localhost:3000

### Step 5: Test It

1. Enter your `ADMIN_PASSWORD`
2. Try a prompt like: "Why your phone battery dies at 20%"
3. **Select a voice** from the dropdown (Elli is default)
4. Click "Generate Ragebait Video"
5. Wait 2-3 minutes
6. Watch your video!

---

## 🌐 Deploy to Vercel

### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables when prompted, or add them in the Vercel dashboard
```

### Option B: Using Vercel Dashboard

1. Push your code to GitHub
2. Go to https://vercel.com/
3. Click "Import Project"
4. Select your repository
5. Add environment variables:
   - `GROK_API_KEY`
   - `ELEVENLABS_API_KEY`
   - `PEXELS_API_KEY`
   - `ADMIN_PASSWORD`
6. Deploy!

⚠️ **IMPORTANT**: You'll need **Vercel Pro** ($20/mo) for the 5-minute function timeout. Free tier only allows 10 seconds, which isn't enough for video rendering.

---

## 📂 Project Structure

```
ragebait-generator/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts          # Main API endpoint
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Frontend UI
├── lib/
│   ├── grok.ts                   # Grok AI integration
│   ├── pexels.ts                 # Image search
│   └── video.ts                  # Video generation
├── public/
│   ├── videos/                   # Generated videos (gitignored)
│   └── temp/                     # Temp files (gitignored)
├── .env.local                    # Your API keys (gitignored)
├── next.config.ts                # Next.js config
└── vercel.json                   # Vercel deployment config
```

---

## 🔧 Customization

### Change Video Duration

Edit `lib/grok.ts` - line ~22:
```typescript
// Change "20-second" to your desired duration
"create a provocative 15-second video script..."
```

### Change TTS Voice

**Voice selection is now in the UI!** Just use the dropdown when generating.

Available voices in the dropdown:
- **Ragebait**: Elli (default), Charlotte, Adam
- **Professional**: Rachel, Bella, Antoni, Josh, Dorothy

To add more voices, edit the `<select>` element in `app/page.tsx`

### Change Text Style

Edit `lib/video.ts` - line ~42:
```typescript
fontsize=100:           // Make text bigger
fontcolor=yellow:       // Change color
borderw=6:              // Thicker outline
```

---

## ❓ Troubleshooting

### "GROK_API_KEY is not configured"
- Make sure `.env.local` exists in project root
- Restart dev server after creating `.env.local`

### "ELEVENLABS_API_KEY is not configured"
- Make sure you added ELEVENLABS_API_KEY to `.env.local`
- Restart dev server after adding the key

### "Failed to generate speech"
- Check that your ElevenLabs API key is valid
- Verify you haven't exceeded your monthly quota (10,000 chars for free tier)
- Check ElevenLabs dashboard for API usage

### "No image found for scene"
- Try simpler keywords (e.g., "angry person" instead of "furious millennial")
- Consider adding a fallback placeholder image

### Video generation is slow
- Expected! It takes 2-3 minutes for:
  - Grok script generation (5-10s)
  - Image search & download (10-20s)
  - TTS generation (10-15s)
  - Video rendering (60-90s)

### Vercel timeout errors
- Upgrade to Vercel Pro for 5-minute timeouts
- Or move video rendering to Railway/Fly.io

---

## 📝 Next Steps

- [ ] Add placeholder image fallback
- [ ] Add video queue system for multiple requests
- [ ] Add progress bar/websocket updates
- [ ] Support custom fonts
- [ ] Add background music option
- [ ] Export in multiple aspect ratios (16:9, 1:1, 9:16)
- [ ] Add video preview before generation

---

## 📧 Support

If you run into issues, check:
1. `.env.local` has valid API keys
2. You're on Node.js 18+
3. FFmpeg is properly installed
4. Vercel function timeout is set to 300s

Enjoy creating viral ragebait! 🔥

