(function() {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function() {
            nav.classList.toggle("open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function setSlide(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function() {
                setSlide(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function() {
                setSlide(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function() {
                setSlide(index + 1);
                restart();
            });
        }
        dots.forEach(function(dot, i) {
            dot.addEventListener("click", function() {
                setSlide(i);
                restart();
            });
        });

        setSlide(0);
        restart();
    }

    function setupSearchRedirect() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-site-search-form]"));
        forms.forEach(function(form) {
            form.addEventListener("submit", function(event) {
                event.preventDefault();
                var input = form.querySelector("input");
                var query = input ? input.value.trim() : "";
                var base = form.getAttribute("data-search-target") || "search.html";
                if (query) {
                    window.location.href = base + "?q=" + encodeURIComponent(query);
                } else {
                    window.location.href = base;
                }
            });
        });
    }

    function setupFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-search]"));
        var input = document.querySelector("[data-search-input]");
        var region = document.querySelector("[data-filter-region]");
        var year = document.querySelector("[data-filter-year]");
        var type = document.querySelector("[data-filter-type]");
        var empty = document.querySelector("[data-empty-state]");
        if (!cards.length || (!input && !region && !year && !type)) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var queryValue = params.get("q");
        if (queryValue && input) {
            input.value = queryValue;
        }

        function normalized(value) {
            return String(value || "").trim().toLowerCase();
        }

        function apply() {
            var q = normalized(input ? input.value : "");
            var selectedRegion = region ? region.value : "";
            var selectedYear = year ? year.value : "";
            var selectedType = type ? type.value : "";
            var visible = 0;

            cards.forEach(function(card) {
                var haystack = normalized(card.getAttribute("data-search"));
                var okQuery = !q || haystack.indexOf(q) !== -1;
                var okRegion = !selectedRegion || card.getAttribute("data-region") === selectedRegion;
                var okYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
                var okType = !selectedType || card.getAttribute("data-type") === selectedType;
                var show = okQuery && okRegion && okYear && okType;
                card.classList.toggle("is-hidden", !show);
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("visible", visible === 0);
            }
        }

        [input, region, year, type].forEach(function(el) {
            if (el) {
                el.addEventListener("input", apply);
                el.addEventListener("change", apply);
            }
        });
        apply();
    }

    function setupPlayer() {
        var shell = document.querySelector("[data-player]");
        if (!shell) {
            return;
        }
        var video = shell.querySelector("video");
        var button = shell.querySelector("[data-play-button]");
        var poster = shell.querySelector("[data-poster-layer]");
        var videoUrl = shell.getAttribute("data-video");
        var isReady = false;
        var hls = null;

        if (!video || !videoUrl) {
            return;
        }

        function bindVideo() {
            if (isReady) {
                return Promise.resolve();
            }
            isReady = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = videoUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(videoUrl);
                hls.attachMedia(video);
            } else {
                video.src = videoUrl;
            }

            return new Promise(function(resolve) {
                var done = function() {
                    resolve();
                };
                video.addEventListener("loadedmetadata", done, { once: true });
                window.setTimeout(done, 700);
            });
        }

        function play() {
            bindVideo().then(function() {
                shell.classList.add("is-playing");
                video.controls = true;
                var attempt = video.play();
                if (attempt && typeof attempt.catch === "function") {
                    attempt.catch(function() {});
                }
            });
        }

        if (button) {
            button.addEventListener("click", play);
        }
        if (poster) {
            poster.addEventListener("click", play);
        }
        video.addEventListener("click", function() {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener("beforeunload", function() {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }

    ready(function() {
        setupMenu();
        setupHero();
        setupSearchRedirect();
        setupFilters();
        setupPlayer();
    });
})();
