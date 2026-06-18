(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function initMobileMenu() {
        var button = document.querySelector(".mobile-menu-button");
        var nav = document.getElementById("mobile-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            var open = nav.classList.toggle("open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function setSlide(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }
        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                setSlide(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                setSlide(i);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                setSlide(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                setSlide(index + 1);
                restart();
            });
        }
        setSlide(0);
        restart();
    }

    function initLocalFilter() {
        var input = document.querySelector(".page-filter-input");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var count = document.querySelector(".filter-count");
        if (!input || !cards.length) {
            return;
        }
        function run() {
            var query = input.value.trim().toLowerCase();
            var shown = 0;
            cards.forEach(function (card) {
                var ok = !query || String(card.getAttribute("data-search") || "").toLowerCase().indexOf(query) !== -1;
                card.style.display = ok ? "" : "none";
                if (ok) {
                    shown += 1;
                }
            });
            if (count) {
                count.textContent = shown + " 部影片";
            }
        }
        input.addEventListener("input", run);
        run();
    }

    function movieCard(movie) {
        return "<article class=\"movie-card\" data-search=\"" + escapeHtml((movie.title + " " + movie.year + " " + movie.genre + " " + movie.region + " " + movie.type).toLowerCase()) + "\">" +
            "<a class=\"card-cover\" href=\"" + escapeHtml(movie.file) + "\">" +
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"card-category\">" + escapeHtml(movie.category) + "</span>" +
            "<span class=\"card-duration\">" + escapeHtml(movie.duration) + "</span>" +
            "</a>" +
            "<div class=\"card-body\">" +
            "<h2 class=\"card-title compact\"><a href=\"" + escapeHtml(movie.file) + "\">" + escapeHtml(movie.title) + "</a></h2>" +
            "<p class=\"card-meta\">" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + "</p>" +
            "<p class=\"card-desc\">" + escapeHtml(movie.oneLine) + "</p>" +
            "</div>" +
            "</article>";
    }

    function initSearchPage() {
        var results = document.getElementById("search-results");
        var form = document.querySelector(".search-form-large");
        var input = document.querySelector(".search-page-input");
        if (!results || !input || typeof SITE_MOVIES === "undefined") {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;
        function render() {
            var query = input.value.trim().toLowerCase();
            var list = SITE_MOVIES.filter(function (movie) {
                if (!query) {
                    return true;
                }
                var hay = [movie.title, movie.year, movie.genre, movie.region, movie.type, movie.category, movie.oneLine].join(" ").toLowerCase();
                return hay.indexOf(query) !== -1;
            }).slice(0, 240);
            if (!list.length) {
                results.innerHTML = "<div class=\"empty-state\">没有找到匹配影片</div>";
                return;
            }
            results.innerHTML = list.map(movieCard).join("");
        }
        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var url = new URL(window.location.href);
                var q = input.value.trim();
                if (q) {
                    url.searchParams.set("q", q);
                } else {
                    url.searchParams.delete("q");
                }
                window.history.replaceState(null, "", url.toString());
                render();
            });
        }
        input.addEventListener("input", render);
        render();
    }

    ready(function () {
        initMobileMenu();
        initHero();
        initLocalFilter();
        initSearchPage();
    });

    window.setupMoviePlayer = function (source) {
        var video = document.getElementById("movie-video");
        var start = document.getElementById("player-start");
        var attached = false;
        if (!video || !source) {
            return;
        }
        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }
        function play() {
            attach();
            if (start) {
                start.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }
        if (start) {
            start.addEventListener("click", play);
        }
        Array.prototype.slice.call(document.querySelectorAll(".play-now-button")).forEach(function (button) {
            button.addEventListener("click", play);
        });
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });
    };
})();
