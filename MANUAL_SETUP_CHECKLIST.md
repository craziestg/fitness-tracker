# Fitness Tracker - Manual Setup Checklist

This checklist contains all tasks that require manual action outside of code/git operations.

## Azure Portal Setup

### Resources Creation
- [ ] **Create Azure Account** if you don't have one (free tier eligible at https://azure.microsoft.com/free/)
- [ ] Create **Resource Group** named `fitness-tracker-rg` in East US region
- [ ] Create **Azure Static Web Apps** resource (DETAILED STEPS BELOW):
  
  **Step 1: Start Creation**
  - Go to Azure Portal (https://portal.azure.com)
  - Click "Create a resource" (+ button top-left)
  - Search for "Static Web Apps"
  - Click create on the one by Microsoft
  
  **Step 2: Basics Tab**
  - **Subscription**: Select your subscription (usually "Free Trial" or your account)
  - **Resource Group**: Select `fitness-tracker-rg` (or create if not exists)
  - **Name**: `fitness-tracker-app` (this becomes your URL)
  - **Plan Type**: Free
  - **Region**: East US (or closest free tier region available)
  - **Deployment details**: GitHub (you'll connect next)
  - Click "Sign in with GitHub"
  
  **Step 3: GitHub Authentication**
  - Click "Sign in with GitHub"
  - Authorize Azure to access your GitHub account
  - After auth, you'll see GitHub dropdown options
  
  **Step 4: Build Details**
  - **Source**: GitHub (should be selected)
  - **Organization**: Select `craziestg` (your GitHub username)
  - **Repository**: Select `fitness-tracker`
  - **Branch**: `main`
  
  **Step 5: Build Presets**
  - **Build Presets**: Select "React"
  - This will auto-fill the following:
    - **App location**: `/frontend`
    - **API location**: Leave EMPTY (we use separate backend service)
    - **Output location**: `dist`
  
  **Step 6: Review & Create**
  - Click "Review + create"
  - Review all settings one more time
  - Click "Create"
  - **WAIT** - This takes 2-3 minutes to deploy
  
  **Step 7: Get Your Deployment Token**
  - After creation, go to the Static Web Apps resource
  - Click "Manage deployment token" (right side, under the name)
  - Copy the entire token (click copy button)
  - **SAVE THIS** - You need it for GitHub secrets
  - Also note your URL: `https://fitness-tracker-app.azurestaticapps.net`
- [ ] Create **Azure App Service** (DETAILED STEPS BELOW):
  
  **Step 1: Start Creation**
  - Go to Azure Portal (https://portal.azure.com)
  - Click "Create a resource" (+ button top-left)
  - Search for "App Service"
  - Click create on the one by Microsoft
  
  **Step 2: Basics Tab**
  - **Subscription**: Same as Static Web Apps
  - **Resource Group**: Select `fitness-tracker-rg`
  - **Name**: `fitness-tracker-api` (this becomes your URL)
  - **Publish**: Code (not Docker)
  - **Runtime stack**: Python 3.11 (IMPORTANT: Must be 3.11+)
  - **Operating System**: Linux (IMPORTANT: Choose Linux, not Windows)
  - **Region**: East US (same as Static Web Apps)
  
  **Step 3: Pricing Plan**
  - Click "Change size" or "Review + create" to select plan
  - **Sku and size**: Free (F1) - should show 1 GB memory
  - This is important for free tier
  
  **Step 4: Review & Create**
  - Click "Review + create"
  - Verify all settings
  - Click "Create"
  - **WAIT** - This takes 2-3 minutes to deploy
  
  **Step 5: Configure Startup**
  - After creation, go to the App Service resource
  - Left menu: Click "Configuration"
  - Click "Startup command" field
  - Enter: `sh startup.sh`
  - Click "Save" button at top
  
  **Step 6: Add Environment Variables**
  - Still in Configuration section
  - Click "+ New application setting"
  - **Name**: `CORS_ORIGINS`
  - **Value**: `https://fitness-tracker-app.azurestaticapps.net` (use YOUR Static Web Apps URL from Step 7 of Static Web Apps)
  - Click OK/Add
  - Click "Save" button at top
  
  **Step 7: Get Publish Profile**
  - Go to Overview tab (top of App Service page)
  - Find "Download publish profile" button (right side)
  - Click it to download `.xml` file
  - **IMPORTANT**: Open this file and copy the ENTIRE contents (select all, copy)
  - **SAVE THIS** - All of the XML content goes into GitHub secrets
  - Also note the URL: `https://fitness-tracker-api.azurewebsites.net`

### Resources Creation Done ✅

**You should now have:**
- ✅ Static Web Apps URL: `https://fitness-tracker-app.azurestaticapps.net`
- ✅ Static Web Apps deployment token (saved for later)
- ✅ App Service URL: `https://fitness-tracker-api.azurewebsites.net`
- ✅ App Service publish profile XML (saved for later)

## GitHub Configuration

### Secrets Setup (DETAILED STEPS)

**Where to go:**
1. Go to https://github.com/craziestg/fitness-tracker
2. Click "Settings" (top navigation)
3. Left sidebar: Click "Secrets and variables" → "Actions"

**Create Each Secret:**

1. **AZURE_STATIC_WEB_APPS_API_TOKEN**
   - Click "New repository secret"
   - **Name**: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - **Value**: Paste the deployment token from Static Web Apps Step 7
   - Click "Add secret"

2. **AZURE_APP_SERVICE_PUBLISH_PROFILE**
   - Click "New repository secret"
   - **Name**: `AZURE_APP_SERVICE_PUBLISH_PROFILE`
   - **Value**: Open the .xml file you downloaded, select ALL content (Ctrl+A), copy (Ctrl+C), paste here
   - Click "Add secret"

3. **AZURE_APP_SERVICE_NAME**
   - Click "New repository secret"
   - **Name**: `AZURE_APP_SERVICE_NAME`
   - **Value**: `fitness-tracker-api` (same as your App Service name)
   - Click "Add secret"

4. **AZURE_RESOURCE_GROUP**
   - Click "New repository secret"
   - **Name**: `AZURE_RESOURCE_GROUP`
   - **Value**: `fitness-tracker-rg`
   - Click "Add secret"

5. **VITE_API_URL** (Optional but recommended)
   - Click "New repository secret"
   - **Name**: `VITE_API_URL`
   - **Value**: `https://fitness-tracker-api.azurewebsites.net/api` (use YOUR App Service URL)
   - Click "Add secret"

**Verify all 5 secrets are created** (you should see them listed)

### Workflow Configuration (DETAILED STEPS)

**Edit the workflow file to enable auto-deploy:**

1. Go to your GitHub repo: https://github.com/craziestg/fitness-tracker
2. Click "Code" tab
3. Navigate to: `.github/workflows/deploy-azure.yml`
4. Click the **edit pencil icon** (right side)
5. Find these lines at the top (around line 3-8):
   ```
   # Uncomment below to auto-deploy on push (requires Azure credentials configured)
   # push:
   #   branches: [main]
   ```
6. **Uncomment** those lines by removing the `#` and spaces:
   ```
   push:
     branches: [main]
   ```
7. Scroll down and click "Commit changes..."
8. Add a message: `Enable auto-deploy workflow`
9. Click "Commit changes"

**After committing:**
- Workflow will NOW automatically deploy on every push to main branch
- You can watch deployment at: GitHub → Actions tab

## Testing & Verification

### Local Testing (Before Azure)
- [ ] Test frontend: http://localhost:5174/
  - [ ] Home page loads with three cards
  - [ ] Plan Workout button works
  - [ ] Start Workout button works
  - [ ] View Analytics button works
- [ ] Test backend: http://localhost:8000/api/activities
  - [ ] Returns JSON list of activities
- [ ] Test full workflow locally:
  - [ ] Create a workout plan
  - [ ] Start a workout
  - [ ] Complete it
  - [ ] Verify it shows in analytics

### Azure Testing (After Deployment)
- [ ] Visit Static Web Apps frontend URL
  - [ ] Same three workflows visible
  - [ ] No "Cannot reach backend" errors
  - [ ] API calls working
- [ ] Test Plan Workout on Azure
  - [ ] Create a plan
  - [ ] Verify data persists
- [ ] Test Start Workout on Azure
  - [ ] Execute a full workout
  - [ ] Complete it
- [ ] Test Analytics on Azure
  - [ ] Verify completed workouts show up

## Optional Enhancements

- [ ] Add custom domain to Static Web Apps
- [ ] Configure DNS CNAME records for custom domain
- [ ] Set up Azure Monitor / Application Insights
- [ ] Configure backup for JSON data files
- [ ] Upgrade App Service to B1 tier (~$15/month) for better performance
- [ ] Add GitHub Pages documentation
- [ ] Add authentication (Microsoft, GitHub, Google)

## Troubleshooting Reference

### If frontend shows "Cannot reach API":
- [ ] Verify `CORS_ORIGINS` env var in App Service settings
- [ ] Check App Service is running (not stopped)
- [ ] Wait 20+ minutes (free tier may need wake-up time)

### If deployment workflow fails:
- [ ] Check GitHub Actions logs for specific error
- [ ] Verify all secrets are filled correctly
- [ ] Verify secrets have correct case sensitivity
- [ ] Ensure Azure credentials haven't expired

### If data isn't persisting:
- [ ] Check App Service file storage (JSON files in `/data/` folder)
- [ ] Verify App Service has write permissions to file system
- [ ] Check Application Insights logs for errors

## Helpful Links

- [Azure Free Tier FAQ](https://azure.microsoft.com/free/)
- [Static Web Apps Documentation](https://learn.microsoft.com/azure/static-web-apps/)
- [App Service Documentation](https://learn.microsoft.com/azure/app-service/)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [GitHub Secrets Documentation](https://docs.github.com/actions/security-guides/using-secrets-in-github-actions)

---

**Status:** App code is ready → Add Azure resources → Configure GitHub secrets → Enable auto-deploy → Test on Azure

**Estimated time:** 30-45 minutes for complete setup + testing
