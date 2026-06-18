(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var isOpen = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
      button.textContent = isOpen ? "×" : "☰";
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function cardText(card) {
    return [
      card.getAttribute("data-title"),
      card.getAttribute("data-region"),
      card.getAttribute("data-year"),
      card.getAttribute("data-genre"),
      card.getAttribute("data-tags"),
      card.textContent
    ].join(" ").toLowerCase();
  }

  function setupFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll("[data-filter-list]"));
    if (!lists.length) {
      return;
    }
    var input = document.querySelector("[data-filter-input]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-query]"));

    function apply(query) {
      var normalized = String(query || "").trim().toLowerCase();
      if (input && input.value !== query) {
        input.value = query;
      }
      lists.forEach(function (list) {
        Array.prototype.slice.call(list.querySelectorAll(".movie-card")).forEach(function (card) {
          var matches = !normalized || cardText(card).indexOf(normalized) !== -1;
          card.hidden = !matches;
        });
      });
      filterButtons.forEach(function (button) {
        button.classList.toggle("is-active", String(button.getAttribute("data-query") || "").toLowerCase() === normalized);
      });
    }

    if (input) {
      input.value = initialQuery;
      input.addEventListener("input", function () {
        apply(input.value);
      });
    }

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var query = button.getAttribute("data-query") || "";
        apply(query);
      });
    });

    apply(initialQuery);
  }

  window.initMoviePlayer = function (videoId, buttonId, sourceUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !sourceUrl) {
      return;
    }
    var shell = video.closest(".player-shell");
    var status = shell ? shell.querySelector(".player-status") : null;
    var hls = null;
    var attached = false;

    function setStatus(text) {
      if (status) {
        status.textContent = text || "";
      }
    }

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          setStatus("点击继续播放");
        });
      }
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      video.setAttribute("controls", "controls");
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus("");
          playVideo();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus("播放暂时不可用");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        video.addEventListener("loadedmetadata", function () {
          setStatus("");
          playVideo();
        }, { once: true });
        video.load();
      } else {
        video.src = sourceUrl;
        video.load();
        playVideo();
      }
    }

    function start() {
      button.classList.add("is-hidden");
      attach();
      if (attached) {
        playVideo();
      }
    }

    button.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (!attached) {
        start();
      } else if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
      setStatus("");
    });
    video.addEventListener("pause", function () {
      if (attached) {
        button.classList.remove("is-hidden");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
