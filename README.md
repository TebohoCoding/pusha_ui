# Pusha CRM

Pusha CRM is now a lightweight Vite app with a premium SaaS dashboard feel. It still uses local dummy data for now, but it is set up for a production-style frontend workflow and ready for Supabase environment variables next.

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

For the upcoming Supabase auth work, add these variables in Vercel Project Settings and in a local `.env` file:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Vite only exposes browser environment variables that start with `VITE_`.

## What Is Included

- Premium login screen for Pusha CRM
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
4. Add authentication around the login action with Supabase Auth.

The UI stays intentionally framework-free, but Vite now provides a proper build pipeline for Vercel deployments and environment-based configuration.
