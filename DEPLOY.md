# Deployment Guide: Campus Assist (SRM University)

This repository is architected as **ONE unified service**: the Node.js backend serves both the REST API (under `/api`) and the pre-built single-page React frontend (`dist/`), backed by a built-in zero-dependency SQLite database.

---

## Deploying to Render (Step-by-Step)

### Step 1: Create a Render Account & New Web Service
1. Go to [Render.com](https://render.com/) and sign in.
2. In your Render Dashboard, click **New +** and select **Web Service**.
3. Connect your GitHub/Git repository containing Campus Assist.

### Step 2: Configure Service Settings
Under the **Settings** tab, configure the following:

- **Name**: `campus-assist` (or your chosen service name)
- **Region**: Choose the closest region (e.g., `Singapore` or `Oregon`)
- **Branch**: `main`
- **Runtime**: `Node`
- **Build Command**:
  ```bash
  npm install --include=dev && npm run build
  ```
- **Start Command**:
  ```bash
  npm run start:prod
  ```
- **Plan**: `Free`

### Step 3: Set Environment Variables
In the **Environment** section of your Render dashboard, add these environment variables:

| Variable Name | Recommended Value | Explanation |
| :--- | :--- | :--- |
| `NODE_VERSION` | `22.12.0` | **Required**: Must be Node 22.5.0 or higher for native `node:sqlite` support |
| `NODE_ENV` | `production` | Enables production caching and optimizations |
| `HOST` | `0.0.0.0` | Binds server to all interfaces |
| `DATABASE_PATH` | `backend/data/campus_assist.db` | Location where SQLite writes the database file |
| `VITE_API_BASE_URL` | `/api` | Connects frontend to the co-hosted backend API |

*(Optional)* You can also click **Apply Blueprint** if using the included [render.yaml](file:///render.yaml).

### Step 4: Deploy & Verify
1. Click **Deploy Web Service**.
2. Wait for the build and deployment logs to finish.
3. Open the public URL provided by Render (e.g., `https://campus-assist.onrender.com`).
4. Verify the health check at `https://campus-assist.onrender.com/api/health`.

> [!NOTE]
> **Free Tier Information & Behavior**:
> - **Spin down on idle**: Render Free Tier web services spin down after 15 minutes of inactivity. The first visit after sleeping may take 30–50 seconds to wake up.
> - **Ephemeral disk storage**: On Render's free plan, the filesystem resets when the container restarts. Campus Assist handles this automatically: `npm run start:prod` detects an empty database on startup and automatically reseeds all baseline data (demo student, demo admin, safety directory, transport routes, and initial reports).

---

## Running Locally in Production Mode

To test the exact single-service production setup on your local machine:

```bash
# 1. Build the production React frontend bundle
npm run build

# 2. Run the production command
npm run start:prod
```

Once started, open `http://localhost:4000` in your browser.
Both the frontend web app and `/api` REST endpoints will run simultaneously on port 4000.
