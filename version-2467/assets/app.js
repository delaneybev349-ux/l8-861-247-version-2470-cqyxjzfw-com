(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector(".menu-toggle");
        var mobileNav = document.querySelector(".mobile-nav");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                var isOpen = mobileNav.classList.toggle("open");
                toggle.setAttribute("aria-expanded", String(isOpen));
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
            var thumbs = Array.prototype.slice.call(hero.querySelectorAll(".hero-thumb"));
            var prev = hero.querySelector(".hero-prev");
            var next = hero.querySelector(".hero-next");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === index);
                });
                thumbs.forEach(function (thumb, thumbIndex) {
                    thumb.classList.toggle("active", thumbIndex === index);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    start();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    start();
                });
            }

            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            show(0);
            start();
        }

        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var input = scope.querySelector("[data-card-search]");
            var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-button]"));
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var activeFilter = "all";

            function applyFilter() {
                var query = input ? input.value.trim().toLowerCase() : "";
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    var matchesQuery = !query || text.indexOf(query) !== -1;
                    var matchesFilter = activeFilter === "all" || text.indexOf(activeFilter.toLowerCase()) !== -1;
                    card.classList.toggle("hidden", !(matchesQuery && matchesFilter));
                });
            }

            if (input) {
                input.addEventListener("input", applyFilter);
            }

            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    activeFilter = button.getAttribute("data-filter-button") || "all";
                    buttons.forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    applyFilter();
                });
            });
        });
    });
})();
