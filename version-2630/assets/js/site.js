(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
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
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
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

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    document.querySelectorAll('[data-filter-section]').forEach(function (section) {
        var input = section.querySelector('[data-filter-input]');
        var yearSelect = section.querySelector('[data-filter-year]');
        var items = Array.prototype.slice.call(section.querySelectorAll('[data-filter-list] .movie-card'));
        var empty = section.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilter() {
            var query = normalize(input ? input.value : '');
            var year = yearSelect ? yearSelect.value : '';
            var visible = 0;

            items.forEach(function (item) {
                var text = normalize([
                    item.getAttribute('data-title'),
                    item.getAttribute('data-region'),
                    item.getAttribute('data-type'),
                    item.getAttribute('data-genre'),
                    item.getAttribute('data-year'),
                    item.textContent
                ].join(' '));
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesYear = !year || item.getAttribute('data-year') === year;
                var shouldShow = matchesQuery && matchesYear;

                item.hidden = !shouldShow;
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        if (yearSelect) {
            yearSelect.addEventListener('change', applyFilter);
        }

        applyFilter();
    });

    window.PlayerKit = {
        mount: function (streamUrl) {
            var video = document.getElementById('moviePlayer');
            var cover = document.querySelector('[data-player-cover]');
            var started = false;
            var hlsInstance = null;

            if (!video || !streamUrl) {
                return;
            }

            function playVideo() {
                var playPromise = video.play();

                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {});
                }
            }

            function loadVideo() {
                if (started) {
                    playVideo();
                    return;
                }

                started = true;

                if (cover) {
                    cover.classList.add('is-hidden');
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                    video.addEventListener('loadedmetadata', playVideo, { once: true });
                    playVideo();
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
                    return;
                }

                video.src = streamUrl;
                playVideo();
            }

            if (cover) {
                cover.addEventListener('click', loadVideo);
            }

            video.addEventListener('click', function () {
                if (!started || video.paused) {
                    loadVideo();
                } else {
                    video.pause();
                }
            });

            window.addEventListener('pagehide', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        }
    };
})();
