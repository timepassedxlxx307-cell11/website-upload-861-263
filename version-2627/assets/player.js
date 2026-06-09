(function () {
  async function attachStream(video, streamUrl) {
    if (video.getAttribute('data-ready') === 'yes') {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.setAttribute('data-ready', 'yes');
      return;
    }
    try {
      var module = await import('./hls-module.js');
      var Hls = module.H;
      if (Hls && Hls.isSupported()) {
        var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        video.hlsController = hls;
        video.setAttribute('data-ready', 'yes');
        return;
      }
    } catch (error) {
      video.removeAttribute('data-ready');
    }
    video.src = streamUrl;
    video.setAttribute('data-ready', 'yes');
  }

  window.MoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);
    var streamUrl = options.streamUrl;
    if (!video || !streamUrl) {
      return;
    }

    async function play() {
      await attachStream(video, streamUrl);
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      try {
        await video.play();
      } catch (error) {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
  };
}());
