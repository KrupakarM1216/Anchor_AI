# ANCHOR AI - Deployment Guide

This guide will walk you through deploying your full-stack Anchor application. The Backend will be hosted on **Render** (ideal for Node.js), and the Frontend will be hosted on **Vercel** (the native platform for Next.js).

---

## Part 1: Deploying the Backend (Render)

We deploy the backend first so we can get its public URL, which the frontend needs in order to communicate with it.

1. **Sign in to Render**
   - Go to [Render.com](https://render.com) and sign in with your GitHub account.

2. **Create a New Web Service**
   - Click the **"New"** button in the top right and select **"Web Service"**.
   - Select **"Build and deploy from a Git repository"**.
   - Connect your GitHub account and select your `Anchor_AI` repository.

3. **Configure the Web Service**
   Fill in the deployment details exactly as follows:
   - **Name:** `anchor-backend` (or anything you prefer)
   - **Root Directory:** `Backend` *(This is critical!)*
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

4. **Add Environment Variables**
   Scroll down to the **"Environment Variables"** section and add the following keys:
   - `OPENAI_API_KEY` : *(Paste your actual OpenAI API key here)*
   - `NODE_ENV` : `production`

5. **Deploy**
   - Click **"Create Web Service"**.
   - Wait for the build to finish. Once it says **"Live"**, copy the URL provided at the top left of your dashboard (e.g., `https://anchor-backend.onrender.com`). You will need this for the frontend!

---

## Part 2: Deploying the Frontend (Vercel)

Now that your backend is running in the cloud, let's deploy the Next.js frontend.

1. **Sign in to Vercel**
   - Go to [Vercel.com](https://vercel.com) and sign in with your GitHub account.

2. **Import Project**
   - Click **"Add New"** > **"Project"**.
   - Find your `Anchor_AI` repository in the list and click **"Import"**.

3. **Configure the Project**
   - **Project Name:** `anchor-ai` (or anything you prefer)
   - **Framework Preset:** `Next.js` (Vercel should detect this automatically)
   - **Root Directory:** Click "Edit" and select the `Frontend` folder. *(This is critical!)*

4. **Add Environment Variables**
   Expand the **"Environment Variables"** section and add the URL you copied from Render:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** *(Paste your Render URL here, e.g., `https://anchor-backend.onrender.com`)*
   *(Make sure there is no trailing slash `/` at the end of the URL).*

5. **Deploy**
   - Click **"Deploy"**.
   - Vercel will now build your frontend. Once it finishes, you will be given a live URL (e.g., `https://anchor-ai.vercel.app`). 

---

## 🎉 You're Live!
Your full-stack application is now successfully deployed! 
- Your AI backend is securely processing data on Render.
- Your beautiful Next.js UI is lightning fast on Vercel.

If you ever make changes to your code and push them to GitHub, Render and Vercel will both **automatically rebuild and deploy** the updates for you!
