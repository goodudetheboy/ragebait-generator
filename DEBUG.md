# 🐛 Debugging Guide

## If Video Generation Fails

### Step 1: Open Browser Console

**Chrome/Edge:**
- Press `F12` or `Ctrl+Shift+I`
- Click "Console" tab

**Firefox:**
- Press `F12`
- Click "Console" tab

### Step 2: Try Generating Again

Click "GENERATE VIDEO" and watch the console output.

### Step 3: Look for Error Messages

#### Common Errors & Solutions:

---

#### ❌ "SHAREDARRAYBUFFER NOT AVAILABLE"

**Problem:** Your browser doesn't support SharedArrayBuffer or CORS headers aren't set.

**Solutions:**
1. **Use HTTPS** (required for SharedArrayBuffer)
2. **Check headers** - Open Network tab, check response headers for:
   ```
   Cross-Origin-Embedder-Policy: require-corp
   Cross-Origin-Opener-Policy: same-origin
   ```
3. **Try different browser** - Chrome/Edge work best
4. **Disable browser extensions** - Ad blockers can interfere

---

#### ❌ "Failed to fetch" or CORS errors

**Problem:** Images from Pexels are blocked.

**Solutions:**
1. Check if Pexels is accessible in your region
2. Try different prompt (different images)
3. Check browser console for specific CORS error

---

#### ❌ FFmpeg errors like "Invalid data found"

**Problem:** Text escaping or FFmpeg command syntax issue.

**Solutions:**
1. Check console for the actual FFmpeg command
2. Look for problematic characters in captions
3. Try simpler prompt

---

#### ❌ "Generation Failed" (generic)

**Problem:** Could be anywhere in the pipeline.

**Check console for:**
```
FFmpeg: [log messages]
Processing scene X: [caption]
Escaped text: "[text]"
✓ Scene X processed
```

**Find where it stops:**
- If stops at "Processing scene X" → image download issue
- If stops at FFmpeg command → text/command syntax issue
- If stops at "Creating video" → final concat issue
- If stops at "Finalizing" → blob creation issue

---

### Step 4: Common Fixes

#### Fix 1: Clear Browser Cache
```
Chrome: Ctrl+Shift+Delete → Clear cached images and files
```

#### Fix 2: Restart Dev Server
```bash
# Kill server: Ctrl+C
npm run dev
```

#### Fix 3: Hard Refresh Page
```
Chrome: Ctrl+Shift+R
Firefox: Ctrl+F5
```

#### Fix 4: Check Environment Variables
Make sure `.env.local` has:
```
GROK_API_KEY=xxx
OPENAI_API_KEY=xxx
PEXELS_API_KEY=xxx
ADMIN_PASSWORD=xxx
```

#### Fix 5: Test in Incognito/Private Window
```
Chrome: Ctrl+Shift+N
Firefox: Ctrl+Shift+P
```

---

### Step 5: Copy Console Logs

If still failing:
1. Right-click in console
2. "Save as..." or copy all text
3. Share error messages

---

## Testing Checklist

- [ ] SharedArrayBuffer available? Check console: `typeof SharedArrayBuffer`
- [ ] CORS headers present? Check Network tab → Response headers
- [ ] FFmpeg loaded? Should see "✓ FFmpeg loaded successfully"
- [ ] Images downloading? Check Network tab for Pexels requests
- [ ] Audio generated? Check backend logs
- [ ] FFmpeg commands executing? Check console for "FFmpeg:" logs

---

## Development Mode vs Production

### Development (localhost)
- CORS headers from `next.config.ts`
- SharedArrayBuffer should work automatically
- Console logging enabled

### Production (Vercel)
- Same headers applied
- May need to wait for deployment
- Check Vercel function logs for backend errors

---

## Still Stuck?

**Post in GitHub Issues with:**
1. Browser + version (e.g., Chrome 120)
2. Full console log
3. Prompt you used
4. Where it fails (which progress message)

---

## Quick Test

Open browser console and run:
```javascript
// Test 1: SharedArrayBuffer
console.log('SharedArrayBuffer:', typeof SharedArrayBuffer);

// Test 2: Fetch Pexels
fetch('https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1080')
  .then(r => console.log('Pexels fetch:', r.ok))
  .catch(e => console.error('Pexels error:', e));

// Test 3: FFmpeg CDN
fetch('https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm')
  .then(r => console.log('FFmpeg CDN:', r.ok))
  .catch(e => console.error('CDN error:', e));
```

All three should log `true` or success. If any fail, that's your issue!

