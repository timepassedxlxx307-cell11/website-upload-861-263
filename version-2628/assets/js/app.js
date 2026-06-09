(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupMenu() {
        var button = qs('.menu-toggle');
        var nav = qs('.mobile-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            nav.hidden = !open;
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
            button.textContent = open ? '×' : '☰';
        });
    }

    function setupHero() {
        var carousel = qs('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = qsa('[data-hero-slide]', carousel);
        var dots = qsa('[data-hero-dot]', carousel);
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    }

    function setupFilters() {
        var panels = qsa('.filter-panel');
        panels.forEach(function (panel) {
            var root = panel.parentElement || document;
            var keywordInput = qs('.filter-input', panel);
            var regionSelect = qs('.filter-region', panel);
            var typeSelect = qs('.filter-type', panel);
            var yearSelect = qs('.filter-year', panel);
            var cards = qsa('.movie-card', root);
            var empty = qs('.empty-state', root);
            function apply() {
                var keyword = normalize(keywordInput && keywordInput.value);
                var region = normalize(regionSelect && regionSelect.value);
                var type = normalize(typeSelect && typeSelect.value);
                var year = normalize(yearSelect && yearSelect.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-search'));
                    var ok = true;
                    if (keyword && text.indexOf(keyword) === -1) {
                        ok = false;
                    }
                    if (region && normalize(card.getAttribute('data-region')) !== region) {
                        ok = false;
                    }
                    if (type && normalize(card.getAttribute('data-type')) !== type) {
                        ok = false;
                    }
                    if (year && normalize(card.getAttribute('data-year')) !== year) {
                        ok = false;
                    }
                    card.classList.toggle('is-hidden', !ok);
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }
            [keywordInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q && keywordInput) {
                keywordInput.value = q;
            }
            apply();
        });
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById('moviePlayer');
        var poster = qs('.player-poster');
        if (!video || !streamUrl) {
            return;
        }
        var attached = false;
        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }
        function play() {
            attach();
            if (poster) {
                poster.classList.add('is-hidden');
            }
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {});
            }
        }
        if (poster) {
            poster.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
