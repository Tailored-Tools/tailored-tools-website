/*
 * Tailored Tools, scroll-aware sticky nav.
 * Default nav is glassy translucent (works over dark sections).
 * When the sticky nav overlaps a section marked data-nav-bg="light",
 * we add .nav-solid so the bar becomes opaque dark, preventing the
 * muddy grey-blue look that translucency produces over white.
 */
(function () {
    var nav = document.querySelector('nav');
    if (!nav) return;
    var lightSections = document.querySelectorAll('[data-nav-bg="light"]');
    if (lightSections.length === 0) return;

    var navHeight = nav.getBoundingClientRect().height;

    function update() {
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
