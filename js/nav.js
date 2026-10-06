/*
 * WhatsApp contact: an icon button beside the hamburger on phones, on every
 * page that loads this script. Where the nav's own CTA isn't already WhatsApp
 * (the homepage, whose CTA is the brief), a WhatsApp icon joins the desktop
 * nav as well.
 */
(function () {
    var inner = document.querySelector('.nav-inner');
    if (!inner) return;
    var href = 'https://wa.me/447356264673?text=Hi%20James%2C%20I%20found%20you%20on%20tailored-tools.com.%0A%0AI%27d%20like%20help%20with%3A%20%0A%0AMy%20business%20is%3A%20%0AWhat%20it%20does%3A%20%0AMy%20website%20%28if%20I%20have%20one%29%3A%20%0A%0AMy%20name%20is%20';
    var icon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.4.8 3.2.6a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>';
    var btn = document.createElement('a');
    btn.className = 'nav-wa'; btn.href = href; btn.target = '_blank'; btn.rel = 'noopener';
    btn.setAttribute('aria-label', 'Message Tailored Tools on WhatsApp');
    btn.innerHTML = icon;
    inner.appendChild(btn);
    var cta = inner.querySelector('.nav-cta');
    if (cta && cta.href.indexOf('wa.me') === -1) {
        var li = document.createElement('li');
        li.innerHTML = '<a class="nav-wa-desk" href="' + href + '" target="_blank" rel="noopener" aria-label="Message Tailored Tools on WhatsApp" title="WhatsApp">' + icon + '</a>';
        cta.parentNode.parentNode.insertBefore(li, cta.parentNode);
    }
})();

/*
 * Tailored Tools, scroll-aware sticky nav.
 * Three states:
 *   nav-at-top  applied when scrollY ~ 0; solid dark + thick white rule.
 *   nav-solid   applied when nav overlaps a light-background element;
 *               solid dark, drops the glass so it doesn't go muddy over white.
 *   (default)   glassy translucent + thin white rule; over dark sections.
 *
 * Detection order:
 *   1. Explicit data-nav-bg="light" on any element overlapping the nav region.
 *   2. Auto-detect: probe the element behind the nav midpoint and walk up the
 *      DOM until we find a non-transparent background-color, then compute its
 *      luminance (light = > 0.6).
 * data-nav-bg="dark" forces dark state (skip auto-detect for that section,
 * useful for gradient hero blocks where computed colour is unreliable).
 */
(function () {
    var nav = document.querySelector('nav');
    if (!nav) return;
    var navHeight = nav.getBoundingClientRect().height;

    function isLightColor(bg) {
        if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') return null;
        var m = bg.match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        var parts = m[1].split(',').map(parseFloat);
        var a = parts.length > 3 ? parts[3] : 1;
        if (a < 0.5) return null; // mostly transparent, keep walking
        var lum = (0.299 * parts[0] + 0.587 * parts[1] + 0.114 * parts[2]) / 255;
        return lum > 0.6;
    }

    function autoDetectLight() {
        var probe = document.elementFromPoint(window.innerWidth / 2, navHeight + 4);
        if (!probe || probe === nav || nav.contains(probe)) return false;
        var cur = probe;
        while (cur && cur !== document.documentElement) {
            // data-nav-bg overrides auto-detect on this ancestor and stops walk
            var explicit = cur.getAttribute && cur.getAttribute('data-nav-bg');
            if (explicit === 'light') return true;
            if (explicit === 'dark')  return false;
            var cs = getComputedStyle(cur);
            // A gradient or image background hides whatever's behind it. Don't
            // walk further up (would hit body white). Treat as not-light unless
            // an explicit marker tells us otherwise.
            if (cs.backgroundImage && cs.backgroundImage !== 'none') return false;
            var lit = isLightColor(cs.backgroundColor);
            if (lit !== null) return lit;
            cur = cur.parentElement;
        }
        return false;
    }

    function update() {
        nav.classList.toggle('nav-at-top', window.scrollY < 4);

        // Explicit data-nav-bg="light" elements take precedence.
        var explicitLight = document.querySelectorAll('[data-nav-bg="light"]');
        var overLight = false;
        for (var i = 0; i < explicitLight.length; i++) {
            var r = explicitLight[i].getBoundingClientRect();
            if (r.top <= navHeight && r.bottom > 0) { overLight = true; break; }
        }
        if (!overLight) overLight = autoDetectLight();
        nav.classList.toggle('nav-solid', overLight);
    }

    var ticking = false;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
            update();
            ticking = false;
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () {
        navHeight = nav.getBoundingClientRect().height;
        update();
    }, { passive: true });
    update();
})();
