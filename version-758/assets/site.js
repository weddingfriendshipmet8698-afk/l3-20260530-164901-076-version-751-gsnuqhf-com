(function () {
  function bySelector(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function getRoot() {
    return document.body.getAttribute('data-root') || '';
  }

  function initMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = bySelector('[data-hero-slide]', hero);
    var dots = bySelector('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }
    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener('click', function () {
        show(itemIndex);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5000);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initGlobalSearch() {
    var input = document.querySelector('[data-global-search]');
    var box = document.querySelector('[data-search-results]');
    var index = window.MOVIE_SEARCH_INDEX || [];
    if (!input || !box || !index.length) {
      return;
    }
    var root = getRoot();

    function close() {
      box.classList.remove('is-open');
      box.innerHTML = '';
    }

    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      if (query.length < 1) {
        close();
        return;
      }
      var words = query.split(/\s+/).filter(Boolean);
      var results = index.filter(function (item) {
        var blob = item.search.toLowerCase();
        return words.every(function (word) {
          return blob.indexOf(word) !== -1;
        });
      }).slice(0, 12);

      if (!results.length) {
        box.innerHTML = '<p>没有找到匹配影片</p>';
        box.classList.add('is-open');
        return;
      }

      box.innerHTML = results.map(function (item) {
        return '<a href="' + root + encodeURI(item.url) + '">' +
          '<strong>' + escapeHtml(item.title) + '</strong>' +
          '<small>' + escapeHtml(item.region) + ' · ' + escapeHtml(item.year) + ' · ' + escapeHtml(item.category) + '</small>' +
          '</a>';
      }).join('');
      box.classList.add('is-open');
    });

    document.addEventListener('click', function (event) {
      if (!box.contains(event.target) && event.target !== input) {
        close();
      }
    });
  }

  function initCardFilters() {
    var search = document.querySelector('[data-card-search]');
    var type = document.querySelector('[data-card-type]');
    var cards = bySelector('[data-movie-card]');
    var count = document.querySelector('[data-filter-count]');
    if (!cards.length || (!search && !type)) {
      return;
    }

    function update() {
      var query = search ? search.value.trim().toLowerCase() : '';
      var typeValue = type ? type.value.trim() : '';
      var visible = 0;
      cards.forEach(function (card) {
        var blob = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        var matchesQuery = !query || blob.indexOf(query) !== -1;
        var cardType = card.getAttribute('data-type') || '';
        var matchesType = !typeValue || cardType.indexOf(typeValue) !== -1;
        var show = matchesQuery && matchesType;
        card.classList.toggle('is-hidden', !show);
        if (show) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = '当前显示 ' + visible + ' 部影片';
      }
    }

    if (search) {
      search.addEventListener('input', update);
    }
    if (type) {
      type.addEventListener('change', update);
    }
    update();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initGlobalSearch();
    initCardFilters();
  });
}());
