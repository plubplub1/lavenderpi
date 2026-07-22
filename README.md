# Lavender Home OS — Static Edition

Same premium OS-style dashboard, rebuilt as **plain HTML/CSS/JavaScript with zero build
tools**. No npm, no bundler, no server required.

## Run it

Just open `index.html` in a browser. That's it.

Or serve it with any static file server if you prefer (optional, not required):

```bash
npx serve .
```

## Deploy to Cloudflare Pages

1. Push this folder to a GitHub/GitLab repo (or drag-and-drop it in the dashboard).
2. Cloudflare Pages → Create project → Connect repo (or "Upload assets" for drag-and-drop).
3. **Build command:** leave empty. **Output directory:** `/` (repo root).
4. Deploy. Done — no build step runs, because there isn't one.

`_headers` is included for a few safe default security headers; delete it if you don't want them.

## What's included

| Page | File |
| --- | --- |
| Overview | `index.html` |
| Devices | `devices.html` |
| Analytics | `analytics.html` |
| Logs | `logs.html` |
| GRIM (AI) | `ai.html` |
| Settings | `settings.html` |

Shared code lives in `assets/js/`:
- `mock-data.js` — realistic demo data generator (default data source)
- `router-client.js` — best-effort **live** Huawei HG8145X6 client, browser-side
- `store.js` — polls every N seconds, tries live data, falls back to mock automatically
- `layout.js` — renders the shared header/sidebar/mobile nav on every page
- `settings-store.js` — localStorage-backed settings (router creds, GRIM API key, refresh rate)
- `pages/*.js` — one file per page

## Important limitations of a fully static site

This version has **no backend**, which changes two things from the original Next.js app:

**1. Live router data will very likely not work from the browser.**
Home routers (including Huawei HG8145X6 firmware) generally don't send
`Access-Control-Allow-Origin` headers, so browsers block the response even if the
request reaches the router. If you deploy this on Cloudflare Pages (https), calling an
`http://192.168.1.1` router is also blocked as mixed content. `router-client.js` still
implements the attempt (and documents the exact endpoints it guesses at, marked `TODO
verify`) so it's ready to work in setups where these restrictions don't apply, and so
there's a clear place to wire in a local proxy later if you build one. Until then, the
dashboard runs on realistic demo data automatically.

**2. GRIM (the AI page) calls the Anthropic API directly from your browser.**
You paste your API key into Settings; it's stored only in this browser's
`localStorage` and sent directly to `api.anthropic.com` with each question. This is
fine for a personal, single-user dashboard, but:
- Don't deploy this publicly with a real key saved in it — anyone with access to that
  browser/device could read the key from localStorage or dev tools.
- For a shared or public deployment, put a small backend (even a one-file Cloudflare
  Worker) in front of the Anthropic API to keep the key server-side instead.

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
