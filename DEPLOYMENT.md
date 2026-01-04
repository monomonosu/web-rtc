# Deployment Guide

This application uses a split deployment architecture:
- **Socket.IO Server**: Deployed on Koyeb (recommended) or Render
- **Next.js Frontend**: Deployed on Vercel

## Prerequisites

- GitHub account
- Koyeb account (https://koyeb.com) - **No credit card required** ✅
- Vercel account (https://vercel.com)

---

## Option A: Deploy with Koyeb (Recommended - No Credit Card)

Koyeb offers native WebSocket support without requiring a credit card for the free tier.

### Step 1: Deploy Socket.IO Server to Koyeb

1. Go to [Koyeb Dashboard](https://app.koyeb.com)
2. Click "Create App"
3. Choose **"GitHub"** as deployment method
4. Connect your GitHub account (if not already connected)
5. Select your repository: `web-rtc`
6. Configure the service:
   - **Name**: `webrtc-signaling-server` (or your preferred name)
   - **Branch**: `main`
   - **Builder**: `Buildpack`
   - **Build command**: `npm run build:server`
   - **Run command**: `npm run start:server`
   - **Port**: `10000`
7. Add Environment Variables (click "Advanced"):
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `ALLOWED_ORIGINS` = `https://*.vercel.app` (we'll update this after Vercel deployment)
8. Choose **Region** closest to your users
9. Click **"Deploy"**
10. Wait for deployment to complete (usually 2-3 minutes)
11. **Copy the service URL** from the dashboard (e.g., `https://webrtc-signaling-server-yourname.koyeb.app`)

### Step 2: Deploy Next.js Frontend to Vercel

#### Using Vercel Dashboard (Easier)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - Leave build settings as default
5. Add Environment Variables:
   - **Key**: `NEXT_PUBLIC_SOCKET_URL`
   - **Value**: Your Koyeb service URL (e.g., `https://webrtc-signaling-server-yourname.koyeb.app`)
6. Click **"Deploy"**
7. Wait for deployment to complete
8. **Copy your Vercel URL** (e.g., `https://web-rtc-yourname.vercel.app`)

#### Using Vercel CLI (Alternative)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Follow the prompts and configure as needed

4. Add environment variable:
   ```bash
   vercel env add NEXT_PUBLIC_SOCKET_URL production
   ```
   - Enter the Koyeb service URL

5. Deploy to production:
   ```bash
   vercel --prod
   ```

### Step 3: Update CORS Settings on Koyeb

After deploying to Vercel, update the `ALLOWED_ORIGINS` environment variable on Koyeb:

1. Go to your Koyeb app dashboard
2. Click on your service → **"Settings"** → **"Environment variables"**
3. Update `ALLOWED_ORIGINS` to include your Vercel URL:
   ```
   https://web-rtc-yourname.vercel.app,https://*.vercel.app
   ```
4. Click **"Update"** (this will trigger a redeploy)

### Step 4: Test the Deployment

1. Visit your Vercel app URL
2. Create a room or join an existing room
3. Share the room URL with another user (or open in another browser/device)
4. Verify that video chat works correctly

---

## Option B: Deploy with Render (Credit Card Required)

**Note**: As of 2025, Render requires a credit card even for the free tier. If you don't want to provide credit card information, use Koyeb (Option A) instead.

### Step 1: Deploy Socket.IO Server to Render

#### Using render.yaml (Easier)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml` and create the service
5. Click **"Apply"** to deploy
6. **Copy the service URL** after deployment

#### Manual Setup

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `webrtc-signaling-server`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build:server`
   - **Start Command**: `npm run start:server`
5. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `ALLOWED_ORIGINS` = `https://*.vercel.app`
6. Click **"Create Web Service"**
7. **Copy the service URL** after deployment

### Step 2-4: Same as Koyeb

Follow Steps 2-4 from Option A, but use your Render service URL instead of Koyeb.

---

## Troubleshooting

### Socket Connection Issues

- **Check CORS settings**: Ensure `ALLOWED_ORIGINS` includes your Vercel URL
- **Check environment variable**: Verify `NEXT_PUBLIC_SOCKET_URL` is set correctly in Vercel
- **Check browser console**: Look for connection errors or CORS errors
- **Verify service is running**: Check that your Socket.IO server is active on Koyeb/Render

### Video/Audio Not Working

- **HTTPS required**: WebRTC requires HTTPS (both Koyeb/Render and Vercel provide this automatically)
- **Browser permissions**: Ensure camera/microphone permissions are granted
- **Check firewall**: Some corporate networks block WebRTC traffic
- **Try different browsers**: Test with Chrome, Firefox, or Edge

### Koyeb-Specific Issues

- **Build fails**: Check that Node.js version in `package.json` engines is compatible
- **Port issues**: Ensure PORT environment variable is set to `10000`
- **First deploy slow**: First deployment may take 3-5 minutes

### Render Free Tier Limitations

- **Services spin down** after 15 minutes of inactivity
- **First connection** after spin-down takes ~30 seconds to wake up
- **Consider upgrading** to paid tier for production use

---

## Local Development

For local development, you can run both services locally:

### Option 1: Development Server (Easiest)

```bash
npm run dev
```

This runs both Next.js and Socket.IO on `http://localhost:3000`.

### Option 2: Test Production Setup Locally

1. Build and start Socket.IO server standalone:
   ```bash
   npm run build:server
   PORT=10000 npm run start:server
   ```

2. In another terminal, start Next.js:
   ```bash
   NEXT_PUBLIC_SOCKET_URL=http://localhost:10000 npm run dev
   ```

---

## Environment Variables Reference

### Koyeb/Render (Socket.IO Server)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Node environment | `production` |
| `PORT` | Server port | `10000` |
| `ALLOWED_ORIGINS` | Allowed CORS origins (comma-separated, supports wildcards) | `https://your-app.vercel.app,https://*.vercel.app` |

### Vercel (Next.js Frontend)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO server URL | `https://webrtc-signaling-server-yourname.koyeb.app` |

---

## Updating the Application

Both services are configured for **automatic deployment**:

1. Push changes to your GitHub repository
2. Koyeb/Render and Vercel will automatically deploy the changes
3. No manual intervention required

---

## Cost Considerations

### Koyeb Free Tier (Recommended)
- ✅ **No credit card required**
- 512 MB RAM
- 2 GB bandwidth/month
- Native WebSocket support
- Service doesn't spin down (always running)
- Perfect for hobby projects and testing

### Render Free Tier
- ⚠️ **Credit card required** (as of 2025)
- 750 hours/month (enough for one service)
- Services spin down after 15 minutes of inactivity
- $1 verification charge (refunded)

### Vercel Hobby Plan
- ✅ **Free** for personal projects
- 100 GB bandwidth/month
- Automatic HTTPS
- Global CDN

---

## Next Steps

After successful deployment:

1. **Test thoroughly** with multiple users
2. **Monitor usage** on both platforms to ensure you stay within free tier limits
3. **Set up custom domain** (optional) on both Vercel and Koyeb
4. **Enable analytics** in Vercel dashboard to track usage
5. **Consider upgrading** if you need more resources for production use

## Resources

- [Koyeb Socket.IO Tutorial](https://www.koyeb.com/tutorials/using-websockets-with-socketio-and-nodejs-on-koyeb)
- [Koyeb Node.js Documentation](https://www.koyeb.com/docs/build-and-deploy/build-from-git/nodejs)
- [Vercel Documentation](https://vercel.com/docs)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
