# AO Form Worker

Receives the free AO Score form submission from the website, validates,
runs cheap anti-spam, and emails the result to `ao@tailored-tools.com`
via Resend.

## One-time setup

```bash
# 1. Install wrangler if you haven't
npm install -g wrangler

# 2. Log in to the Cloudflare account that owns tailored-tools.com
wrangler login

# 3. From this directory, set the Resend API key as an encrypted secret
cd worker/ao-form
wrangler secret put RESEND_API_KEY
# Paste your Resend key when prompted (won't be echoed, won't appear in git).

# 4. Deploy
wrangler deploy
```

After the first deploy, the worker URL appears at the end of the
deploy output, something like:

```
Published ao-form
  https://ao-form.<account-subdomain>.workers.dev
```

That URL goes into the form `data-endpoint` attribute on
`index.html` and `/ao/index.html`.

## Subsequent updates

Edit `src/index.js` then:

```bash
wrangler deploy
```

That's it. New version live in ~2 seconds.

## Local development

```bash
wrangler dev
```

Hits `http://localhost:8787/ao-score`. Pair with the form on a local
dev server (or temporarily change `data-endpoint` to localhost) to
test end-to-end.

## What the Worker does

1. POST `/ao-score` only. Anything else returns 404 or 405.
2. CORS allow-listed to `https://tailored-tools.com` (configured in
   `wrangler.toml`'s `ALLOWED_ORIGINS`).
3. Validates: name, business, url, email present and well-formed.
4. Honeypot check: silently drops if `website_url_confirm` is filled.
5. Time check: silently drops if `elapsed_ms < 2000`.
6. Calls Resend `/emails` API to send the submission.
7. Returns `{ ok: true }` on success or `{ ok: false, error: "..." }`.

The honeypot and time checks return `ok: true` on bot detection so
bots don't retry, but no email is sent.

## What it does NOT do

- Store submissions. Each request is one email; nothing is persisted.
- Track. No cookies, no analytics, no fingerprinting.
- Rate-limit per-IP. Cloudflare's default protections cover the
  obvious abuse; add a Durable Object counter only if needed.
