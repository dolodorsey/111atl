# 111ATL

Event-first public website for 111ATL.

## Production
- Domain: `111atl.com`
- Existing Vercel project: `111atl`
- Git branch: `main`
- Backend: Supabase `KOLLECTIVE BOH`

## Public event source
`public.one_eleven_events`

Only rows with `published = true` are exposed to anonymous site visitors.

## Event-interest capture
`public.one_eleven_event_leads`

The browser has INSERT-only access through RLS. Public SELECT access is not granted.

## Site architecture
This is intentionally dependency-free static HTML/CSS/JS. It reads published events from Supabase at runtime and contains a matching launch-safe fallback event cache in `app.js`.

Deep links use `/events/:slug` and are rewritten by Vercel to the single event application shell.

## Current public event groups
- Labor Day Weekend
- Ball Series
- Winter Wonderland
- New Year's Eve
- Juneteenth ATL
