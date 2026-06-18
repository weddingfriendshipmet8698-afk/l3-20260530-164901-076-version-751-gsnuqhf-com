(function () {
    "use strict";

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

    function initMobileMenu() {
        var button = qs(".mobile-menu-button");
        var menu = qs(".mobile-menu");
        if (!button || !menu) {
            return;
        }

        button.addEventListener("click", function () {
            var isHidden = menu.hasAttribute("hidden");
            if (isHidden) {
                menu.removeAttribute("hidden");
                button.setAttribute("aria-expanded", "true");
                button.textContent = "×";
            } else {
                menu.setAttribute("hidden", "hidden");
                button.setAttribute("aria-expanded", "false");
                button.textContent = "☰";
            }
        });
    }

    function initFilter() {
        var input = qs(".js-filter-input");
        var cards = qsa(".movie-card, .rank-row");
        var counter = qs(".js-visible-count");
        if (!input || cards.length === 0) {
            return;
        }

        function applyFilter() {
            var value = input.value.trim().toLowerCase();
            var visibleCount = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-genre"),
                    card.textContent
                ].join(" ").toLowerCase();

                var matched = !value || haystack.indexOf(value) !== -1;
                card.classList.toggle("hidden-by-filter", !matched);
                if (matched) {
                    visibleCount += 1;
                }
            });

            if (counter) {
                counter.textContent = String(visibleCount);
            }
        }

        input.addEventListener("input", applyFilter);
        applyFilter();
    }

    function initSorters() {
        var grid = qs(".js-sortable-grid");
        if (!grid) {
            return;
        }

        var buttons = qsa("[data-sort]");
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                buttons.forEach(function (item) {
                    item.classList.remove("active");
                });
                button.classList.add("active");

                var key = button.getAttribute("data-sort");
                var cards = qsa(".movie-card", grid);
                cards.sort(function (a, b) {
                    if (key === "views" || key === "likes") {
                        return Number(b.getAttribute("data-" + key) || 0) - Number(a.getAttribute("data-" + key) || 0);
                    }
                    if (key === "year") {
                        return String(b.getAttribute("data-year") || "").localeCompare(String(a.getAttribute("data-year") || ""), "zh-Hans-CN");
                    }
                    return String(b.getAttribute("data-date") || "").localeCompare(String(a.getAttribute("data-date") || ""));
                });

                cards.forEach(function (card) {
                    grid.appendChild(card);
                });
            });
        });
    }

    function initPlayer() {
        qsa(".player-shell").forEach(function (player) {
            var video = qs("video", player);
            var startButton = qs(".player-start", player);
            var status = qs(".player-status", player);
            var source = player.getAttribute("data-src");
            var hlsInstance = null;

            function setStatus(message) {
                if (status) {
                    status.textContent = message;
                }
            }

            function playVideo() {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        setStatus("浏览器阻止了自动播放，请再次点击播放器");
                    });
                }
            }

            function prepareAndPlay() {
                if (!video || !source) {
                    setStatus("未找到播放源");
                    return;
                }

                if (player.getAttribute("data-ready") === "true") {
                    if (video.paused) {
                        playVideo();
                    } else {
                        video.pause();
                    }
                    return;
                }

                setStatus("正在加载播放源...");
                video.setAttribute("controls", "controls");
                video.setAttribute("playsinline", "playsinline");

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        player.classList.add("is-ready");
                        player.setAttribute("data-ready", "true");
                        setStatus("播放源已就绪");
                        playVideo();
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setStatus("视频加载失败，请刷新页面后重试");
                            if (hlsInstance) {
                                hlsInstance.destroy();
                            }
                        }
                    });
                    return;
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    video.addEventListener("loadedmetadata", function () {
                        player.classList.add("is-ready");
                        player.setAttribute("data-ready", "true");
                        setStatus("播放源已就绪");
                        playVideo();
                    }, { once: true });
                    video.addEventListener("error", function () {
                        setStatus("视频加载失败，请检查播放源");
                    }, { once: true });
                    return;
                }

                setStatus("当前浏览器不支持 HLS 播放，请使用最新版 Chrome、Edge 或 Safari");
            }

            if (startButton) {
                startButton.addEventListener("click", prepareAndPlay);
            }
            if (video) {
                video.addEventListener("click", prepareAndPlay);
            }
        });
    }

    function initLikes() {
        qsa(".js-like-button").forEach(function (button) {
            var id = button.getAttribute("data-id");
            var key = "liked-movies";
            var liked = JSON.parse(localStorage.getItem(key) || "[]");

            function sync() {
                button.classList.toggle("active", liked.indexOf(id) !== -1);
                button.textContent = liked.indexOf(id) !== -1 ? "♥ 已喜欢" : "♡ 喜欢";
            }

            button.addEventListener("click", function () {
                if (liked.indexOf(id) !== -1) {
                    liked = liked.filter(function (item) { return item !== id; });
                } else {
                    liked.push(id);
                }
                localStorage.setItem(key, JSON.stringify(liked));
                sync();
            });

            sync();
        });
    }

    function initShare() {
        qsa(".js-share-button").forEach(function (button) {
            button.addEventListener("click", function () {
                var title = button.getAttribute("data-title") || document.title;
                var text = button.getAttribute("data-text") || "";
                var url = window.location.href;

                if (navigator.share) {
                    navigator.share({ title: title, text: text, url: url }).catch(function () {});
                    return;
                }

                navigator.clipboard.writeText(url).then(function () {
                    button.textContent = "链接已复制";
                    setTimeout(function () {
                        button.textContent = "分享";
                    }, 1600);
                });
            });
        });
    }

    function createSearchCard(movie) {
        return [
            '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-tags="' + escapeHtml((movie.tags || []).join(" ")) + '">',
            '    <a class="movie-card-link" href="./' + escapeHtml(movie.filename) + '">',
            '        <div class="movie-poster">',
            '            <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '            <span class="duration">' + escapeHtml(movie.duration) + '</span>',
            '            <span class="category-badge">' + escapeHtml(movie.category) + '</span>',
            '        </div>',
            '        <div class="movie-card-body">',
            '            <h3>' + escapeHtml(movie.title) + '</h3>',
            '            <p class="movie-line">' + escapeHtml(movie.oneLine) + '</p>',
            '            <div class="movie-meta"><span>👁 ' + escapeHtml(movie.viewsDisplay) + '</span><span>♥ ' + escapeHtml(movie.likesDisplay) + '</span></div>',
            '            <div class="movie-submeta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
            '        </div>',
            '    </a>',
            '</article>'
        ].join("\n");
    }

    function initSearchPage() {
        var results = qs("#search-results");
        var note = qs("#search-note");
        var input = qs("#search-page-input");
        if (!results || !window.MOVIE_INDEX) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (input) {
            input.value = query;
        }

        if (!query.trim()) {
            if (note) {
                note.textContent = "输入关键词即可搜索全站影片标题、简介、题材、标签和地区。";
            }
            return;
        }

        var lower = query.trim().toLowerCase();
        var matched = window.MOVIE_INDEX.filter(function (movie) {
            var haystack = [
                movie.title,
                movie.oneLine,
                movie.summary,
                movie.genre,
                movie.region,
                movie.type,
                (movie.tags || []).join(" ")
            ].join(" ").toLowerCase();
            return haystack.indexOf(lower) !== -1;
        });

        if (note) {
            note.textContent = "关键词：“" + query + "”，共找到 " + matched.length + " 部影片。";
        }

        if (matched.length === 0) {
            results.innerHTML = '<div class="empty-state"><h2>未找到相关影片</h2><p>可以尝试更短的关键词、题材、年份或地区。</p></div>';
            return;
        }

        results.innerHTML = matched.map(createSearchCard).join("\n");
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMobileMenu();
        initFilter();
        initSorters();
        initPlayer();
        initLikes();
        initShare();
        initSearchPage();
    });
}());
