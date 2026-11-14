# DBEN Group redesign — audit and handover

Source snapshot: 13 November 2026. Original: https://www.dbengroup.com/

## Delivered

- 74 rendered routes, retaining all accessible public HTML page paths except three account routes that continue securely on DBEN’s existing system.
- All 11 properties, four projects, six service groups and their 24 service items, four process steps, nine team members, mission, vision, values, founding date, offices and contact details.
- Three accessible agent profiles and the agent directory; six career detail pages; news categories, tags, property categories and all property/project city routes. No news articles were exposed by the source crawl.
- Social links, inspection schedule, customer-support WhatsApp, original property/payment information images, maintenance image, cookie policy and all four source announcements.
- 70 original site-hosted images, downloaded and optimised to WebP where applicable. Total local imagery: 3.66 MiB. Emoji images are represented by their equivalent text symbols; the original external SSLCommerz image/link remains in its listing.
- Responsive layouts; reduced-motion CSS; CSS 3D building, gentle depth and scroll reveals; original imagery; lazy-loaded secondary images and maps. Content renders without waiting for client JavaScript.

## Audit scope and comparison

Crawled 91 unique URLs: 88 successful responses and three original 404s. This includes the sitemap index and 11 child XML sitemaps, menu/footer links, query links, and recursively discovered public pages. Public newsletter and review AJAX endpoints were inspected separately. Contact and cookie policy were recovered through direct requests after the initial web fetch failed. No credentials were used and no private account pages could be audited.

The checks passed 829 assertions, including every accessible original HTML URL, every local image reference, a single primary heading on every rendered page, zero unresolved internal page links, all 81 retained property/project content sections and nine team portraits. Generic public pages use their sanitised original main content. Text comparison found three editorial consolidations only: the free-consultation CTA was shortened, and Vision Statement / Mission Statement became Our vision / Our mission; the associated unique information is retained.

Browser verification covered desktop, 390px mobile and 820px tablet layouts; no horizontal overflow on inspected pages; keyword/category/budget filtering; price sorting; saved places; 11 mapped property locations; galleries; newsletter dialog; mobile/tablet navigation; and calculator schedules. A zero-interest ₦8m loan over 20 years returned ₦33,333/month with 240 schedule rows and zero total interest. A temporary JavaScript selector issue found during QA was fixed and the affected flows were retested.

## Functionality and integrations

| Feature | Implementation and verification |
|---|---|
| Property/project exploration | Search, location/category/project filters, price/area/room/floor/block/flat refinements, reset, original sort choices, grid/list, map browsing and result count. Fields not supplied by a listing are treated as unknown, not invented. All results fit the smallest original 15-item page size. |
| Galleries | All original listing images in keyboard-accessible native dialogs, previous/next and count; verified on mobile. |
| Enquiries and tour date | Same-origin Worker endpoint fetches a fresh DBEN session/CSRF token and forwards allowlisted fields to original contact/send or send-consult. Only explicit upstream success confirms delivery. Failure keeps the message and offers original forms, phone and email. Server/session forwarding tested with mocked upstream responses; no real message was sent. |
| Newsletter | Original weekly-updates title, text and image; opt-in dialog, email field, subscription route and “don’t show again” choice. Existing subscription endpoint is used with fresh session/CSRF. Mock-tested, no real subscription sent. |
| Accounts/Add Property/password reset | Redirect to the existing DBEN server. Existing identities and credentials are not copied. Private flows were not audited or changed. |
| Wishlist | New device-local saved collection; explicit link retains access to original wishlist. No existing wishlist data was migrated. |
| Reviews | Existing public review fetched and retained: Sports Island Estate’s review by Dev- Kelvin, rating context and source-time wording. Other fetched review lists were empty. Writing/signing in for reviews continues on original website. |
| Mortgage calculator | Both decreasing-balance and fixed-payment methods, loan slider/amount, term, interest, disbursement date, summary, chart and full amortization table. Date controls the schedule. Estimates exclude fees. |
| Live chat | Existing Tawk embed is loaded when requested, with phone/email fallback. Third-party account availability is outside this build’s control. |
| Contact actions/maps | Original telephone, email, listing-specific WhatsApp links, support WhatsApp, office directions and original listing coordinates. Google map iframes deferred. |
| Cookies | Essential/analytics/marketing preference controls, persisted locally; no optional analytics/advertising script is introduced. Original cookie-policy text remains available for owner review. |
| URL continuity | Public paths retained. //cookie-policy → /cookie-policy, /dben_estate → /social-media-link-tree. Account/feed paths continue on original system. An XML sitemap and genuine 404 response are included. |

## Items requiring owner review

1. /agents/dev returned 404. No agent biography was invented.
2. /dben_estate returned 404; the social link page exposes a working-format Instagram address instead. The redirect uses that original social page.
3. //cookie-policy returned 404; /cookie-policy works and is the corrected destination.
4. About page illustration uses the unavailable https://flex-home.test/storage/general/asset-3-at-3x.png. Its source is identified in the redesign; core-values text is retained.
5. Facebook’s original destination is only #. It is labelled unconfigured rather than made into an invented social link.
6. Contact consent references Terms and Privacy Policy without supplying policy destinations. The wording is retained and links to the original form for review. The original cookie policy describes PHP/Laravel sessions; it needs owner-approved legal revision for a new production host.
7. Some source listing metadata appears inconsistent: land listings carry house amenities/floor plans; the duplex metadata lists nine floors; categories overlap; promotional prices differ from regular prices; one listing includes SSLCommerz artwork. These details are retained, not silently corrected. Confirm all prices, promotions, locations, specifications and availability.
8. The six published career entries contain global locations, dollar salaries and generic technology/design descriptions. They are retained with source-context notes, not treated as newly verified vacancies.
9. Four time-sensitive promotional announcements lack dates. They remain available under Latest announcements with confirmation guidance.
10. Account authentication, uploads/Add Property, existing wishlist state, review posting, actual enquiry email delivery, newsletter confirmation and live-chat account configuration require owner acceptance testing. No live external message or subscription was sent. This is a functional private preview with backend handoffs, not a verified replacement of DBEN’s production server.

## Domain migration

The existing dbengroup.com domain and server were not modified. The preview is private. Moving the production domain requires DNS/server access and an agreed backend origin for accounts, forms, reviews and feeds. Keeping the hard-coded backend origin as www.dbengroup.com while replacing that origin would create routing loops; configure a separate legacy backend origin before migration, or migrate those services properly. No original accounts or private records were migrated.

## Files

- URL-inventory.csv: all 91 crawled URLs and handling.
- Link-inventory.csv: all HTML anchor occurrences in successfully fetched pages.
- Image-inventory.csv: every downloaded local original asset and its new path/size.
- Form-inventory.json: original form actions/methods/field names; no session values.
- DBEN-website-source.zip: source, optimised assets, redacted source snapshots, build/preview scripts and checks.

Run npm install, npm run build, npm run check, npm run preview with Node 22+. The build outputs dist/server/index.js.
