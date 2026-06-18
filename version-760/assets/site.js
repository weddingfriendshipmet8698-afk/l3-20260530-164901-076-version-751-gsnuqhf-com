(function() {
  var toggle = document.querySelector("[data-menu-toggle]");
  var panel = document.querySelector("[data-menu-panel]");
  if (toggle && panel) {
    toggle.addEventListener("click", function() {
      panel.classList.toggle("open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function(slide, i) {
      slide.classList.toggle("active", i === current);
    });
    dots.forEach(function(dot, i) {
      dot.classList.toggle("active", i === current);
    });
  }

  dots.forEach(function(dot, i) {
    dot.addEventListener("click", function() {
      showSlide(i);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function() {
      showSlide(current + 1);
    }, 5200);
  }

  document.querySelectorAll("[data-filter-scope]").forEach(function(scope) {
    var input = scope.querySelector("[data-filter-input]");
    var year = scope.querySelector("[data-filter-year]");
    var type = scope.querySelector("[data-filter-type]");
    var container = scope.nextElementSibling;

    while (container && !container.querySelector("[data-movie-card]")) {
      container = container.nextElementSibling;
    }

    if (!container) {
      container = document;
    }

    var cards = Array.prototype.slice.call(container.querySelectorAll("[data-movie-card]"));

    function valueOf(element) {
      return element ? element.value.trim().toLowerCase() : "";
    }

    function apply() {
      var q = valueOf(input);
      var y = valueOf(year);
      var t = valueOf(type);
      cards.forEach(function(card) {
        var haystack = [
          card.dataset.title,
          card.dataset.tags,
          card.dataset.region,
          card.dataset.type,
          card.dataset.category,
          card.dataset.year
        ].join(" ").toLowerCase();
        var ok = true;
        if (q && haystack.indexOf(q) === -1) {
          ok = false;
        }
        if (y && String(card.dataset.year).toLowerCase() !== y) {
          ok = false;
        }
        if (t && String(card.dataset.type).toLowerCase() !== t) {
          ok = false;
        }
        card.classList.toggle("hidden", !ok);
      });
    }

    [input, year, type].forEach(function(control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  });
})();
