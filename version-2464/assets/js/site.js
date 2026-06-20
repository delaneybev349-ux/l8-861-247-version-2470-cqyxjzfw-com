(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var next = carousel.querySelector('[data-hero-next]');
        var prev = carousel.querySelector('[data-hero-prev]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('active', itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('active', itemIndex === index);
            });
        }

        function schedule() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                schedule();
            });
        }
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                schedule();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                schedule();
            });
        });
        show(0);
        schedule();
    });

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function bindFilter(input) {
        var selector = input.getAttribute('data-filter-target');
        var target = selector ? document.querySelector(selector) : null;
        if (!target) {
            return;
        }
        var cards = Array.prototype.slice.call(target.querySelectorAll('.movie-card'));
        var empty = document.querySelector('[data-empty-state]');

        function apply() {
            var query = normalize(input.value);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search') || card.textContent);
                var matched = !query || haystack.indexOf(query) !== -1;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('visible', visible === 0);
            }
        }

        input.addEventListener('input', apply);
        apply();
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    document.querySelectorAll('.filter-input').forEach(function (input) {
        if (query && !input.value) {
            input.value = query;
        }
        bindFilter(input);
    });
})();
