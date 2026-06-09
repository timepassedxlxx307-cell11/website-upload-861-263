(function () {
  var video = document.querySelector('[data-player]');
  var button = document.querySelector('[data-play-trigger]');

  if (!video || !button) {
    return;
  }

  var stream = video.getAttribute('data-stream');
  var started = false;
  var hls = null;

  function playVideo() {
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  function startPlayer() {
    if (!stream) {
      return;
    }

    button.classList.add('is-hidden');
    video.setAttribute('controls', 'controls');

    if (started) {
      playVideo();
      return;
    }

    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.addEventListener('loadedmetadata', playVideo, { once: true });
      playVideo();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
      return;
    }

    video.src = stream;
    video.addEventListener('loadedmetadata', playVideo, { once: true });
    playVideo();
  }

  button.addEventListener('click', startPlayer);
  video.addEventListener('click', function () {
    if (!started || video.paused) {
      startPlayer();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();