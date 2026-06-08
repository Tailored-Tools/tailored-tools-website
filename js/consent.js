/*
 * Tailored Tools, consent gate for third-party embeds.
 * UK GDPR + PECR compliant: no non-essential third-party load before consent.
 * Strictly-necessary (Cloudflare security) cookies load regardless under
 * PECR Regulation 6(4).
 */
(function () {
    var KEY = 'tt-consent';
    var stored = null;
    try { stored = localStorage.getItem(KEY); } catch (e) { stored = null; }

    function loadTally() {
        if (typeof window.Tally !== 'undefined') {
            window.Tally.loadEmbeds();
            return;
        }
        var existing = document.querySelector('script[src="https://tally.so/widgets/embed.js"]');
        if (existing) return;
        var s = document.createElement('script');
        s.src = 'https://tally.so/widgets/embed.js';
        s.async = true;
        s.onload = function () {
            document.querySelectorAll('iframe[data-tally-src]:not([src])').forEach(function (e) {
                e.src = e.dataset.tallySrc;
            });
        };
        document.body.appendChild(s);
    }

    function showBlockedPlaceholders() {
        document.querySelectorAll('iframe[data-tally-src]:not([src])').forEach(function (frame) {
            var wrap = frame.parentElement;
            if (!wrap) return;
            wrap.innerHTML = '<div class="embed-blocked" role="region" aria-label="Free AO Score form, awaiting consent">' +
                '<strong>Free AO Score form</strong>' +
                'Hosted by <a href="https://tally.so" target="_blank" rel="noopener">Tally</a> (Belgium). Session cookies only, no analytics. ' +
                'Load it below, or <a href="mailto:hello@tailored-tools.com">email us</a> for an AO Score.' +
                '<br><button type="button" data-consent-accept>Load the form</button>' +
                '</div>';
        });
    }

    function setConsent(granted) {
        try { localStorage.setItem(KEY, granted ? 'granted' : 'denied'); } catch (e) { /* ignore */ }
        var banner = document.getElementById('consent-banner');
        if (banner) banner.classList.remove('visible');
        if (granted) {
            location.reload();
        } else {
            showBlockedPlaceholders();
        }
    }

    function buildBanner() {
        if (document.getElementById('consent-banner')) return;
        var b = document.createElement('div');
        b.id = 'consent-banner';
        b.className = 'consent-banner';
        b.setAttribute('role', 'dialog');
        b.setAttribute('aria-label', 'Consent for third-party embeds');
        b.innerHTML =
            '<h3>Third-party embeds</h3>' +
            '<p>We use Cloudflare for site security (strictly necessary). ' +
            'Forms on this site are hosted by Tally and may set session cookies. ' +
            'No analytics, no marketing trackers. ' +
            '<a href="/privacy.html">Read the policy</a>.</p>' +
            '<div class="consent-actions">' +
            '<button type="button" class="consent-decline" data-consent-decline>Decline</button>' +
            '<button type="button" class="consent-accept" data-consent-accept>Accept</button>' +
            '</div>';
        document.body.appendChild(b);
        requestAnimationFrame(function () { b.classList.add('visible'); });
    }

    document.addEventListener('click', function (ev) {
        if (ev.target.matches('[data-consent-accept]')) {
            ev.preventDefault();
            setConsent(true);
        } else if (ev.target.matches('[data-consent-decline]')) {
            ev.preventDefault();
            setConsent(false);
        }
    });

    if (stored === 'granted') {
        loadTally();
    } else if (stored === 'denied') {
        showBlockedPlaceholders();
    } else {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', buildBanner);
        } else {
            buildBanner();
        }
    }
})();
