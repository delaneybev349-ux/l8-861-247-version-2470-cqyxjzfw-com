(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var headerSearch = document.querySelector("[data-header-search]");
    if (headerSearch) {
      headerSearch.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = headerSearch.querySelector("input");
        var value = input ? input.value.trim() : "";
        if (value) {
          window.location.href = "categories.html?q=" + encodeURIComponent(value);
        }
      });
    }

    var filterPanel = document.querySelector("[data-filter-panel]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    if (filterPanel && cards.length) {
      var search = filterPanel.querySelector("[data-filter-search]");
      var typeSelect = filterPanel.querySelector("[data-filter-type]");
      var yearSelect = filterPanel.querySelector("[data-filter-year]");
      var empty = document.querySelector("[data-empty]");
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";
      if (search && initial) {
        search.value = initial;
      }

      function applyFilters() {
        var q = normalize(search ? search.value : "");
        var type = normalize(typeSelect ? typeSelect.value : "");
        var year = normalize(yearSelect ? yearSelect.value : "");
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-genre"));
          var cardType = normalize(card.getAttribute("data-type"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var matched = (!q || haystack.indexOf(q) !== -1) && (!type || cardType === type) && (!year || cardYear === year);
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.style.display = visible ? "none" : "block";
        }
      }

      [search, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });

      applyFilters();
    }
  });
})();
