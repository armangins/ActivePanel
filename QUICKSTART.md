# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the Application
```bash
npm run dev
```

The application will open at `http://localhost:3000`

### Step 3: Configure WooCommerce API

1. **Get Your API Credentials:**
   - Log in to your WooCommerce store admin
   - Go to: **WooCommerce → Settings → Advanced → REST API**
   - Click **"Add Key"**
   - Set description: "Admin Panel"
   - Set permissions: **Read/Write**
   - Click **"Generate API Key"**
   - Copy the **Consumer Key** and **Consumer Secret**

2. **Enter Credentials in the App:**
   - Navigate to **Settings** in the admin panel
   - Enter your store URL (e.g., `https://your-store.com`)
   - Paste your Consumer Key
   - Paste your Consumer Secret
   - Click **"Test Connection"** to verify
   - Click **"Save Settings"**

### Step 4: Start Managing Your Store!

You can now:
- 📊 View dashboard statistics
- 📦 Manage products (create, edit, delete)
- 🛒 View and update orders
- 👥 Browse customers
- ⚙️ Adjust settings

## 🔧 Troubleshooting

### Connection Issues?

1. **Check your store URL:**
   - Must include `https://` or `http://`
   - No trailing slash
   - Example: `https://your-store.com` ✅
   - Wrong: `your-store.com` ❌ or `https://your-store.com/` ❌

2. **Verify API credentials:**
   - Consumer Key starts with `ck_`
   - Consumer Secret starts with `cs_`
   - Both are long strings (32+ characters)

3. **Check API permissions:**
   - Must have **Read/Write** permissions
   - Not just Read-only

4. **CORS Issues:**
   - If you see CORS errors, you may need to configure your WordPress/WooCommerce to allow requests from your domain
   - Some hosting providers have CORS restrictions

### Still Having Issues?

- Check the browser console for detailed error messages
- Verify your WooCommerce store is accessible
- Ensure WooCommerce REST API is enabled
- Try the "Test Connection" button in Settings

## 📝 Environment Variables (Optional)

For production, create a `.env` file:

```env
VITE_WOOCOMMERCE_URL=https://your-store.com
VITE_CONSUMER_KEY=ck_xxxxxxxxxxxxx
VITE_CONSUMER_SECRET=cs_xxxxxxxxxxxxx
```

Then restart the dev server.

## 🎯 Next Steps

- Explore the Dashboard to see your store statistics
- Add or edit products in the Products section
- Check recent orders in the Orders section
- View customer information in the Customers section

Happy managing! 🎉



