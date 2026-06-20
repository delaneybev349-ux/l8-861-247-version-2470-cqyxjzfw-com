(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");

    function syncHeader() {
      if (!header) {
        return;
      }
      if (window.scrollY > 18) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });

    if (toggle && nav) {
      toggle.addEventListener("click", function() {
        var expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!expanded));
        nav.classList.toggle("is-open");
      });
    }

    var forms = document.querySelectorAll(".filter-form");
    forms.forEach(function(form) {
      var scope = form.closest(".filter-panel") || document;
      var searchInput = form.querySelector(".js-search");
      var categorySelect = form.querySelector(".js-filter-category");
      var typeSelect = form.querySelector(".js-filter-type");
      var yearInput = form.querySelector(".js-filter-year");
      var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function applyFilters() {
        var keyword = normalize(searchInput && searchInput.value);
        var category = normalize(categorySelect && categorySelect.value);
        var type = normalize(typeSelect && typeSelect.value);
        var year = normalize(yearInput && yearInput.value);

        cards.forEach(function(card) {
          var text = normalize(card.getAttribute("data-search"));
          var cardCategory = normalize(card.getAttribute("data-category"));
          var cardType = normalize(card.getAttribute("data-type"));
          var cardYear = normalize(card.getAttribute("data-year"));

          var visible = true;

          if (keyword && text.indexOf(keyword) === -1) {
            visible = false;
          }

          if (category && cardCategory !== category) {
            visible = false;
          }

          if (type && cardType.indexOf(type) === -1 && text.indexOf(type) === -1) {
            visible = false;
          }

          if (year && cardYear.indexOf(year) === -1) {
            visible = false;
          }

          card.classList.toggle("is-hidden", !visible);
        });
      }

      [searchInput, categorySelect, typeSelect, yearInput].forEach(function(control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });

      form.addEventListener("submit", function(event) {
        event.preventDefault();
        applyFilters();
      });
    });
  });
})();
