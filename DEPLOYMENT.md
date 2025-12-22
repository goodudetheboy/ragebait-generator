# 🚀 Deployment Guide

## Vercel Deployment (Recommended)

### Prerequisites
- Vercel account (free or pro)
- GitHub repository
- API keys ready

### Steps

#### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/ragebait-generator.git
git push -u origin main
```

#### 2. Import to Vercel
1. Go to https://vercel.com/
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - Framework: Next.js (auto-detected)
   - Build command: `npm run build`
   - Output directory: `.next` (auto-detected)

#### 3. Add Environment Variables
In Vercel dashboard:
- Go to Settings → Environment Variables
- Add:
  ```
  GROK_API_KEY=xai-xxxxxxxxxxxxx
  PEXELS_API_KEY=xxxxxxxxxxxxx
  ADMIN_PASSWORD=your_password
  ```
- Apply to: Production, Preview, Development

#### 4. Deploy
- Click "Deploy"
- Wait for build to complete
- Your app is live at `https://your-project.vercel.app`

### Important Vercel Settings

#### Function Timeout (CRITICAL)
- Free tier: 10s (not enough!)
- **Hobby/Pro tier: 300s (required)**
- Video generation takes 2-3 minutes

To enable longer timeout:
1. Upgrade to Vercel Pro ($20/mo)
2. `vercel.json` already configured for 300s
3. Or use external worker (see Alternative Deployment below)

#### Memory & Region
- Default 1GB memory is sufficient
- Choose region closest to users
- Edge runtime not supported (needs FFmpeg)

### Custom Domain (Optional)
1. Go to Settings → Domains
2. Add your domain
3. Update DNS records as instructed

---

## Alternative: Railway Deployment

If you don't want Vercel Pro, deploy to Railway (better for long-running processes):

### Steps

1. **Install Railway CLI**
```bash
npm i -g @railway/cli
```

2. **Login**
```bash
railway login
```

3. **Initialize Project**
```bash
railway init
```

4. **Add Environment Variables**
```bash
railway variables set GROK_API_KEY=xxx
railway variables set PEXELS_API_KEY=xxx
railway variables set ADMIN_PASSWORD=xxx
```

5. **Deploy**
```bash
railway up
```

### Railway Pricing
- $5/mo credit for Hobby plan
- ~$0.02/hour for running service
- No timeout limits!

---

## Alternative: Fly.io Deployment

### Steps

1. **Install Fly CLI**
```bash
curl -L https://fly.io/install.sh | sh
```

2. **Login**
```bash
fly auth login
```

3. **Create Dockerfile** (in project root)
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install FFmpeg
RUN apk add --no-cache ffmpeg

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

4. **Initialize App**
```bash
fly launch
```

5. **Set Environment Variables**
```bash
fly secrets set GROK_API_KEY=xxx
fly secrets set PEXELS_API_KEY=xxx
fly secrets set ADMIN_PASSWORD=xxx
```

6. **Deploy**
```bash
fly deploy
```

### Fly.io Pricing
- Free tier available
- No timeout limits
- ~$5-10/mo for small app

---

## Environment-Specific Configs

### Production
```env
GROK_API_KEY=xai-prod-xxx
PEXELS_API_KEY=prod-xxx
ADMIN_PASSWORD=strong-prod-password-xxx
NODE_ENV=production
```

### Staging
```env
GROK_API_KEY=xai-staging-xxx
PEXELS_API_KEY=staging-xxx
ADMIN_PASSWORD=staging-password
NODE_ENV=staging
```

---

## Post-Deployment Checklist

- [ ] Environment variables set correctly
- [ ] Test video generation with sample prompt
- [ ] Check `/api/generate` endpoint responds
- [ ] Verify videos accessible at `/videos/*`
- [ ] Test password protection
- [ ] Monitor function execution time
- [ ] Set up error logging (Sentry, LogRocket, etc.)
- [ ] Add analytics (Vercel Analytics, Plausible)
- [ ] Configure rate limiting (if public)
- [ ] Set up backups for generated videos (if needed)

---

## Monitoring & Maintenance

### Vercel Dashboard
- Functions → Check execution time and errors
- Logs → Real-time function logs
- Analytics → Traffic metrics

### Cleanup Strategy
The app auto-cleans files older than 1 hour in:
- `public/temp/` - Temporary processing files
- `public/videos/` - Generated videos

For long-term storage:
- Add S3/R2 upload after generation
- Delete from Vercel after upload
- Serve from CDN

### Cost Optimization
- Cache Pexels results (avoid repeat searches)
- Cache Grok scripts (dedupe similar prompts)
- Add queue system for multiple users
- Compress videos further if needed

---

## Troubleshooting

### Build Fails
- Check Node version (18+)
- Verify all dependencies in package.json
- Check TypeScript errors: `npm run build`

### Function Timeout
- Upgrade to Vercel Pro
- Or migrate to Railway/Fly.io
- Or split into queue + worker architecture

### Videos Not Generating
- Check API keys in environment variables
- Check function logs in Vercel dashboard
- Verify FFmpeg working: `ffmpeg -version`

### High Costs
- Set up rate limiting
- Add caching layer
- Implement queue with max concurrent jobs

---

## Security Best Practices

1. **Never commit `.env.local`** (already in .gitignore)
2. **Use strong ADMIN_PASSWORD**
3. **Add rate limiting** for production
4. **Implement request logging**
5. **Monitor for abuse**
6. **Add CORS if needed**
7. **Set up CSP headers**

Example rate limiting (add to middleware.ts):
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 h"),
});
```

---

## Need Help?

- Next.js docs: https://nextjs.org/docs
- Vercel docs: https://vercel.com/docs
- Railway docs: https://docs.railway.app/
- FFmpeg docs: https://ffmpeg.org/documentation.html

Good luck! 🚀

