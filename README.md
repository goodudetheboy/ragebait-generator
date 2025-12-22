# 🔥 Ragebait Video Generator

An AI-powered web app that generates provocative 20-second vertical videos (9:16) from text prompts using Grok AI, Pexels images, and FFmpeg.

## Features

- 🤖 **Grok AI Integration**: Uses Grok LLM for script generation
- 👁️ **Grok Vision**: Analyzes uploaded images to generate ragebait content
- 🎤 **ElevenLabs TTS**: Natural, expressive voices (including annoying options!)
- 📸 **Image Upload**: Upload your own images OR use Pexels search
- 🖼️ **Dynamic Image Search**: Pulls relevant images from Pexels
- 🎥 **Automated Video Creation**: FFmpeg-powered video composition with captions
- 📱 **Phone-Optimized**: 1080x1920 vertical format perfect for TikTok/Reels/Shorts
- 🔒 **Password Protected**: Backend-verified password gate for private use

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Grok (xAI) for LLM
- **TTS**: ElevenLabs API
- **Images**: Pexels API
- **Video**: FFmpeg
- **Hosting**: Vercel

## Setup

### 1. Clone and Install

```bash
git clone <your-repo>
cd ragebait-generator
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Grok API (get from https://x.ai/)
GROK_API_KEY=your_grok_api_key_here

# ElevenLabs API (get from https://elevenlabs.io/)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Pexels API (get from https://www.pexels.com/api/)
PEXELS_API_KEY=your_pexels_api_key_here

# Your password for the app
ADMIN_PASSWORD=your_secure_password_here
```

### 3. Get API Keys

**Grok API:**
- Go to https://x.ai/
- Sign up and generate an API key
- Copy to `GROK_API_KEY`

**ElevenLabs API:**
- Go to https://elevenlabs.io/
- Sign up for a free account (10,000 chars/month free)
- Go to Profile → API Keys
- Generate and copy your API key
- Copy to `ELEVENLABS_API_KEY`

**Pexels API:**
- Go to https://www.pexels.com/api/
- Create a free account
- Generate API key (free tier: 200 requests/hour)
- Copy to `PEXELS_API_KEY`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

1. Enter your password
2. **Choose your content method:**
   - **Text Prompt Only**: Type your ragebait idea (e.g., "Why your phone battery dies at 20%")
   - **Images Only**: Upload 1-3 images and AI will generate ragebait about them
   - **Both**: Upload images AND add a prompt to use your images with custom script
3. **Select a voice personality** from the dropdown (default: UNHINGED & EMOTIONAL)
4. Click "Generate Ragebait Video"
5. Wait 2-3 minutes for AI generation + video rendering
6. Download or share your video!

### Image Upload Tips
- Upload 1-3 images (max 5MB each)
- AI analyzes images using Grok Vision to create ragebait
- Works great for: screenshots, memes, controversial photos
- Combine with prompt for more control

## Deployment to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ragebait-generator)

### Manual Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Settings > Environment Variables
```

⚠️ **Important for Vercel:**
- You'll need a **Vercel Pro plan** ($20/mo) for the 5-minute function timeout
- Free tier has 10s limit, which isn't enough for video rendering
- Alternatively, move video rendering to a separate worker service (Railway, Fly.io)

## Project Structure

```
ragebait-generator/
├── app/
│   ├── api/generate/route.ts    # Main video generation API
│   └── page.tsx                  # Frontend UI
├── lib/
│   ├── grok.ts                   # Grok AI integration
│   ├── pexels.ts                 # Image search
│   └── video.ts                  # FFmpeg video compositor
├── public/
│   ├── videos/                   # Generated videos
│   └── temp/                     # Temporary files
└── .env.local                    # Environment variables
```

## How It Works

1. **Script Generation**: 
   - Text prompt: Grok LLM generates provocative script
   - Image upload: Grok Vision analyzes images and creates ragebait script
   - Both: Combines your prompt with image analysis
2. **Image Acquisition**: 
   - Uses uploaded images if provided
   - Otherwise searches Pexels for relevant images
3. **Image Processing**: Resizes images to 9:16, adds text captions with FFmpeg
4. **TTS Generation**: ElevenLabs generates natural, expressive speech audio
5. **Video Assembly**: FFmpeg combines images + audio into final MP4
6. **Cleanup**: Deletes temporary files

## Customization

### Change TTS Voice

**Voice selection is now built into the UI!** Just select from the dropdown when generating.

Available voice personalities:
- **😤 MAXIMUM RAGE**: Unhinged & Emotional (default), Condescending & Seductive, Alpha Male Energy
- **🤬 ANNOYING AF**: Valley Girl Energy, ASMR Whisper Creep, Smug Know-It-All
- **😏 PASSIVE AGGRESSIVE**: Deep Voice Mansplainer, British Karen

To add custom voices from ElevenLabs Voice Library:
1. Visit https://elevenlabs.io/voice-library/annoying
2. Find an annoying voice and copy its ID
3. Add it to the dropdown in `app/page.tsx` with a personality description

### Adjust Video Duration

Edit `lib/grok.ts` system prompt to change from 20 seconds

### Change Caption Style

Edit `lib/video.ts` text filter settings:

```typescript
fontsize=80:           // Text size
fontcolor=white:       // Text color
borderw=4:             // Outline thickness
bordercolor=black:     // Outline color
```

## Troubleshooting

### "FFmpeg not found"
- Windows: The package `@ffmpeg-installer/ffmpeg` should handle this automatically
- If issues persist, install FFmpeg manually: https://ffmpeg.org/download.html

### "Vercel function timeout"
- Upgrade to Vercel Pro for 5-minute timeouts
- Or use Railway/Fly.io worker for rendering

### "No image found"
- Pexels might not have images for niche keywords
- The system will throw an error; you can add a placeholder image fallback

### "Failed to generate speech"
- Check that your ELEVENLABS_API_KEY is valid
- Verify you haven't exceeded your ElevenLabs monthly quota
- Free tier: 10,000 characters/month

## License

MIT

## Disclaimer

⚠️ **Use responsibly.** This tool generates provocative content. Ensure compliance with platform guidelines and applicable laws. Do not create harmful, defamatory, or illegal content.
