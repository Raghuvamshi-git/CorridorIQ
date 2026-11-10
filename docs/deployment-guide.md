# CorridorIQ — Public Deployment & Sharing Guide

This guide explains how to make CorridorIQ publicly accessible over the internet so anyone worldwide can interact with the live transport operations dashboard.

---

## Architecture Overview for Deployment

CorridorIQ is designed with a **Unified Single-Port Full-Stack Architecture**:
* **Frontend**: React 19 + Tailwind CSS + Leaflet (OpenStreetMap) compiled into `frontend/dist/`.
* **Backend**: Python FastAPI with SQLite/MySQL fallback.
* **Unified Serving**: FastAPI mounts `frontend/dist/` at the root `/` and serves all APIs under `/api/`.
* **Zero CORS or Proxy Hassles**: Both the web UI and REST API run on a single host port (e.g. `8000`), making cloud deployment seamless with only **one** web service required.

---

## Option 1: 24/7 Free Cloud Deployment via Render (Recommended)

Render offers free web service hosting directly from your GitHub repository.

### Step-by-Step Instructions:
1. **Push your code to GitHub**:
   ```powershell
   git add .
   git commit -m "Add production deployment configs, OpenStreetMap fix, and unified serving"
   git push origin main
   ```
2. **Open Render**:
   * Visit [https://render.com](https://render.com) and sign in with GitHub.
3. **Create a New Web Service**:
   * Click **New +** $\rightarrow$ **Web Service**.
   * Choose **Build and deploy from a Git repository**.
   * Select your repository: `Raghuvamshi-git/CorridorIQ`.
4. **Configure the Service**:
   * **Name**: `corridoriq` (or your choice)
   * **Region**: Singapore or Frankfurt (closest to India / Asia)
   * **Runtime**: **Docker** *(Render automatically detects `Dockerfile` and `render.yaml`)*
   * **Instance Type**: **Free**
5. **Environment Variables** (Optional):
   * `OPERATING_REGION`: `Hyderabad, Telangana, India`
   * `GEMINI_MODEL`: `gemini-2.5-flash`
   * `GEMINI_API_KEY`: *(Your Google Gemini API key if you want live AI reasoning)*
6. **Click "Deploy Web Service"**:
   * Render will build the multi-stage Docker container (compiling React and setting up FastAPI with the Hyderabad dataset).
   * Within 2–3 minutes, you receive a free live HTTPS domain:
     **`https://corridoriq.onrender.com`**
   * Anyone with this link can open the application from any computer, tablet, or phone worldwide!

---

## Option 2: 24/7 Cloud Deployment via Railway

Railway provides fast deployment from Git with zero configuration.

1. Go to [https://railway.app](https://railway.app) and log in with GitHub.
2. Click **New Project** $\rightarrow$ **Deploy from GitHub repo**.
3. Select `Raghuvamshi-git/CorridorIQ`.
4. Railway will automatically read `Dockerfile` and `railway.json`.
5. Under service settings, click **Generate Domain** to get a public `https://corridoriq-production.up.railway.app` URL.

---

## Option 3: Instant Public Internet Access from Your Machine (via Cloudflare Tunnel)

If you want a live public URL **right this second** without committing to a cloud host:

1. Download the free Cloudflare Tunnel executable (no sign-up required):
   * Direct download: [cloudflared-windows-amd64.msi or exe](https://github.com/cloudflare/cloudflared/releases)
   * Or with winget:
     ```powershell
     winget install Cloudflare.cloudflared
     ```
2. Start the tunnel to your local unified server (port 8000):
   ```powershell
   cloudflared tunnel --url http://localhost:8000
   ```
3. Cloudflare will output an instant, secure public HTTPS link:
   ```text
   https://random-transit-subdomain.trycloudflare.com
   ```
4. Anyone who opens that link can use CorridorIQ live!

---

## Option 4: Local Network Access (Wi-Fi Sharing)

Anyone connected to the same Wi-Fi router (family, teammates, office colleagues) can access CorridorIQ on their mobile phone or laptop without any internet hosting:

1. Find your local IP address:
   ```powershell
   ipconfig
   # Look for IPv4 Address (e.g. 192.168.1.13)
   ```
2. Share the URL with anyone on your local network:
   * **`http://192.168.1.13:5173`** (Vite frontend with proxy)
   * or **`http://192.168.1.13:8000`** (FastAPI unified app)
