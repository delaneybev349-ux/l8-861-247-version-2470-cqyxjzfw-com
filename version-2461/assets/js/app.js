(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupMenu() {
    var button = qs("[data-menu-button]");
    var nav = qs("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = qs("[data-hero]");
    if (!root) {
      return;
    }
    var slides = qsa(".hero-slide", root);
    var dots = qsa("[data-hero-dot]", root);
    var prev = qs("[data-hero-prev]", root);
    var next = qs("[data-hero-next]", root);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

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
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilter() {
    var input = qs("[data-filter-input]");
    var list = qs("[data-filter-list]");
    if (!input || !list) {
      return;
    }
    var cards = qsa(".movie-card", list);
    input.addEventListener("input", function () {
      var key = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-tags") || "")).toLowerCase();
        card.classList.toggle("is-hidden-card", key && haystack.indexOf(key) === -1);
      });
    });
  }

  function cardTemplate(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a class=\"card-cover\" href=\"./" + escapeHtml(item.file) + "\" aria-label=\"" + escapeHtml(item.title) + "\">" +
      "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
      "<span class=\"card-badge\">" + escapeHtml(item.category) + "</span>" +
      "</a>" +
      "<div class=\"card-body\">" +
      "<h2><a href=\"./" + escapeHtml(item.file) + "\">" + escapeHtml(item.title) + "</a></h2>" +
      "<p>" + escapeHtml(item.line) + "</p>" +
      "<div class=\"meta-row\"><span>" + escapeHtml(item.type) + "</span><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.region) + "</span></div>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function setupSearch() {
    var input = qs("[data-search-input]");
    var results = qs("[data-search-results]");
    var items = window.searchItems || [];
    if (!input || !results || !items.length) {
      return;
    }

    function render(value) {
      var key = value.trim().toLowerCase();
      var matched = key ? items.filter(function (item) {
        return item.query.indexOf(key) !== -1;
      }).slice(0, 80) : items.slice(0, 24);
      if (!matched.length) {
        results.innerHTML = "<div class=\"empty-state\">没有找到符合条件的影片</div>";
        return;
      }
      results.innerHTML = matched.map(cardTemplate).join("");
    }

    input.addEventListener("input", function () {
      render(input.value);
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    if (q) {
      input.value = q;
      render(q);
    }
  }

  window.initPlayer = function (streamUrl) {
    var video = qs("[data-player]");
    var button = qs("[data-play]");
    if (!video || !streamUrl) {
      return;
    }
    var ready = false;
    var hlsInstance = null;

    function begin() {
      if (!ready) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
          ready = true;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          ready = true;
        } else {
          video.src = streamUrl;
          ready = true;
        }
      }
      if (button) {
        button.classList.add("is-hidden");
      }
      var playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", begin);
    }
    video.addEventListener("click", function () {
      if (!ready || video.paused) {
        begin();
      }
    });
    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupFilter();
    setupSearch();
  });
})();
