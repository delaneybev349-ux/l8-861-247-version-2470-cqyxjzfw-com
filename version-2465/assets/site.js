(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    ready(function () {
        var toggle = document.querySelector('.mobile-toggle');
        var mobileNav = document.querySelector('.mobile-nav');
        if (toggle && mobileNav) {
            toggle.addEventListener('click', function () {
                var isOpen = mobileNav.classList.toggle('open');
                toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            });
        }

        document.querySelectorAll('.js-site-search').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                var value = input ? input.value.trim() : '';
                if (!value) {
                    event.preventDefault();
                    window.location.href = './search.html';
                }
            });
        });

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
            var prev = hero.querySelector('.hero-prev');
            var next = hero.querySelector('.hero-next');
            var index = 0;
            var timer = null;

            function showSlide(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('active', slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('active', dotIndex === index);
                });
            }

            function startTimer() {
                window.clearInterval(timer);
                timer = window.setInterval(function () {
                    showSlide(index + 1);
                }, 5200);
            }

            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    showSlide(Number(dot.getAttribute('data-slide')) || 0);
                    startTimer();
                });
            });

            if (prev) {
                prev.addEventListener('click', function () {
                    showSlide(index - 1);
                    startTimer();
                });
            }

            if (next) {
                next.addEventListener('click', function () {
                    showSlide(index + 1);
                    startTimer();
                });
            }

            showSlide(0);
            startTimer();
        }

        var searchPage = document.querySelector('[data-search-page]');
        if (searchPage) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q') || '';
            var queryInput = searchPage.querySelector('.js-search-query');
            var cardInput = searchPage.querySelector('.js-card-search');
            if (queryInput) {
                queryInput.value = query;
            }
            if (cardInput) {
                cardInput.value = query;
            }
        }

        var filterRoot = document.querySelector('[data-filter-page], [data-search-page]');
        if (filterRoot) {
            var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('.movie-card'));
            var keywordInput = filterRoot.querySelector('.js-card-search');
            var typeFilter = filterRoot.querySelector('.js-type-filter');
            var yearFilter = filterRoot.querySelector('.js-year-filter');

            function normalize(value) {
                return String(value || '').trim().toLowerCase();
            }

            function applyFilters() {
                var keyword = normalize(keywordInput ? keywordInput.value : '');
                var type = normalize(typeFilter ? typeFilter.value : '');
                var year = normalize(yearFilter ? yearFilter.value : '');
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-search'));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var matched = true;
                    if (keyword && text.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (type && cardType !== type) {
                        matched = false;
                    }
                    if (year && cardYear !== year) {
                        matched = false;
                    }
                    card.classList.toggle('hidden-by-filter', !matched);
                });
            }

            [keywordInput, typeFilter, yearFilter].forEach(function (element) {
                if (element) {
                    element.addEventListener('input', applyFilters);
                    element.addEventListener('change', applyFilters);
                }
            });

            applyFilters();
        }
    });
}());
