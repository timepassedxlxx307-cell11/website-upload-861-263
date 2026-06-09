(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayer();
  });

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function () {
      panel.hidden = !panel.hidden;
    });
  }

  function setupHero() {
    var carousel = document.querySelector(".hero-carousel");
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var previous = carousel.querySelector(".hero-nav.prev");
    var next = carousel.querySelector(".hero-nav.next");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
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

    if (previous) {
      previous.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var search = document.getElementById("movie-search");
    var category = document.getElementById("category-filter");
    var year = document.getElementById("year-filter");
    var type = document.getElementById("type-filter");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var empty = document.querySelector(".empty-state");

    if (!cards.length || (!search && !category && !year && !type)) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query && search) {
      search.value = query;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function apply() {
      var keyword = normalize(search && search.value);
      var categoryValue = normalize(category && category.value);
      var yearValue = normalize(year && year.value);
      var typeValue = normalize(type && type.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var cardCategory = normalize(card.getAttribute("data-category"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardType = normalize(card.getAttribute("data-type"));
        var match = true;

        if (keyword && text.indexOf(keyword) === -1) {
          match = false;
        }
        if (categoryValue && cardCategory !== categoryValue) {
          match = false;
        }
        if (yearValue && cardYear !== yearValue) {
          match = false;
        }
        if (typeValue && cardType !== typeValue) {
          match = false;
        }

        card.hidden = !match;
        if (match) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [search, category, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  function setupPlayer() {
    var video = document.getElementById("movie-player");
    var overlay = document.querySelector(".player-overlay");

    if (!video || !overlay) {
      return;
    }

    var sourceElement = video.querySelector("source");
    var streamUrl = sourceElement ? sourceElement.getAttribute("src") : "";
    var attached = false;

    function attachStream() {
      if (!streamUrl || attached) {
        return Promise.resolve();
      }

      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.load();
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        video.hlsPlayer = hls;
        return new Promise(function (resolve) {
          var done = false;
          function finish() {
            if (!done) {
              done = true;
              resolve();
            }
          }
          hls.on(window.Hls.Events.MANIFEST_PARSED, finish);
          window.setTimeout(finish, 900);
        });
      }

      video.src = streamUrl;
      video.load();
      return Promise.resolve();
    }

    function playVideo() {
      overlay.classList.add("is-hidden");
      attachStream().then(function () {
        var playRequest = video.play();
        if (playRequest && typeof playRequest.catch === "function") {
          playRequest.catch(function () {
            overlay.classList.remove("is-hidden");
          });
        }
      });
    }

    overlay.addEventListener("click", playVideo);
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
  }
})();
