# Summit Home Services landing page

Static residential HVAC estimate landing page built with Vinext and React.

## Local development

1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_MAKE_WEBHOOK_URL` to the Make.com production webhook URL.
3. Run `npm install` and `npm run dev`.

The webhook must accept cross-origin JSON `POST` requests and return a
browser-readable 2xx response. The page treats the webhook URL as public and
sends no credentials.

## Production build

Run `npm run build`. Static output is written to `dist/client` for deployment to
Cloudflare.

For a direct Cloudflare Pages upload, run
`npx wrangler pages deploy dist/client --project-name summit-home-services` after
authenticating Wrangler.
