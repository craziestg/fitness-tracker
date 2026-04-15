# Fitness Tracker - Manual Setup Checklist

This checklist contains all tasks that require manual action outside of code/git operations.

## Azure Portal Setup

### Resources Creation
- [ ] **Create Azure Account** if you don't have one (free tier eligible at https://azure.microsoft.com/free/)
- [ ] Create **Resource Group** named `fitness-tracker-rg` in East US region
- [ ] Create **Azure Static Web Apps** resource:
  - [ ] Name: `fitness-tracker-app` (or your choice)
  - [ ] Plan: Free tier
  - [ ] Connect to GitHub with auth
  - [ ] Select this repository
  - [ ] Branch: `main`
  - [ ] Source: GitHub
  - [ ] Framework: React
  - [ ] App location: `/frontend`
  - [ ] Build output location: `/frontend/dist`
  - [ ] **Save the deployment token**
- [ ] Create **Azure App Service**:
  - [ ] Name: `fitness-tracker-api` (or your choice)
  - [ ] Publish: Code
  - [ ] Runtime: Python 3.11
  - [ ] Region: Same as Static Web Apps (East US)
  - [ ] Plan: Free tier (F1)

### Configuration
- [ ] **Configure Static Web Apps**:
  - [ ] Copy deployment token for GitHub secrets
  - [ ] Note the URL: `https://fitness-tracker-app.azurestaticapps.net`

- [ ] **Configure App Service**: 
  - [ ] Go to Configuration → Application settings
  - [ ] Add setting: `CORS_ORIGINS` = `https://fitness-tracker-app.azurestaticapps.net`
  - [ ] Go to Configuration → Startup command: `sh startup.sh`
  - [ ] Get publish profile (Download button in Overview)
  - [ ] Note the URL: `https://fitness-tracker-api.azurewebsites.net`

## GitHub Configuration

### Secrets Setup
- [ ] Go to GitHub repo → Settings → Secrets and Variables → Actions
- [ ] Create secret: `AZURE_STATIC_WEB_APPS_API_TOKEN`
  - [ ] Value: Deployment token from Static Web Apps
- [ ] Create secret: `AZURE_APP_SERVICE_PUBLISH_PROFILE`
  - [ ] Value: Full contents of downloaded .xml publish profile
- [ ] Create secret: `AZURE_APP_SERVICE_NAME`
  - [ ] Value: `fitness-tracker-api`
- [ ] Create secret: `AZURE_RESOURCE_GROUP`
  - [ ] Value: `fitness-tracker-rg`
- [ ] Create secret: `VITE_API_URL`
  - [ ] Value: `https://fitness-tracker-api.azurewebsites.net/api`

### Workflow Configuration
- [ ] Uncomment auto-deploy trigger in `.github/workflows/deploy-azure.yml`:
  - [ ] Uncomment the `push:` section (lines 7-8)
  - [ ] Uncomment the `branches: [main]` line
- [ ] Commit and push the workflow change

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
