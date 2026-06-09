(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function setupMobileMenu() {
        var button = qs('[data-mobile-menu-button]');
        var menu = qs('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    function setupHeroCarousel() {
        var slides = qsa('[data-hero-slide]');
        var dots = qsa('[data-hero-dot]');
        var prev = qs('[data-hero-prev]');
        var next = qs('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        show(0);
        start();
    }

    function setupLocalFilters() {
        var grid = qs('[data-filterable-grid]');
        if (!grid) {
            return;
        }
        var items = qsa('[data-filter-values]', grid);
        var chips = qsa('[data-filter]');
        var localSearch = qs('[data-local-search]');
        var counter = qs('#visible-count');
        var activeFilter = 'all';
        var searchTerm = '';

        function applyFilter() {
            var visible = 0;
            items.forEach(function (item) {
                var haystack = normalize(item.getAttribute('data-title') + ' ' + item.getAttribute('data-filter-values') + ' ' + item.textContent);
                var filterMatch = activeFilter === 'all' || haystack.indexOf(normalize(activeFilter)) !== -1;
                var searchMatch = !searchTerm || haystack.indexOf(searchTerm) !== -1;
                var shouldShow = filterMatch && searchMatch;
                item.classList.toggle('hidden-by-filter', !shouldShow);
                if (shouldShow) {
                    visible += 1;
                }
            });
            if (counter) {
                counter.textContent = visible;
            }
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (item) {
                    item.classList.remove('active');
                });
                chip.classList.add('active');
                activeFilter = chip.getAttribute('data-filter') || 'all';
                applyFilter();
            });
        });

        if (localSearch) {
            localSearch.addEventListener('input', function () {
                searchTerm = normalize(localSearch.value);
                applyFilter();
            });
        }
        applyFilter();
    }

    function setupPlayer() {
        qsa('[data-play-button]').forEach(function (button) {
            button.addEventListener('click', function () {
                var shell = button.closest('.player-shell');
                if (!shell) {
                    return;
                }
                var video = qs('video', shell);
                var url = shell.getAttribute('data-video-url');
                if (!video || !url) {
                    return;
                }

                shell.classList.add('playing');

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                    video.play().catch(function () {});
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    if (!video._hlsInstance) {
                        var hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(url);
                        hls.attachMedia(video);
                        video._hlsInstance = hls;
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.play().catch(function () {});
                        });
                    } else {
                        video.play().catch(function () {});
                    }
                    return;
                }

                video.src = url;
                video.play().catch(function () {});
            });
        });
    }

    function createSearchCard(movie) {
        return [
            '<article class="movie-card compact" data-filter-values="', escapeHtml(movie.search), '">',
            '<a class="poster-link" href="', movie.url, '" aria-label="观看 ', escapeHtml(movie.title), '">',
            '<div class="poster" style="--cover-image: url(&quot;', movie.cover, '&quot;);">',
            '<span class="type-badge">', escapeHtml(movie.type), '</span>',
            '<span class="play-float">▶</span>',
            '</div>',
            '</a>',
            '<div class="movie-card-body">',
            '<div class="card-meta-line"><span>', escapeHtml(movie.region), '</span><span>', escapeHtml(movie.year), '</span></div>',
            '<h3><a href="', movie.url, '">', escapeHtml(movie.title), '</a></h3>',
            '<p>', escapeHtml(movie.desc), '</p>',
            '<div class="tag-row"><span>', escapeHtml(movie.type), '</span><span>', escapeHtml(movie.genre), '</span></div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return (value || '').toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function setupGlobalSearch() {
        var results = qs('#search-results');
        var summary = qs('#search-summary');
        var input = qs('#search-input');
        if (!results || !window.MOVIE_SEARCH_DATA) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        if (input) {
            input.value = q;
        }
        var term = normalize(q);
        if (!term) {
            results.innerHTML = '<div class="search-empty">请输入关键词后开始搜索，也可以从分类总览或排行榜进入影片详情页。</div>';
            if (summary) {
                summary.textContent = '请输入关键词开始搜索。';
            }
            return;
        }
        var matched = window.MOVIE_SEARCH_DATA.filter(function (movie) {
            return normalize(movie.search).indexOf(term) !== -1;
        }).slice(0, 120);
        if (summary) {
            summary.textContent = '关键词“' + q + '”共匹配 ' + matched.length + ' 条结果，最多显示前 120 条。';
        }
        if (!matched.length) {
            results.innerHTML = '<div class="search-empty">没有找到匹配影片，请尝试更短的关键词或更换地区、类型、年份。</div>';
            return;
        }
        results.innerHTML = matched.map(createSearchCard).join('');
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHeroCarousel();
        setupLocalFilters();
        setupPlayer();
        setupGlobalSearch();
    });
})();
