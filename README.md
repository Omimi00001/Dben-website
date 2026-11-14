# DBEN Group redesign

A server-rendered Cloudflare Worker website. The design preserves DBEN's original black, white and red branding, original listing imagery, all 11 public properties, four projects, six services, nine team members, public agents, careers, categories, city pages, social content and the mortgage calculator.

## Local use

Use Node 22 or later. Run `npm install`, `npm run build`, `npm run check`, then `npm run preview`. Open http://localhost:4173. The production Worker is `dist/server/index.js`.

`build.cjs` renders each original public URL. `data.json` contains the audited source content; `assets/` contains optimized original images. `source-audit/` contains redacted source snapshots and a URL/feature inventory for comparison. No private account content is available in these snapshots.

## Vercel deployment

`vercel.json` selects the Other preset and runs `npm run build:vercel`. This emits Vercel Build Output API v3 with an explicit Node.js 22 handler. The handler imports the generated server Worker, preserving the existing page HTML, route handlers, forms, redirects and assets. It never imports the browser-only `app.js`. Run `npm run check:vercel` after building to verify cold-start, page responses, assets, favicon, redirects and form validation through the actual generated Node handler. The original `npm run build` / Sites Worker output remains available.

The original Vercel deployment auto-selected root `app.js` as its server entry point. Production logs showed `ReferenceError: matchMedia is not defined` during Node module loading, causing both `/` and `/favicon.ico` to return `FUNCTION_INVOCATION_FAILED` before any route could run. Do not remove browser APIs or guard away frontend initialization to address this: the server must use the generated server entry instead.

## Existing integrations

The enquiry and newsletter endpoints establish a fresh session with the existing DBEN website and forward allowed fields to its existing handlers. They never store submissions locally, never return an upstream session cookie to visitors, and only confirm success after an explicit `error:false` response from DBEN. Browser-native validation, server validation, same-origin checks, a honeypot for enquiries, and best-effort per-isolate throttling are included. The original forms, phone, email and WhatsApp remain available if DBEN changes or restricts its upstream service.

Login, password reset and Add Property redirect to the existing DBEN system, preserving existing accounts. Reviews are reproduced from the public source snapshot; writing reviews continues on the original site. The new saved collection is browser-local; existing wishlists remain on the original site.

Live chat loads DBEN's existing Tawk integration only when a visitor requests chat. Newsletter access is a deliberate dialog rather than an automatic interruption. Cookie preferences and saved places use localStorage. Optional analytics/marketing choices do not load any analytics or advertising scripts in this implementation.

The original URLs remain available. The original malformed `//cookie-policy` redirects to `/cookie-policy`; the broken local Instagram route `/dben_estate` redirects to the social page containing the verified original Instagram URL. Source 404s remain review items; no content was fabricated for them. Hosting/custom-domain migration requires control of dbengroup.com and its original server/DNS. Do not point DNS to this private preview without planning account and submission backend routing.

## Verification limits

The included checks exercise real rendered content, route and asset coverage, input validation, and mocked upstream submission routing. No real enquiry, newsletter subscription or authentication was submitted. Email delivery, the private account area, review authoring, third-party map availability and Tawk's account configuration need owner acceptance testing. The legacy cookie policy and generic career content are retained for review, not represented as newly verified company facts.

CSS provides the 3D building, pointer depth, transitions and progressive scroll reveals. Reduced-motion and touch visitors receive static fallbacks; there is no WebGL dependency. All content is server-rendered. Maps and chat are deferred to avoid blocking the page.
