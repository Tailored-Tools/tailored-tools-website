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
