# Pusha CRM

Pusha CRM is a lightweight browser-based CRM demo with a premium SaaS dashboard feel. It uses local dummy data only and does not require a backend or build step.

## Project Structure

```text
.
+-- index.html
+-- README.md
+-- src
    +-- data
    |   +-- mockData.js
    +-- main.js
    +-- styles.css
```

## Run Locally

Open `index.html` directly in a browser.

If Node.js is installed later, you can also serve the folder with any static server, for example:

```bash
npx serve .
```

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

All mock data lives in `src/data/mockData.js` under `window.PUSHA_MOCK_DATA`.

To connect a real API later:

1. Replace `window.PUSHA_MOCK_DATA` with API responses.
2. Keep the same data shapes where possible to avoid changing UI components.
3. Move state updates in `src/main.js` behind small service functions such as `getLeads()`, `getClients()`, `getDeals()`, and `getTasks()`.
4. Add authentication around the login action once a backend exists.

The UI is intentionally framework-free for the first demo so it stays fast, easy to inspect, and simple to migrate into a fuller frontend stack later.
