/*
 * Tailored Tools, scroll-aware sticky nav.
 * Three states:
 *   nav-at-top  applied when scrollY ~ 0; solid dark with a thick white rule.
 *   nav-solid   applied when nav overlaps an element marked data-nav-bg="light";
 *               solid dark, drops the glass so it doesn't go muddy over white.
 *   (default)   glassy translucent + thin white rule; over dark sections.
 */
(function () {
    var nav = document.querySelector('nav');
    if (!nav) return;
    var lightSections = document.querySelectorAll('[data-nav-bg="light"]');
    var navHeight = nav.getBoundingClientRect().height;

    function update() {
        nav.classList.toggle('nav-at-top', window.scrollY < 4);

        var overLight = false;
        for (var i = 0; i < lightSections.length; i++) {
            var r = lightSections[i].getBoundingClientRect();
            // Section currently intersects the nav region (top 0 to navHeight).
            if (r.top <= navHeight && r.bottom > 0) {
                overLight = true;
                break;
            }
        }
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
