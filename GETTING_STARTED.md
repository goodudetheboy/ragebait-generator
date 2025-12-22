# 🎬 Getting Started - Quick Reference

## What You Built

A complete AI video generator that:
- Takes a text prompt
- Generates a 20-second vertical video (9:16)
- Uses Grok AI for script writing and voiceover
- Pulls images from Pexels
- Composes everything with FFmpeg
- Password-protected for private use

---

## ⚡ Quick Start (Copy-Paste)

### 1. Set Up Environment Variables

Create `.env.local` in your project root (copy-paste this):

```bash
GROK_API_KEY=
PEXELS_API_KEY=
ADMIN_PASSWORD=
```

### 2. Get Your API Keys

**Grok API:**
- Visit: https://console.x.ai/ or https://x.ai/
- Sign up → Get API key
- Paste into `GROK_API_KEY=`

**Pexels API:**
- Visit: https://www.pexels.com/api/
- Sign up → Get API key (instant, free)
- Paste into `PEXELS_API_KEY=`

**Password:**
- Choose a secure password
- Paste into `ADMIN_PASSWORD=`

### 3. Run It

```bash
npm run dev
```

Go to: http://localhost:3000

---

## 🎯 First Test

1. Enter your password
2. Paste this prompt:
   ```
   Why your phone battery dies at 20%
   ```
3. Click "Generate"
4. Wait ~2-3 minutes
5. Watch your first ragebait video!

---

## 📁 File Structure (What Each File Does)

```
ragebait-generator/
│
├── app/
│   ├── api/generate/route.ts    ← Main API that generates videos
│   ├── page.tsx                 ← Frontend UI you see
│   └── layout.tsx               ← Page wrapper & metadata
│
├── lib/
│   ├── grok.ts                  ← Talks to Grok AI
│   ├── pexels.ts                ← Searches for images
│   └── video.ts                 ← FFmpeg video magic
│
├── public/
│   ├── videos/                  ← Your generated videos appear here
│   └── temp/                    ← Temp files (auto-deleted)
│
├── .env.local                   ← Your secret API keys (DO NOT COMMIT)
├── next.config.ts               ← Next.js config
├── vercel.json                  ← Deployment settings
└── package.json                 ← Dependencies
```

---

## 🎨 Customization Cheat Sheet

### Change Video Length
**File:** `lib/grok.ts` (line ~22)
```typescript
// Change "20-second" to whatever you want
"create a provocative 15-second video script..."
```

### Change Voice
**File:** `app/api/generate/route.ts` (line ~65)
```typescript
const audioBuffer = await generateSpeech(videoScript.script, 'leo');
// Options: rex, sal, eve, leo, mika, valentin
```

### Change Text Style
**File:** `lib/video.ts` (line ~40-50)
```typescript
fontsize=80:           // Make bigger/smaller
fontcolor=white:       // Change color
borderw=4:             // Outline thickness
bordercolor=black:     // Outline color
y=h-200                // Position (200px from bottom)
```

### Change Text Font
**File:** `lib/video.ts` (line ~43)
```typescript
fontfile=/Windows/Fonts/impact.ttf:  // Change font
// Try: arial.ttf, comic.ttf, calibri.ttf, etc.
```

---

## 🐛 Common Issues & Fixes

| Problem | Solution |
|---------|----------|
| "GROK_API_KEY is not configured" | Check `.env.local` exists and has the key |
| "Failed to generate speech" | Grok API might be different, check console logs |
| "No image found" | Try simpler keywords or add placeholder image |
| Vercel timeout | Need Vercel Pro ($20/mo) or use Railway/Fly.io |
| Video looks bad | Adjust text settings in `lib/video.ts` |
| Slow generation | Normal! Takes 2-3 minutes per video |

---

## 🔧 How It Works (Under the Hood)

1. **User enters prompt + password**
2. **Backend verifies password** (`app/api/generate/route.ts`)
3. **Grok generates script** with 2-3 scene descriptions
4. **For each scene:**
   - Search Pexels for matching image
   - Download image
5. **Grok Voice generates audio** from script
6. **FFmpeg processes:**
   - Resize images to 9:16
   - Add text captions
   - Combine with audio
   - Export as MP4
7. **Return video URL** to frontend
8. **User downloads** video

---

## 📊 Performance Expectations

| Step | Time |
|------|------|
| Script generation (Grok) | ~5-10s |
| Image search & download | ~10-20s |
| TTS generation (Grok Voice) | ~10-15s |
| Video rendering (FFmpeg) | ~60-90s |
| **Total** | **~2-3 minutes** |

---

## 💰 Cost Breakdown (Rough Estimates)

| Service | Cost per video |
|---------|----------------|
| Grok API (LLM) | ~$0.001 |
| Grok Voice API | ~$0.01-0.02 |
| Pexels API | Free (200/hour) |
| Vercel hosting | Free / $20/mo Pro |
| **Per video** | **~$0.01-0.02** |

100 videos ≈ $1-2 (excluding hosting)

---

## 🚀 Deployment Quick Commands

### Vercel
```bash
npm i -g vercel
vercel
# Add env vars in dashboard
```

### Railway
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

See `DEPLOYMENT.md` for full guide.

---

## 🎯 Next Steps & Ideas

- [ ] Add queue system for multiple users
- [ ] Add progress bar / websocket updates
- [ ] Support custom fonts
- [ ] Add background music
- [ ] Multiple aspect ratios (16:9, 1:1, 4:5)
- [ ] Video preview before generation
- [ ] Save history of generated videos
- [ ] Batch generation (multiple prompts)
- [ ] Custom voice cloning
- [ ] Advanced caption animations

---

## 🆘 Need Help?

1. Check `SETUP.md` for detailed setup
2. Check `DEPLOYMENT.md` for hosting
3. Check `README.md` for full docs
4. Check console logs for errors
5. Check Vercel function logs (if deployed)

---

## 🎉 You're Ready!

Your ragebait generator is ready to go. Start creating viral content! 🔥

**Pro tip:** Start with simple prompts to test, then get creative:
- "Why [everyday thing] is secretly [conspiracy]"
- "The truth about [topic] they don't want you to know"
- "[Group] won't tell you this shocking fact"
- "This [object] hack will change your life"

Have fun! 🎬

