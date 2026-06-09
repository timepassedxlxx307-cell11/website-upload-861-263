(function () {
    const shells = Array.prototype.slice.call(document.querySelectorAll('.video-shell'));

    shells.forEach(function (shell) {
        const video = shell.querySelector('video');
        const button = shell.querySelector('.play-overlay');
        const url = shell.getAttribute('data-video-url');
        let attached = false;
        let hls = null;

        const attach = function () {
            if (!video || !url || attached) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                attached = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                attached = true;
                return;
            }

            video.src = url;
            attached = true;
        };

        const start = function () {
            attach();
            shell.classList.add('is-playing');
            const result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {
                    shell.classList.remove('is-playing');
                });
            }
        };

        if (button) {
            button.addEventListener('click', start);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0 || video.ended) {
                    shell.classList.remove('is-playing');
                }
            });
            video.addEventListener('ended', function () {
                shell.classList.remove('is-playing');
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
