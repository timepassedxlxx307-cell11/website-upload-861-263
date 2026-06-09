(function () {
    var video = document.querySelector('[data-player-video]');
    var button = document.querySelector('[data-play-button]');
    var hlsInstance = null;
    var isReady = false;

    if (!video || !button) {
        return;
    }

    function prepareVideo() {
        var stream = video.getAttribute('data-stream');

        if (!stream || isReady) {
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
        } else {
            video.src = stream;
        }

        video.setAttribute('controls', 'controls');
        isReady = true;
    }

    function playVideo() {
        prepareVideo();
        button.classList.add('is-hidden');
        video.play().catch(function () {
            button.classList.remove('is-hidden');
        });
    }

    button.addEventListener('click', playVideo);
    video.addEventListener('click', function () {
        if (!isReady || video.paused) {
            playVideo();
        }
    });

    window.addEventListener('pagehide', function () {
        if (hlsInstance && hlsInstance.destroy) {
            hlsInstance.destroy();
        }
    });
})();
