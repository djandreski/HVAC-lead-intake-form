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

Run `npm run build`. The build produces a Cloudflare Worker in `dist/server`
with the static site assets in `dist/client`.

Deploy the Worker after authenticating Wrangler:

```powershell
npx wrangler deploy --config dist/server/wrangler.json
```

In non-interactive environments, set `CLOUDFLARE_API_TOKEN` before deploying.
Use a scoped token with permission to edit Cloudflare Workers scripts, and do
not commit the token. This project is deployed as a Cloudflare Worker, not a
Cloudflare Pages project.
