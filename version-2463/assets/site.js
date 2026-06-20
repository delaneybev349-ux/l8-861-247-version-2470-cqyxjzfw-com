(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var toggle = document.querySelector(".nav-toggle");
        var nav = document.querySelector(".main-nav");
        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length > 1) {
            var active = 0;
            var show = function (index) {
                active = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === active);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === active);
                });
            };
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                });
            });
            window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        var searchInput = document.querySelector("#movieSearch");
        var typeFilter = document.querySelector("#typeFilter");
        var yearFilter = document.querySelector("#yearFilter");
        var regionFilter = document.querySelector("#regionFilter");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-search]"));
        var empty = document.querySelector(".search-empty");

        function normalize(value) {
            return (value || "").toString().trim().toLowerCase();
        }

        function applyFilters() {
            if (!cards.length) {
                return;
            }
            var q = normalize(searchInput && searchInput.value);
            var t = normalize(typeFilter && typeFilter.value);
            var y = normalize(yearFilter && yearFilter.value);
            var r = normalize(regionFilter && regionFilter.value);
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search"));
                var type = normalize(card.getAttribute("data-type"));
                var year = normalize(card.getAttribute("data-year"));
                var region = normalize(card.getAttribute("data-region"));
                var ok = (!q || text.indexOf(q) >= 0) && (!t || type === t) && (!y || year === y) && (!r || region.indexOf(r) >= 0);
                card.style.display = ok ? "" : "none";
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible ? "none" : "block";
            }
        }

        [searchInput, typeFilter, yearFilter, regionFilter].forEach(function (el) {
            if (el) {
                el.addEventListener("input", applyFilters);
                el.addEventListener("change", applyFilters);
            }
        });

        var shell = document.querySelector(".player-shell[data-stream]");
        if (shell) {
            var video = shell.querySelector("video");
            var cover = shell.querySelector(".play-cover");
            var stream = shell.getAttribute("data-stream");
            var started = false;
            var hls = null;

            function begin() {
                if (!video || !stream) {
                    return;
                }
                if (cover) {
                    cover.classList.add("is-hidden");
                }
                if (started) {
                    video.play().catch(function () {});
                    return;
                }
                started = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    video.play().catch(function () {});
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.src = stream;
                    video.play().catch(function () {});
                }
            }

            if (cover) {
                cover.addEventListener("click", begin);
            }
            video.addEventListener("click", function () {
                if (!started) {
                    begin();
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        }
    });
})();
