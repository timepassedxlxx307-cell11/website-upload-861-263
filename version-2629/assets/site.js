(function() {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = qs('[data-menu-toggle]');
    var nav = qs('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function() {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var root = qs('[data-hero]');
    if (!root) {
      return;
    }
    var slides = qsa('[data-hero-slide]', root);
    var dots = qsa('[data-hero-dot]', root);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        show(i);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function uniqueValues(cards, attr) {
    var values = [];
    cards.forEach(function(card) {
      var value = (card.getAttribute(attr) || '').trim();
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });
    return values.sort(function(a, b) {
      return String(a).localeCompare(String(b), 'zh-Hans-CN');
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function(value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initFilters() {
    var grid = qs('.searchable-grid');
    if (!grid) {
      return;
    }
    var cards = qsa('.movie-card, .ranking-row', grid);
    var input = qs('[data-local-search]');
    var region = qs('[data-filter-region]');
    var type = qs('[data-filter-type]');
    var year = qs('[data-filter-year]');
    fillSelect(region, uniqueValues(cards, 'data-region'));
    fillSelect(type, uniqueValues(cards, 'data-type'));
    fillSelect(year, uniqueValues(cards, 'data-year').reverse());

    var params = new URLSearchParams(window.location.search);
    var keyword = params.get('keyword') || params.get('q') || '';
    if (keyword && input) {
      input.value = keyword;
    }

    function valueOf(control) {
      return control ? control.value.trim().toLowerCase() : '';
    }

    function apply() {
      var word = valueOf(input);
      var selectedRegion = valueOf(region);
      var selectedType = valueOf(type);
      var selectedYear = valueOf(year);
      cards.forEach(function(card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
        var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
        var cardType = (card.getAttribute('data-type') || '').toLowerCase();
        var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
        var textMatch = !word || title.indexOf(word) !== -1 || keywords.indexOf(word) !== -1 || cardRegion.indexOf(word) !== -1 || cardType.indexOf(word) !== -1 || cardYear.indexOf(word) !== -1;
        var regionMatch = !selectedRegion || cardRegion === selectedRegion;
        var typeMatch = !selectedType || cardType === selectedType;
        var yearMatch = !selectedYear || cardYear === selectedYear;
        card.classList.toggle('is-hidden', !(textMatch && regionMatch && typeMatch && yearMatch));
      });
    }

    [input, region, type, year].forEach(function(control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  }

  var hlsCache = new WeakMap();

  function attachStream(video) {
    var stream = video.getAttribute('data-stream');
    if (!stream) {
      return;
    }
    if (video.getAttribute('src') || hlsCache.has(video)) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
      hlsCache.set(video, hls);
      return;
    }
    video.src = stream;
  }

  function playBox(box) {
    var video = qs('video', box);
    if (!video) {
      return;
    }
    attachStream(video);
    box.classList.add('is-playing');
    var result = video.play();
    if (result && result.catch) {
      result.catch(function() {});
    }
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function(box) {
      var layer = qs('.play-layer', box);
      var video = qs('video', box);
      if (layer) {
        layer.addEventListener('click', function() {
          playBox(box);
        });
      }
      if (video) {
        video.addEventListener('play', function() {
          box.classList.add('is-playing');
        });
        video.addEventListener('click', function() {
          if (video.paused) {
            playBox(box);
          }
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
