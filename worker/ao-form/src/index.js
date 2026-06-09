/**
 * Tailored Tools, AO Score submission Worker.
 *
 * Receives a POST from the AO Score form on tailored-tools.com,
 * validates input, runs cheap anti-spam, and emails the submission
 * to ao@tailored-tools.com via Resend.
 *
 * Env (set via wrangler):
 *   RESEND_API_KEY  (secret)  Resend API key.
 *   FROM_EMAIL                Verified sender, defaults in wrangler.toml.
 *   TO_EMAIL                  Recipient, defaults in wrangler.toml.
 *   ALLOWED_ORIGINS           Comma-separated list of CORS-allowed origins.
 */
export default {
    async fetch(request, env) {
        const origin = request.headers.get('origin') || '';
        const corsHeaders = buildCorsHeaders(origin, env.ALLOWED_ORIGINS || '');

        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders });
        }

        if (request.method !== 'POST') {
            return json({ ok: false, error: 'method_not_allowed' }, 405, corsHeaders);
        }

        if (new URL(request.url).pathname !== '/ao-score') {
            return json({ ok: false, error: 'not_found' }, 404, corsHeaders);
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return json({ ok: false, error: 'invalid_json' }, 400, corsHeaders);
        }

        const validation = validate(body);
        if (!validation.ok) {
            return json({ ok: false, error: validation.error }, 400, corsHeaders);
        }

        // Honeypot, anything in this field means a bot filled it. Pretend success
        // so the bot doesn't retry; just don't send the email.
        if (body.website_url_confirm && body.website_url_confirm.trim() !== '') {
            return json({ ok: true }, 200, corsHeaders);
        }

        // Submission must be at least 2 seconds after form-load. Bots fill
        // forms in milliseconds; humans don't.
        const elapsed = Number(body.elapsed_ms);
        if (!Number.isFinite(elapsed) || elapsed < 2000) {
            return json({ ok: true }, 200, corsHeaders);
        }

        const subject = `AO Score request, ${truncate(body.business, 60)}`;
        const text = renderText(body, request);
        const html = renderHtml(body, request);

        // Trim the key defensively, copy-paste sometimes carries whitespace
        // or a trailing newline which makes the Authorization header invalid.
        const apiKey = String(env.RESEND_API_KEY || '').trim();
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: env.FROM_EMAIL,
                to: [env.TO_EMAIL],
                reply_to: body.email,
                subject,
                text,
                html,
            }),
        });

        if (!res.ok) {
            const detail = await res.text();
            console.error('resend_failed', res.status, detail);
            return json({ ok: false, error: 'send_failed' }, 502, corsHeaders);
        }

        return json({ ok: true }, 200, corsHeaders);
    },
};

function validate(body) {
    if (!body || typeof body !== 'object') return { ok: false, error: 'invalid_body' };
    const name = (body.name || '').trim();
    const business = (body.business || '').trim();
    const url = (body.url || '').trim();
    const email = (body.email || '').trim();
    if (!name || name.length > 200) return { ok: false, error: 'invalid_name' };
    if (!business || business.length > 200) return { ok: false, error: 'invalid_business' };
    if (!url || url.length > 500) return { ok: false, error: 'invalid_url' };
    if (!isUrl(url)) return { ok: false, error: 'invalid_url_format' };
    if (!email || email.length > 200 || !isEmail(email)) return { ok: false, error: 'invalid_email' };
    return { ok: true };
}

function isUrl(s) {
    try {
        const u = new URL(s.startsWith('http') ? s : `https://${s}`);
        return /^https?:$/.test(u.protocol) && !!u.hostname && u.hostname.includes('.');
    } catch { return false; }
}

function isEmail(s) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function truncate(s, n) {
    s = String(s || '');
    return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

function escapeHtml(s) {
    return String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderText(b, request) {
    const cf = request.cf || {};
    return [
        'New AO Score request',
        '',
        `Name:     ${b.name}`,
        `Business: ${b.business}`,
        `URL:      ${b.url}`,
        `Email:    ${b.email}`,
        '',
        b.message ? `Message:\n${b.message}\n` : '',
        '---',
        `Submitted: ${new Date().toISOString()}`,
        `Country:   ${cf.country || 'unknown'}`,
        `City:      ${cf.city || 'unknown'}`,
    ].join('\n');
}

function renderHtml(b, request) {
    const cf = request.cf || {};
    return `<!doctype html>
<html><body style="font-family:Inter,-apple-system,sans-serif;color:#203a4c;line-height:1.6;">
<h2 style="color:#0D1B2A;">New AO Score request</h2>
<table cellpadding="6" style="border-collapse:collapse;">
  <tr><td><strong>Name</strong></td><td>${escapeHtml(b.name)}</td></tr>
  <tr><td><strong>Business</strong></td><td>${escapeHtml(b.business)}</td></tr>
  <tr><td><strong>URL</strong></td><td><a href="${escapeHtml(b.url)}">${escapeHtml(b.url)}</a></td></tr>
  <tr><td><strong>Email</strong></td><td><a href="mailto:${escapeHtml(b.email)}">${escapeHtml(b.email)}</a></td></tr>
</table>
${b.message ? `<h3 style="color:#0D1B2A;">Message</h3><p style="white-space:pre-wrap;">${escapeHtml(b.message)}</p>` : ''}
<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
<p style="font-size:12px;color:#5a6a7a;">
  Submitted: ${new Date().toISOString()}<br>
  Country: ${escapeHtml(cf.country || 'unknown')} &middot; City: ${escapeHtml(cf.city || 'unknown')}
</p>
</body></html>`;
}

function buildCorsHeaders(origin, allowedCsv) {
    const allowed = (allowedCsv || '').split(',').map(s => s.trim()).filter(Boolean);
    const headers = {
        'Vary': 'Origin',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
    };
    if (allowed.includes(origin)) {
        headers['Access-Control-Allow-Origin'] = origin;
    }
    return headers;
}

function json(body, status, extra) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json', ...extra },
    });
}
