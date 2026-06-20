(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var button = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".site-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === current);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, position) {
            dot.addEventListener("click", function () {
                show(position);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initHorizontalScroll() {
        document.querySelectorAll(".section-block").forEach(function (section) {
            var list = section.querySelector(".horizontal-list");
            if (!list) {
                return;
            }
            section.querySelectorAll("[data-scroll]").forEach(function (button) {
                button.addEventListener("click", function () {
                    var direction = button.getAttribute("data-scroll") === "left" ? -1 : 1;
                    list.scrollBy({ left: direction * 420, behavior: "smooth" });
                });
            });
        });
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initFilters() {
        document.querySelectorAll(".filterable-list").forEach(function (list) {
            var scope = list.closest("main") || document;
            var input = scope.querySelector(".movie-filter-input");
            var select = scope.querySelector(".movie-filter-select");
            var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

            function filterCards() {
                var query = normalize(input ? input.value : "");
                var type = normalize(select ? select.value : "");
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-category")
                    ].join(" "));
                    var cardType = normalize(card.getAttribute("data-type"));
                    var queryMatch = !query || haystack.indexOf(query) !== -1;
                    var typeMatch = !type || cardType.indexOf(type) !== -1;
                    card.classList.toggle("is-hidden", !(queryMatch && typeMatch));
                });
            }

            if (input) {
                input.addEventListener("input", filterCards);
            }
            if (select) {
                select.addEventListener("change", filterCards);
            }
        });
    }

    window.startMoviePlayer = function (source) {
        var video = document.getElementById("movie-player");
        var overlay = document.getElementById("play-overlay");
        if (!video || !source) {
            return;
        }
        var loaded = false;
        var hlsInstance = null;

        function loadSource() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function showOverlay() {
            if (overlay) {
                overlay.classList.remove("is-hidden");
            }
        }

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        }

        function startPlayback() {
            loadSource();
            hideOverlay();
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    showOverlay();
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", startPlayback);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });
        video.addEventListener("play", hideOverlay);
        video.addEventListener("ended", showOverlay);
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        initMenu();
        initHero();
        initHorizontalScroll();
        initFilters();
    });
})();
