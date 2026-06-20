(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startHero() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startHero();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startHero();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startHero();
            });
        }

        showSlide(0);
        startHero();
    }

    var filterPanel = document.querySelector('[data-filter-panel]');

    if (filterPanel) {
        var searchInput = filterPanel.querySelector('[data-page-search]');
        var yearSelect = filterPanel.querySelector('[data-year-filter]');
        var typeSelect = filterPanel.querySelector('[data-type-filter]');
        var chips = Array.prototype.slice.call(filterPanel.querySelectorAll('[data-chip]'));
        var count = filterPanel.querySelector('[data-filter-count]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-grid] .movie-card'));
        var activeChip = '';

        function getText(card) {
            return [
                card.dataset.title,
                card.dataset.type,
                card.dataset.year,
                card.dataset.region,
                card.dataset.genre,
                card.dataset.tags
            ].join(' ').toLowerCase();
        }

        function applyFilters() {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var year = yearSelect ? yearSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = getText(card);
                var matched = true;

                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }

                if (year && card.dataset.year !== year) {
                    matched = false;
                }

                if (type && card.dataset.type !== type) {
                    matched = false;
                }

                if (activeChip && text.indexOf(activeChip.toLowerCase()) === -1) {
                    matched = false;
                }

                card.classList.toggle('is-hidden', !matched);

                if (matched) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = '显示 ' + visible + ' 部影片';
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', applyFilters);
        }

        if (yearSelect) {
            yearSelect.addEventListener('change', applyFilters);
        }

        if (typeSelect) {
            typeSelect.addEventListener('change', applyFilters);
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                activeChip = chip.dataset.chip || '';
                chips.forEach(function (item) {
                    item.classList.toggle('is-active', item === chip);
                });
                applyFilters();
            });
        });
    }

    var player = document.querySelector('[data-player]');

    if (player) {
        var video = player.querySelector('video');
        var playButton = player.querySelector('[data-play-button]');
        var source = player.dataset.hlsSrc;
        var hlsInstance = null;
        var initialized = false;

        function beginPlayback() {
            if (!video || !source) {
                return;
            }

            if (!initialized) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls();
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }

                initialized = true;
            }

            player.classList.add('is-ready');
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    player.classList.remove('is-ready');
                });
            }
        }

        if (playButton) {
            playButton.addEventListener('click', beginPlayback);
        }

        Array.prototype.slice.call(document.querySelectorAll('[data-scroll-play]')).forEach(function (trigger) {
            trigger.addEventListener('click', function (event) {
                event.preventDefault();
                player.scrollIntoView({ behavior: 'smooth', block: 'center' });
                beginPlayback();
            });
        });

        player.addEventListener('click', function (event) {
            if (event.target === player) {
                beginPlayback();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                hlsInstance.destroy();
            }
        });
    }

    var resultsContainer = document.querySelector('[data-search-results]');

    if (resultsContainer && window.MOVIE_SEARCH_INDEX) {
        var searchForm = document.querySelector('[data-global-search-form]');
        var globalInput = document.querySelector('[data-global-search-input]');
        var summary = document.querySelector('[data-search-summary]');
        var params = new URLSearchParams(window.location.search);
        var queryFromUrl = params.get('q') || '';

        function cardTemplate(movie) {
            var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return '' +
                '<article class="movie-card">' +
                    '<a class="poster-wrap" href="' + movie.file + '" aria-label="观看 ' + escapeHtml(movie.title) + '">' +
                        '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                        '<span class="poster-play">▶</span>' +
                    '</a>' +
                    '<div class="movie-card-body">' +
                        '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
                        '<h3><a href="' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>' +
                        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                        '<div class="tag-row">' + tags + '</div>' +
                    '</div>' +
                '</article>';
        }

        function escapeHtml(value) {
            return String(value || '').replace(/[&<>"']/g, function (character) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                }[character];
            });
        }

        function runSearch(query) {
            var q = String(query || '').trim().toLowerCase();
            var results = [];

            if (q) {
                results = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
                    return movie.searchText.indexOf(q) !== -1;
                }).slice(0, 120);
            }

            resultsContainer.innerHTML = results.map(cardTemplate).join('');

            if (summary) {
                summary.textContent = q ? '找到 ' + results.length + ' 条相关结果' : '输入关键词后显示匹配结果';
            }
        }

        if (globalInput) {
            globalInput.value = queryFromUrl;
        }

        runSearch(queryFromUrl);

        if (searchForm) {
            searchForm.addEventListener('submit', function (event) {
                event.preventDefault();
                var q = globalInput ? globalInput.value : '';
                var nextUrl = 'search.html' + (q ? '?q=' + encodeURIComponent(q) : '');
                window.history.replaceState(null, '', nextUrl);
                runSearch(q);
            });
        }
    }
})();
