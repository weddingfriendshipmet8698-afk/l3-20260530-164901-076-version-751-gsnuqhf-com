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

  function createMovieCard(movie) {
    var tags = Array.isArray(movie.tags) ? movie.tags.slice(0, 3) : [];
    return [
      '<article class="movie-card">',
      '<a class="poster" href="' + movie.file + '" aria-label="' + movie.title + '">',
      '<img src="' + movie.cover + '" alt="' + movie.title + '" loading="lazy">',
      '<span class="poster-badge">' + movie.type + '</span>',
      '</a>',
      '<div class="movie-info">',
      '<div class="movie-meta"><span>' + movie.year + '</span><span>' + movie.region + '</span></div>',
      '<h2><a href="' + movie.file + '">' + movie.title + '</a></h2>',
      '<p>' + movie.oneLine + '</p>',
      '<div class="tag-row">' + tags.map(function (tag) { return '<span>' + tag + '</span>'; }).join("") + '</div>',
      '</div>',
      '</article>'
    ].join("");
  }

  ready(function () {
    var menuToggle = document.querySelector("[data-menu-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");
    if (menuToggle && mobilePanel) {
      menuToggle.addEventListener("click", function () {
        mobilePanel.classList.toggle("open");
      });
    }

    var carousel = document.querySelector("[data-hero-carousel]");
    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
      var index = 0;
      var apply = function (next) {
        index = next;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          apply(i);
        });
      });
      if (slides.length > 1) {
        setInterval(function () {
          apply((index + 1) % slides.length);
        }, 5200);
      }
    }

    var filterForm = document.querySelector("[data-card-filter]");
    var cardList = document.querySelector("[data-card-list]");
    if (filterForm && cardList) {
      var cards = Array.prototype.slice.call(cardList.querySelectorAll(".movie-card"));
      var textInput = filterForm.querySelector("[data-filter-text]");
      var typeSelect = filterForm.querySelector("[data-filter-type]");
      var yearSelect = filterForm.querySelector("[data-filter-year]");
      var emptyState = document.querySelector("[data-empty-state]");
      var updateCards = function () {
        var text = normalize(textInput && textInput.value);
        var type = normalize(typeSelect && typeSelect.value);
        var year = normalize(yearSelect && yearSelect.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize(card.dataset.title + " " + card.dataset.tags + " " + card.dataset.year + " " + card.dataset.type);
          var matched = true;
          if (text && haystack.indexOf(text) === -1) matched = false;
          if (type && normalize(card.dataset.type) !== type) matched = false;
          if (year && normalize(card.dataset.year) !== year) matched = false;
          card.style.display = matched ? "" : "none";
          if (matched) visible += 1;
        });
        if (emptyState) {
          emptyState.classList.toggle("open", visible === 0);
        }
      };
      [textInput, typeSelect, yearSelect].forEach(function (control) {
        if (!control) return;
        control.addEventListener("input", updateCards);
        control.addEventListener("change", updateCards);
      });
    }

    var searchInput = document.querySelector("[data-search-input]");
    var resultBox = document.querySelector("[data-search-results]");
    if (searchInput && resultBox && window.MOVIES) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      var title = document.querySelector("[data-search-title]");
      var desc = document.querySelector("[data-search-desc]");
      var empty = document.querySelector("[data-search-empty]");
      searchInput.value = query;
      if (query.trim()) {
        var key = normalize(query);
        var matches = window.MOVIES.filter(function (movie) {
          return normalize(movie.title + " " + movie.region + " " + movie.type + " " + movie.year + " " + movie.tags.join(" ")).indexOf(key) !== -1;
        }).slice(0, 120);
        resultBox.innerHTML = matches.map(createMovieCard).join("");
        if (title) title.textContent = "搜索结果";
        if (desc) desc.textContent = "与“" + query + "”相关的影片内容";
        if (empty) empty.classList.toggle("open", matches.length === 0);
      }
    }
  });
})();
