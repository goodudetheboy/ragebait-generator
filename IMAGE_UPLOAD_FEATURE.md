# 📸 Image Upload Feature

## What It Does

Upload your own images and let AI generate ragebait content about them! Works three ways:

### 1. 🖼️ Images Only
Upload 1-3 images → AI analyzes them → Generates ragebait script → Creates video

**Example**: Upload a photo of avocado toast
- AI sees the image
- Generates: "This $15 piece of bread is why you can't afford a house"
- Uses YOUR image in the video

### 2. 📝 Prompt Only
Type prompt → AI searches Pexels → Finds stock images → Creates video

**Example**: "Why pineapple belongs on pizza"
- AI searches Pexels for pizza images
- Generates ragebait script
- Uses stock images

### 3. 🔥 Images + Prompt (BEST)
Upload images + Add custom prompt → AI uses your images with your script → Creates video

**Example**: Upload gym selfie + "Excuses are for losers"
- AI uses YOUR gym photo
- Follows your ragebait angle
- Custom content with your branding

## 🎯 How It Works

### Frontend (app/page.tsx)
```typescript
// Upload images
const handleImageUpload = (files) => {
  // Validates images (max 5MB, max 3 images)
  // Converts to base64
  // Creates preview thumbnails
  // Stores in state
}

// Send to backend
fetch('/api/generate', {
  body: JSON.stringify({
    prompt: "optional custom prompt",
    images: ["base64_1", "base64_2", "base64_3"],
    voice: "elli"
  })
})
```

### Backend (lib/grok.ts)
```typescript
// Grok Vision analyzes images
generateScript(prompt, images) => {
  if (images) {
    // Use grok-2-vision-1212 model
    // Send images as base64
    // AI describes what it sees
    // Generates ragebait about it
  } else {
    // Standard text generation
  }
}
```

### API Route (app/api/generate/route.ts)
```typescript
if (hasImages) {
  // Use uploaded images in video
  imageUrls = images.map(b64 => `data:image/jpeg;base64,${b64}`)
} else {
  // Search Pexels for images
  imageUrls = await searchPexelsImages(keywords)
}
```

## 📋 Technical Details

### Image Validation
- **File Types**: JPG, PNG, GIF, WEBP
- **Max Size**: 5MB per image
- **Max Count**: 3 images (one per scene)
- **Format**: Converted to base64 for API transmission

### Grok Vision Integration
- **Model**: `grok-2-vision-1212` (supports image analysis)
- **Input**: Base64-encoded images + optional text prompt
- **Output**: Ragebait script based on image content
- **Fallback**: If vision fails, uses text-only mode

### Image Processing
- **Uploaded images**: Used as data URLs (`data:image/jpeg;base64,...`)
- **Pexels images**: Downloaded from URLs
- **FFmpeg**: Resizes all to 9:16 format (1080x1920)
- **Captions**: Added with drawtext filter

## 🎬 Use Cases

### 1. Screenshot Ragebait
Upload: Twitter/Instagram screenshot
Result: "THIS is what's wrong with society"

### 2. Meme Commentary
Upload: Popular meme
Result: AI roasts the meme

### 3. Product Criticism
Upload: Expensive product photo
Result: "You paid HOW MUCH for this?"

### 4. Personal Branding
Upload: Your face/logo
Result: Custom ragebait with your branding

### 5. Current Events
Upload: News screenshot
Result: Hot take about the news

### 6. Before/After
Upload: 2-3 images showing progression
Result: Motivational or critical commentary

## 🎨 UI Design

```
┌─────────────────────────────────────────┐
│ YOUR PROMPT:                            │
│ ┌─────────────────────────────────────┐ │
│ │ Why your phone battery dies at 20%  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 📸 UPLOAD IMAGES (OPTIONAL):            │
│ ┌─────────────────────────────────────┐ │
│ │  📁 CLICK TO UPLOAD (MAX 3)         │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Preview thumbnails with ✕ to remove]  │
│                                         │
│ 💡 TIP: IMAGES ONLY = AI GENERATES     │
│    RAGEBAIT ABOUT THEM                  │
│    IMAGES + PROMPT = CUSTOM SCRIPT      │
│    WITH YOUR IMAGES                     │
└─────────────────────────────────────────┘
```

### Preview Thumbnails
```
┌───────┐ ┌───────┐ ┌───────┐
│ IMG 1 │ │ IMG 2 │ │ IMG 3 │
│   ✕   │ │   ✕   │ │   ✕   │
└───────┘ └───────┘ └───────┘
```

## 💡 Smart Behavior

### Image Count Matching
- **1 image** → 1 scene (20 seconds)
- **2 images** → 2 scenes (10s + 10s)
- **3 images** → 3 scenes (7s + 7s + 6s)

### Prompt Handling
- **No prompt**: AI generates ragebait about images
- **With prompt**: AI follows your script using your images
- **No images**: Uses Pexels search (original behavior)

### Error Handling
- **File too large**: "IMAGES MUST BE UNDER 5MB"
- **Wrong file type**: "ONLY IMAGE FILES ALLOWED"
- **No content**: "PROMPT OR IMAGES REQUIRED"

## 🔥 Example Workflows

### Workflow 1: Meme Roast
1. Find controversial meme
2. Screenshot it
3. Upload to ragebait generator
4. Select "CONDESCENDING & SEDUCTIVE" voice
5. Generate
6. Result: AI roasts the meme in sultry voice

### Workflow 2: Product Review Rage
1. Take photo of overpriced item
2. Upload 1-3 photos (different angles)
3. Add prompt: "This costs $500"
4. Select "UNHINGED & EMOTIONAL" voice
5. Generate
6. Result: Dramatic rant about price using YOUR photos

### Workflow 3: Screenshot Series
1. Screenshot 3 dumb tweets
2. Upload all 3
3. No prompt (let AI generate)
4. Select "SMUG KNOW-IT-ALL" voice
5. Generate
6. Result: AI explains why each tweet is wrong

### Workflow 4: Gym Bro Content
1. Upload gym selfie
2. Add prompt: "You're not trying hard enough"
3. Select "ALPHA MALE ENERGY" voice
4. Generate
5. Result: Motivational rage with your face

## 🚀 Benefits

### For Users
✅ **Custom content** - Use your own images
✅ **Faster creation** - No need to find images
✅ **Brand consistency** - Use your photos/screenshots
✅ **More relevant** - Images match your exact content
✅ **AI analysis** - Grok Vision understands context

### For Content Creators
✅ **Personal branding** - Your face/logo in videos
✅ **Repurpose content** - Turn screenshots into videos
✅ **React content** - Respond to trending images
✅ **Tutorial content** - Show before/after examples
✅ **Community content** - Use fan submissions

## 📊 Comparison

| Method | Images From | Script From | Best For |
|--------|-------------|-------------|----------|
| **Prompt Only** | Pexels | AI | Quick generic ragebait |
| **Images Only** | Upload | AI analyzes | React to images, memes |
| **Both** | Upload | Custom + AI | Branded content, tutorials |

## 🎯 Pro Tips

1. **Use high-quality images** - Clear, well-lit photos work best
2. **Match voice to content** - Gym content? Use ALPHA MALE ENERGY
3. **Test different prompts** - Upload once, try multiple scripts
4. **Screenshot optimization** - Crop tight, remove clutter
5. **Series content** - Use 3 related images for story arc
6. **Branding** - Include logo/watermark before upload
7. **Controversy** - More controversial images = more engagement

## 🔧 Technical Implementation

### Code Changes

**app/page.tsx**:
- Added `uploadedImages` state
- Added `imagePreviewUrls` state
- Added `handleImageUpload` function
- Added `removeImage` function
- Added file input + preview UI
- Sends images to backend

**lib/grok.ts**:
- Updated `generateScript()` to accept images
- Uses `grok-2-vision-1212` for image analysis
- Builds multimodal messages with text + images
- Adjusts scene count based on image count

**app/api/generate/route.ts**:
- Accepts `images` array from request
- Validates either prompt OR images required
- Uses uploaded images instead of Pexels search
- Converts base64 to data URLs for video processing

## 🐛 Known Limitations

1. **Max 3 images** - Video format limited to 20 seconds
2. **5MB per image** - API payload size constraints
3. **Base64 transmission** - Large images increase request size
4. **No video upload** - Images only (no animated content)
5. **Grok Vision required** - Needs Grok 2 Vision model access

## 🎉 Result

Users can now:
- 📸 Upload their own images
- 🤖 Let AI analyze and create ragebait
- 🎬 Generate custom branded content
- 🔥 Create react content from screenshots
- ⚡ Skip Pexels search entirely

**Perfect for creating truly unique ragebait content!** 🔥

