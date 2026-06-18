(function() {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, function(character) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#39;"
            }[character];
        });
    }

    ready(function() {
        var menuButton = document.querySelector(".mobile-menu-button");
        var mobileNav = document.querySelector(".mobile-nav");
        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function() {
                var open = mobileNav.classList.toggle("is-open");
                menuButton.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;
            function showSlide(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function(slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function(dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }
            dots.forEach(function(dot) {
                dot.addEventListener("click", function() {
                    showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                });
            });
            if (slides.length > 1) {
                setInterval(function() {
                    showSlide(current + 1);
                }, 5200);
            }
        }

        var filterInput = document.querySelector(".js-card-filter");
        var cardGrid = document.querySelector("[data-card-grid]");
        if (filterInput && cardGrid) {
            var cards = Array.prototype.slice.call(cardGrid.querySelectorAll("[data-card]"));
            filterInput.addEventListener("input", function() {
                var query = filterInput.value.trim().toLowerCase();
                cards.forEach(function(card) {
                    var text = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags")
                    ].join(" ").toLowerCase();
                    card.hidden = query && text.indexOf(query) === -1;
                });
            });
        }

        document.querySelectorAll(".js-sort").forEach(function(button) {
            button.addEventListener("click", function() {
                if (!cardGrid) {
                    return;
                }
                var mode = button.getAttribute("data-sort");
                var cards = Array.prototype.slice.call(cardGrid.querySelectorAll("[data-card]"));
                cards.sort(function(a, b) {
                    if (mode === "year") {
                        return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
                    }
                    return String(a.getAttribute("data-title") || "").localeCompare(String(b.getAttribute("data-title") || ""), "zh-Hans-CN");
                });
                cards.forEach(function(card) {
                    cardGrid.appendChild(card);
                });
            });
        });

        var searchInput = document.getElementById("site-search");
        var resultsBox = document.getElementById("search-results");
        var summary = document.getElementById("search-summary");
        var empty = document.getElementById("search-empty");
        if (searchInput && resultsBox && window.siteSearchItems) {
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q") || "";
            searchInput.value = initialQuery;
            function renderResults(query) {
                var clean = query.trim().toLowerCase();
                resultsBox.innerHTML = "";
                if (!clean) {
                    if (summary) {
                        summary.textContent = "输入关键词后显示匹配影片。";
                    }
                    if (empty) {
                        empty.hidden = false;
                    }
                    return;
                }
                var matches = window.siteSearchItems.filter(function(item) {
                    return [item.title, item.region, item.year, item.genre, item.tags].join(" ").toLowerCase().indexOf(clean) !== -1;
                }).slice(0, 120);
                if (summary) {
                    summary.textContent = "已找到匹配影片，点击卡片可进入详情页。";
                }
                if (empty) {
                    empty.hidden = matches.length > 0;
                    if (!matches.length) {
                        empty.textContent = "没有找到匹配影片。";
                    }
                }
                matches.forEach(function(item) {
                    var article = document.createElement("article");
                    var safeUrl = escapeHtml(item.url);
                    var safeCover = escapeHtml(item.cover);
                    var safeTitle = escapeHtml(item.title);
                    var safeRegion = escapeHtml(item.region);
                    var safeLine = escapeHtml(item.oneLine);
                    var safeYear = escapeHtml(item.year);
                    var safeType = escapeHtml(item.type);
                    article.className = "movie-card";
                    article.innerHTML = [
                        '<a class="movie-poster" href="' + safeUrl + '">',
                        '<img src="' + safeCover + '" alt="' + safeTitle + ' 在线观看" loading="lazy">',
                        '<span class="poster-badge">' + safeRegion + '</span>',
                        '<span class="poster-play">▶</span>',
                        '</a>',
                        '<div class="movie-card-content">',
                        '<h3><a href="' + safeUrl + '">' + safeTitle + '</a></h3>',
                        '<p>' + safeLine + '</p>',
                        '<div class="card-meta"><span>' + safeYear + '</span><span>' + safeType + '</span></div>',
                        '</div>'
                    ].join("");
                    resultsBox.appendChild(article);
                });
            }
            renderResults(initialQuery);
            searchInput.addEventListener("input", function() {
                renderResults(searchInput.value);
            });
        }
    });
})();
