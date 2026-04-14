# Fitness Tracker - Azure Free Tier Deployment Guide

## Overview
This guide walks through deploying the Fitness Tracker app to Azure Free Tier (at no cost) using:
- **Frontend:** Azure Static Web Apps (free)
- **Backend:** Azure App Service (free tier F1)
- **Storage:** JSON files (no database costs)

**Total Cost: $0/month**

---

## Prerequisites

1. **Azure Account** - Sign up for free at https://azure.microsoft.com/free/
2. **GitHub Account** - For storing code and GitHub Actions CI/CD
3. **GitHub CLI or Web UI** - To push code and manage secrets
4. **Azure CLI (optional)** - For local testing: https://learn.microsoft.com/cli/azure/

## Step 1: Prepare Your Code for Azure

### 1.1 Update Frontend API URL
The frontend needs to know the backend API URL. Update `frontend/src/api.ts`:

```typescript
// Local development
const API_BASE_URL = import.meta.env.DEV 
  ? "http://localhost:8000/api"
  : "https://YOUR_APP_SERVICE.azurewebsites.net/api"
```

Replace `YOUR_APP_SERVICE` with your Azure App Service name.

### 1.2 Environment Configuration
Backend already supports environment variables via `.env` file:
- `CORS_ORIGINS` - Comma-separated list of allowed domains

For Azure, set this in App Service application settings.

---

## Step 2: Create Azure Resources

### 2.1 Create Resource Group
```bash
az group create \
  --name fitness-tracker-rg \
  --location eastus
```

Or via Azure Portal: Create Resource Group → Name: `fitness-tracker-rg`

### 2.2 Create Azure Static Web Apps (Frontend)

**Via Portal:**
1. Search "Static Web Apps" in Azure Portal
2. Click "Create"
3. Fill in:
   - **Name:** `fitness-tracker-app` (will be `fitness-tracker-app.azurestaticapps.net`)
   - **Plan Type:** Free
   - **Location:** Free tier options (e.g., East US)
   - **Source:** GitHub (will connect in next step)
4. Click "Sign in with GitHub" and authorize
5. Select your repo and branch: `master`
6. Framework: Select `React`
7. **App location:** `frontend`
8. **Build output location:** `dist`
9. **API location:** Leave empty (we'll use backend service as separate API)

**Important:** Note the deployment token generated - save it!

### 2.3 Create Azure App Service (Backend)

**Via Portal:**
1. Search "App Services" in Azure Portal
2. Click "Create"
3. Fill in:
   - **Name:** `fitness-tracker-api` (will be `fitness-tracker-api.azurewebsites.net`)
   - **Publish:** Code
   - **Runtime stack:** Python 3.11
   - **Region:** Same as Static Web Apps (e.g., East US)
   - **Pricing plan:** Free (F1)
4. Click "Create"
5. Wait for deployment (~2 minutes)

### 2.4 Configure App Service

Once created, go to App Service → Settings:

**1. Application Settings**
- Click "New application setting"
- Add: `CORS_ORIGINS` = `https://fitness-tracker-app.azurestaticapps.net`
- Click "Save"

**2. Startup Command**
- Go to Settings → Configuration
- Startup Command: `sh startup.sh`
- Click "Save"

**3. General Settings**
- Go to Settings → General Settings
- Web sockets: OFF (not needed)
- Always On: OFF (saves billing)

---

## Step 3: Deploy via GitHub Actions

### 3.1 Create GitHub Secrets

Go to your GitHub repo → Settings → Secrets and variables → Actions

Create these secrets:
1. **AZURE_STATIC_WEB_APPS_API_TOKEN**
   - Copy from your Static Web Apps resource (overview page)
   - Click "Manage deployment token"
   - Copy the token

2. **AZURE_APP_SERVICE_PUBLISH_PROFILE**
   - Go to App Service → Overview
   - Click "Get publish profile" button (right side)
   - This downloads an XML file
   - Open it and copy entire contents
   - Paste as secret value

3. **AZURE_APP_SERVICE_NAME**
   - Value: `fitness-tracker-api` (your app service name)

4. **AZURE_RESOURCE_GROUP**
   - Value: `fitness-tracker-rg`

5. **VITE_API_URL** (Optional - for build-time API URL)
   - Value: `https://fitness-tracker-api.azurewebsites.net/api`

### 3.2 Push Code to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/fitness-tracker.git
git branch -M master
git push -u origin master
```

This triggers the GitHub Actions workflow automatically!

### 3.3 Monitor Deployment

1. Go to repo → Actions tab
2. Watch the "Deploy to Azure" workflow run
3. Should complete in ~5 minutes
4. Check build logs for any errors

---

## Step 4: Verify Deployment

### 4.1 Check Frontend
1. Open https://fitness-tracker-app.azurestaticapps.net/
2. Should see the fitness tracker home page
3. If old page shows, clear browser cache (Ctrl+Shift+Delete)

### 4.2 Check Backend
1. Open https://fitness-tracker-api.azurewebsites.net/api/
2. Should see "Not Found" (no root endpoint defined)
3. Open https://fitness-tracker-api.azurewebsites.net/api/activities
4. Should see JSON list of activities
5. Should see list of available activities

### 4.3 Test Full Workflow
1. Open frontend
2. Click "Plan Workout"
3. Create a new workout plan
4. Backend should save to `/data/workout_plans.json` in App Service storage
5. Click "Start Workout" and complete a workout
6. Verify it shows in "History & Analytics"

---

## Troubleshooting

### Frontend shows old UI
- Clear browser cache: Ctrl+Shift+Delete → "All time"
- Wait 5 minutes for CDN to clear
- Check GitHub Actions log for build errors

### Backend returns 500 error
1. Go to App Service → Log Stream
2. Check for error messages
3. Common issues:
   - Missing CORS_ORIGINS setting
   - Startup script not found
   - Python dependencies not installed

### "CORS error" in browser console
1. Go to App Service → Configuration → Application settings
2. Verify `CORS_ORIGINS` matches your Static Web Apps domain
3. Restart app: App Service → Overview → Restart

### App Service shows as "Stopped"
- Free tier may auto-stop after 20 minutes idle
- Just visit the URL to wake it up
- Upgrade to B1 tier if you need persistent availability

---

## Performance Notes

**Free Tier Limitations:**
- Single worker process (slower under load)
- 1GB shared memory
- 60-minute request timeout
- 20-minute idle timeout (app may sleep)
- ~100ms baseline latency

**This is fine for:**
- Personal use
- Learning/development
- < 100 requests/day

**Upgrade to B1 ($15/month) if:**
- You want persistent 24/7 uptime
- You expect > 100 requests/day
- You need faster response times

---

## Next Steps (Optional Enhancements)

### Add Custom Domain
1. Static Web Apps → Custom domains
2. Add your domain (requires DNS CNAME record)
3. App Service → Custom domains
4. Similar process

### Add Monitoring
1. App Service → Application Insights
2. Enable for free tier insights
3. Monitor requests, errors, performance

### Add Authentication
1. Static Web Apps → Authentication
2. Configure auth provider (Microsoft, Google, GitHub)
3. Update frontend to handle auth

### Upgrade to Paid Tier
1. App Service → Scale up
2. Change to B1 Basic ($15/month) or higher
3. Better CPU, more memory, always-on

---

## Cost Calculator

| Item | Free Tier | Cost | Notes |
|------|-----------|------|-------|
| Static Web Apps | Free | $0 | 100GB bandwidth/month |
| App Service F1 | 1 free/month | $0 | Shared CPU, no uptime SLA |
| Bandwidth | 100GB/month | $0 | Overage ~$0.087/GB |
| **Total** | | **$0** | |

---

## Support & Resources

- Azure Free Tier FAQ: https://azure.microsoft.com/free/
- GitHub Actions Docs: https://docs.github.com/actions
- FastAPI Deployment: https://fastapi.tiangolo.com/deployment/
- Vite Deployment: https://vitejs.dev/guide/static-deploy.html

---

**Last Updated:** April 2026
**App Status:** Production Ready ✅
