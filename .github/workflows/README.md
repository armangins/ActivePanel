# GitHub Actions CI/CD Setup

This directory contains the GitHub Actions workflow for automatic deployment to Hostinger.

## Workflow: `deploy.yml`

This workflow automatically builds and deploys your React app to Hostinger whenever you push to the `main` branch.

### Required GitHub Secrets

You need to add these secrets to your GitHub repository:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:

   - **FTP_SERVER**: Your Hostinger FTP server address (e.g., `ftp.yourdomain.com`)
   - **FTP_USERNAME**: Your FTP username
   - **FTP_PASSWORD**: Your FTP password
   - **FTP_PORT**: FTP port (usually `21` for FTP or `990` for FTPS)

### How It Works

1. **Trigger**: Automatically runs on every push to `main` branch
2. **Build**: Installs dependencies and builds the React app
3. **Deploy**: Uploads the `build/` folder to Hostinger's `public_html/` directory via FTP

### Testing the Workflow

1. Make a change to your code
2. Commit and push to `main` branch:
   ```bash
   git add .
   git commit -m "Test deployment"
   git push origin main
   ```
3. Check the Actions tab in GitHub to see the deployment progress

### Troubleshooting

- **Build fails**: Check the Actions logs for error messages
- **Deployment fails**: Verify your FTP credentials in GitHub Secrets
- **Files not updating**: Ensure `.htaccess` is being uploaded correctly

