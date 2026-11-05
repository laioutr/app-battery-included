import { fileURLToPath } from 'node:url';
import srcModule from '../src/module';

const ngrokUrl = 'https://example.ngrok.app';

export default defineNuxtConfig({
  modules: [
    srcModule,
    '@pinia/nuxt', // Added to show in devtools
    '@laioutr-app/shopify',
    '@laioutr-core/frontend-core',
    '@laioutr-core/orchestr',
    '@laioutr-core/devtools',
  ],
  alias: {
    '@laioutr/app-battery-included': fileURLToPath(new URL('../src', import.meta.url)),
  },
  devtools: { enabled: true },
  telemetry: false,
  compatibilityDate: '2024-11-11',
  '@laioutr/app-battery-included': {
    baseURL: 'https://api.batteryincluded.io',
    collection: import.meta.env.BATTERY_INCLUDED_COLLECTION,
    apiKey: import.meta.env.BATTERY_INCLUDED_X_BI_API_KEY,
  },
  '@laioutr-app/shopify': {
    shopId: import.meta.env.SHOPIFY_DEMO_SHOP_ID,
    privateAccessKey: import.meta.env.SHOPIFY_DEMO_PRIVATE_ACCESS_TOKEN,
    adminAccessToken: import.meta.env.SHOPIFY_DEMO_ADMIN_TOKEN,
    storeDomain: import.meta.env.SHOPIFY_DEMO_STORE_DOMAIN,
    customerAccountApiClientId: import.meta.env.SHOPIFY_DEMO_CUSTOMER_ACCOUNT_API_CLIENT_ID,
    customerAccountApiClientSecret: import.meta.env.SHOPIFY_DEMO_CUSTOMER_ACCOUNT_API_CLIENT_SECRET,
    // Full ngrok URL: in local dev the tunnel host is not the resolved project domain.
    redirectUri: import.meta.env.SHOPIFY_REDIRECT_URI || `${ngrokUrl}/app-shopify/auth/callback`,
  },
});
