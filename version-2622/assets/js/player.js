(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function bindPlayer(root) {
    var video = root.querySelector("video");
    var button = root.querySelector(".player-start");
    var source = root.getAttribute("data-video");
    var loaded = false;
    var hlsInstance = null;

    function load() {
      if (loaded || !video || !source) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function requestPlay() {
      root.classList.add("is-playing");
      video.setAttribute("controls", "controls");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          video.addEventListener("canplay", function retryPlay() {
            video.play().catch(function () {
              root.classList.remove("is-playing");
            });
          }, { once: true });
        });
      }
    }

    function play() {
      if (!video) {
        return;
      }
      load();
      requestPlay();
    }

    if (button) {
      button.addEventListener("click", play);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("playing", function () {
        root.classList.add("is-playing");
      });
      video.addEventListener("ended", function () {
        root.classList.remove("is-playing");
      });
    }

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    document.querySelectorAll(".movie-player").forEach(bindPlayer);
  });
})();
