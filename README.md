# Lavender Home OS — Static Edition

Same premium OS-style dashboard, rebuilt as **plain HTML/CSS/JavaScript with zero build
tools**. No npm, no bundler, no server required.

There is **no mock/demo data anywhere in this build**. The browser talks to your router
directly; if it can't be reached, the dashboard shows a connection error instead of a
device list.

## Run it

Just open `index.html` in a browser. That's it.

Or serve it with any static file server if you prefer (optional, not required):

```bash
npx serve .
```

## Deploy to Cloudflare Pages / Vercel

1. Push this folder to a GitHub/GitLab repo (or drag-and-drop it in the dashboard).
2. Create project → Connect repo (or "Upload" for drag-and-drop).
3. **Build command:** leave empty. **Output directory:** `/` (repo root).
4. Deploy. Done — no build step runs, because there isn't one.

`_headers` is included for a few safe default security headers (Cloudflare Pages
picks this up automatically; Vercel ignores it, which is fine).

## What's included

| Page | File |
| --- | --- |
| Overview | `index.html` |
| Devices | `devices.html` |
| Analytics | `analytics.html` |
| Logs | `logs.html` |
| GRIM (AI) | `ai.html` |
| Diagnostics | `diagnostics.html` |
| Settings | `settings.html` |

Shared code lives in `assets/js/`:
- `router-client.js` — talks to the router directly from the browser: login,
  fetches, CORS/mixed-content detection, full console logging, diagnostics
  pub/sub. **Never returns fabricated data** — returns `null` on any failure.
- `store.js` — polls `router-client.js` every N seconds. No fallback of any kind.
- `layout.js` — renders the shared header/sidebar/mobile nav, the connection
  banner, and the login dialog on every page.
- `settings-store.js` — localStorage-backed app settings (router host, GRIM
  API key, refresh rate). Router **credentials** are stored separately by
  `router-client.js`, entered only via the login dialog.
- `pages/*.js` — one file per page, including `pages/diagnostics.js`.

## How the live connection works

1. On load, `router-client.js` checks for saved credentials in localStorage.
2. If there are none, the connection banner + login dialog prompt you to enter
   your router's username/password. Submitting POSTs directly from your
   browser to your router's login endpoint.
3. Every 3 seconds, `store.js` asks `router-client.js` for a fresh snapshot.
   Every request and response (or failure) is logged to the browser console
   and recorded in the diagnostics store.
4. If anything fails, the dashboard shows **exactly why** — "Blocked by
   browser security (CORS)", "Blocked by browser security (mixed content)",
   or "Router unavailable" — via the banner and the Diagnostics page. It never
   silently substitutes fake devices.

## Important limitations of a fully static site

This version has **no backend**, which matters for two reasons:

**1. Live router data will very likely be blocked by the browser.**
Home routers (including Huawei HG8145X6 firmware) generally don't send
`Access-Control-Allow-Origin` headers, so the browser blocks the response
even if the request reaches the router (CORS). If this site is served over
https (Cloudflare Pages, Vercel) and your router is `http://192.168.1.1`,
that's also blocked as mixed content — browsers refuse it outright. Open
`diagnostics.html` to see exactly which of these is happening, with the
literal request/response/error logged. The only way live data reliably works
is opening this site from a device on the same LAN as the router, over
plain http, from a router whose firmware happens to send permissive CORS
headers (uncommon) — or by adding a small same-origin proxy later.

**2. GRIM (the AI page) calls the Anthropic API directly from your browser.**
You paste your API key into Settings; it's stored only in this browser's
`localStorage` and sent directly to `api.anthropic.com` with each question.
Fine for a personal, single-user dashboard — don't deploy this publicly with
a real key saved in it.

## Design tokens

| Token | Value |
| --- | --- |
| Background | `#151515` |
| Cards | `#1D1D1D` |
| Accent | `#B38CFF` |
| Success | `#4CFF78` |
| Error | `#FF5C5C` |

## Browser support

Modern evergreen browsers (Chrome, Edge, Firefox, Safari). Uses `fetch`, `localStorage`,
CSS `backdrop-filter`, and ES2017+ syntax — no transpilation, so very old browsers (IE11)
are not supported.
