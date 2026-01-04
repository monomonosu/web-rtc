# Deployment Guide

This application uses a split deployment architecture:
- **Socket.IO Server**: Deployed on Render
- **Next.js Frontend**: Deployed on Vercel

## Prerequisites

- GitHub account
- Render account (https://render.com)
- Vercel account (https://vercel.com)

## Step 1: Deploy Socket.IO Server to Render

### Option A: Using render.yaml (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml` and create the service
5. Click "Apply" to deploy

### Option B: Manual Setup

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `webrtc-signaling-server` (or your preferred name)
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build:server`
   - **Start Command**: `npm run start:server`
5. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `ALLOWED_ORIGINS` = Your Vercel app URL (e.g., `https://your-app.vercel.app`)
     - For multiple origins, use comma-separated values
     - Supports wildcards: `https://*.vercel.app,https://yourdomain.com`
6. Click "Create Web Service"
7. Wait for deployment to complete
8. **Copy the service URL** (e.g., `https://webrtc-signaling-server.onrender.com`)

## Step 2: Deploy Next.js Frontend to Vercel

### Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Follow the prompts:
   - Set up and deploy: `Y`
   - Which scope: Select your account
   - Link to existing project: `N`
   - Project name: `web-rtc` (or your preferred name)
   - Directory: `./`
   - Override settings: `N`

4. Add environment variable:
   ```bash
   vercel env add NEXT_PUBLIC_SOCKET_URL production
   ```
   - Enter the Render service URL from Step 1 (e.g., `https://webrtc-signaling-server.onrender.com`)

5. Deploy to production:
   ```bash
   vercel --prod
   ```

### Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `next build`
   - **Output Directory**: `.next`
5. Add Environment Variables:
   - **Key**: `NEXT_PUBLIC_SOCKET_URL`
   - **Value**: Your Render service URL (e.g., `https://webrtc-signaling-server.onrender.com`)
6. Click "Deploy"
7. Wait for deployment to complete

## Step 3: Update CORS Settings on Render

After deploying to Vercel, update the `ALLOWED_ORIGINS` environment variable on Render:

1. Go to your Render service dashboard
2. Navigate to "Environment" tab
3. Update `ALLOWED_ORIGINS` to include your Vercel URL:
   ```
   https://your-app.vercel.app,https://*.vercel.app
   ```
4. Save changes (this will trigger a redeploy)

## Step 4: Test the Deployment

1. Visit your Vercel app URL
2. Create a room or join an existing room
3. Share the room URL with another user (or open in another browser/device)
4. Verify that video chat works correctly

## Troubleshooting

### Socket Connection Issues

- **Check CORS settings**: Ensure `ALLOWED_ORIGINS` on Render includes your Vercel URL
- **Check environment variable**: Verify `NEXT_PUBLIC_SOCKET_URL` is set correctly in Vercel
- **Check browser console**: Look for connection errors or CORS errors

### Video/Audio Not Working

- **HTTPS required**: WebRTC requires HTTPS (both Render and Vercel provide this)
- **Browser permissions**: Ensure camera/microphone permissions are granted
- **Check firewall**: Some corporate networks block WebRTC traffic

### Render Free Tier Limitations

- Services spin down after 15 minutes of inactivity
- First connection after spin-down takes ~30 seconds
- Consider upgrading to paid tier for production use

## Local Development

For local development, you can run both services locally:

1. Start the Socket.IO server:
   ```bash
   npm run dev
   ```
   This runs on `http://localhost:3000` by default.

2. The Next.js app is automatically served by the same server.

Alternatively, to test the production setup locally:

1. Start Socket.IO server standalone:
   ```bash
   npm run build:server
   PORT=10000 npm run start:server
   ```

2. Start Next.js dev server:
   ```bash
   NEXT_PUBLIC_SOCKET_URL=http://localhost:10000 npm run dev
   ```

## Environment Variables Reference

### Render (Socket.IO Server)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Node environment | `production` |
| `PORT` | Server port | `10000` |
| `ALLOWED_ORIGINS` | Allowed CORS origins (comma-separated) | `https://your-app.vercel.app,https://*.vercel.app` |

### Vercel (Next.js Frontend)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO server URL | `https://webrtc-signaling-server.onrender.com` |

## Updating the Application

Both services are configured for automatic deployment:

1. Push changes to GitHub
2. Render and Vercel will automatically deploy the changes
3. No manual intervention required

## Cost Considerations

- **Render Free Tier**: 750 hours/month (enough for one service)
- **Vercel Hobby Plan**: Free for personal projects
- Both services offer paid tiers for production use with better performance and uptime
