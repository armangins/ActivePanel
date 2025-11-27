# ActivePanel

ActivePanel is a modern, responsive React interface for managing your WooCommerce store. This admin panel provides a beautiful and intuitive way to manage products, orders, customers, and view analytics.

## Features

- 📊 **Dashboard** - Overview of store statistics and recent orders
- 📦 **Products Management** - Create, edit, delete, and manage products
- 🛒 **Orders Management** - View and update order statuses
- 👥 **Customers Management** - Browse and view customer details
- ⚙️ **Settings** - Configure WooCommerce API credentials
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- 🔒 **Secure** - Uses WooCommerce REST API with authentication

## Prerequisites

- Node.js 16+ and npm/yarn
- A WooCommerce store with REST API enabled
- WooCommerce API credentials (Consumer Key and Consumer Secret)
- Google OAuth Client ID (for authentication)

## Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Configure your WooCommerce API credentials (see Configuration section below)

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:3000`

## Configuration

### Google OAuth Setup (Required)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Choose **"Web application"**
6. Add authorized JavaScript origins:
   - `http://localhost:5173` (for development)
   - Your production URL (e.g., `https://your-domain.com`)
7. Copy the **Client ID**
8. Create a `.env` file in the root directory:

```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

**Note:** Never commit your `.env` file to version control!

### WooCommerce API Configuration

#### Option 1: Using Settings Page (Recommended for Development)

1. Start the application
2. Log in with Google
3. Navigate to the Settings page
4. Enter your WooCommerce store URL, Consumer Key, and Consumer Secret
5. Click "Save Settings"

#### Option 2: Using Environment Variables (Recommended for Production)

Add to your `.env` file:

```env
VITE_WOOCOMMERCE_URL=https://your-store.com
VITE_CONSUMER_KEY=ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_CONSUMER_SECRET=cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Getting WooCommerce API Credentials

1. Log in to your WooCommerce store admin panel
2. Navigate to **WooCommerce → Settings → Advanced → REST API**
3. Click **"Add Key"** to create a new API key
4. Set the description (e.g., "Admin Interface")
5. Set user permissions to **Read/Write**
6. Click **"Generate API Key"**
7. Copy the **Consumer Key** and **Consumer Secret**

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Sidebar.jsx
│   │   │   └── Header.jsx
│   │   ├── Dashboard/
│   │   │   └── Dashboard.jsx
│   │   ├── Products/
│   │   │   └── Products.jsx
│   │   ├── Orders/
│   │   │   └── Orders.jsx
│   │   ├── Customers/
│   │   │   └── Customers.jsx
│   │   └── Settings/
│   │       └── Settings.jsx
│   ├── services/
│   │   └── woocommerce.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Technologies Used

- **React 18** - UI library
- **React Router** - Client-side routing
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **Lucide React** - Icon library
- **date-fns** - Date formatting utilities

## API Endpoints Used

This application uses the WooCommerce REST API v3:

- `GET /wp-json/wc/v3/products` - List products
- `POST /wp-json/wc/v3/products` - Create product
- `PUT /wp-json/wc/v3/products/{id}` - Update product
- `DELETE /wp-json/wc/v3/products/{id}` - Delete product
- `GET /wp-json/wc/v3/orders` - List orders
- `PUT /wp-json/wc/v3/orders/{id}` - Update order
- `GET /wp-json/wc/v3/customers` - List customers
- `GET /wp-json/wc/v3/reports/sales` - Get sales reports

## Security Notes

- API credentials are stored in localStorage (development) or environment variables (production)
- Always use HTTPS for your WooCommerce store URL
- Never expose your Consumer Secret in client-side code in production
- Consider implementing a backend proxy for production use to keep credentials secure

## Troubleshooting

### CORS Errors

If you encounter CORS errors, you may need to configure your WooCommerce store to allow requests from your domain. This is typically handled by WordPress/WooCommerce CORS settings.

### API Authentication Errors

- Verify your Consumer Key and Consumer Secret are correct
- Ensure the API key has Read/Write permissions
- Check that your store URL is correct (no trailing slash)

### Connection Errors

- Verify your WooCommerce store is accessible
- Check that the REST API is enabled in WooCommerce settings
- Ensure your store URL includes the protocol (https://)

## License

This project is open source and available under the MIT License.

## Support

For issues related to:
- **This interface**: Open an issue in this repository
- **WooCommerce API**: Check the [WooCommerce REST API documentation](https://woocommerce.github.io/woocommerce-rest-api-docs/)



