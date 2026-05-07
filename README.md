# Pusha CRM

Pusha CRM is now a lightweight Vite app with a premium SaaS dashboard feel. It now includes Supabase authentication for the login flow, while the CRM dashboard itself still runs on local mock data for now.

## Project Structure

```text
.
+-- .env.example
+-- .gitignore
+-- index.html
+-- package.json
+-- README.md
+-- src
    +-- data
    |   +-- mockData.js
    +-- main.js
    +-- styles.css
```

## Run Locally

Install dependencies and start the Vite dev server:

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

Preview the production build locally with:

```bash
npm run preview
```

## Vercel And Environment Variables

Add these variables in Vercel Project Settings and in a local `.env` file:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

Vite only exposes browser environment variables that start with `VITE_`.

If your Supabase project still uses the older anon key naming, the app also accepts:

```bash
VITE_SUPABASE_ANON_KEY=...
```

## Runtime Config Fallback

For static hosting environments where a local `.env` file is not available at build time, the app also loads
`/runtime-config.js` before booting.

That file can set:

```js
globalThis.__PUSHA_ENV__ = {
  VITE_SUPABASE_URL: "...",
  VITE_SUPABASE_PUBLISHABLE_KEY: "...",
};
```

Build-time `VITE_` variables still work, but `runtime-config.js` gives you a production fallback when the host does not inject them into the Vite build.

## Supabase Auth Setup

1. Copy `.env.example` to `.env`.
2. Paste in your Supabase project URL and publishable key.
3. In Supabase, open `Authentication -> Users` and make sure the user you created has a password set.
4. If email confirmation is enabled for your project, make sure that user is confirmed before testing sign-in.
5. Run `npm run dev` and sign in through the Pusha CRM login screen.

The app restores the user's session on refresh and keeps the dashboard behind authentication.

## What Is Included

- Supabase-backed email/password login flow with session restore and sign-out
- Responsive dashboard with KPI cards, animated counters, chart bars, activity, and tasks
- Leads page with search, status filters, tags, and lead detail drawer
- Clients page with profile cards and detail modal
- Deals pipeline with Kanban columns and drag-and-drop stage updates
- Tasks page with priorities and completion states
- Settings page with branding preview and placeholder company settings
- Skeleton loading states, smooth page transitions, hover states, and mobile navigation

## Replacing Dummy Data

All mock data lives in `src/data/mockData.js` and is imported into `src/main.js`.

To connect a real API later:

1. Replace the mock data import with API responses or service calls.
2. Keep the same data shapes where possible to avoid changing UI components.
3. Move state updates in `src/main.js` behind small service functions such as `getLeads()`, `getClients()`, `getDeals()`, and `getTasks()`.
4. Reuse the existing Supabase client for database queries and row-level security.

The UI stays intentionally framework-free, but Vite now provides a proper build pipeline for Vercel deployments and environment-based configuration.
