# TinyWins Parent Dashboard

This repository hosts the TinyWins parent-facing dashboard and the small GitHub Pages site that redirects to it.

## Structure

- `apps/parent-dashboard` – React + Vite app for parents to manage children, challenges, and wins.
- `site/` – static redirect for GitHub Pages.

## Development

1. `cd apps/parent-dashboard`
2. `npm install`
3. `npm run dev` to start a local development server.
4. `npm run build` to produce static files for deployment.

The `store` seeds in-memory data so the UI works on GitHub Pages without a backend.
