(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = qs('[data-menu-toggle]');
  var mobilePanel = qs('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  qsa('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = qs('input[name="q"]', form);
      var value = input ? input.value.trim() : '';
      if (value) {
        window.location.href = './search.html?q=' + encodeURIComponent(value);
      }
    });
  });

  function applyQuery(value) {
    var keyword = (value || '').trim().toLowerCase();
    qsa('[data-card]').forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year')
      ].join(' ').toLowerCase();
      var matched = !keyword || haystack.indexOf(keyword) !== -1;
      card.classList.toggle('is-hidden', !matched);
    });
  }

  var pageSearch = qs('[data-page-search]');
  if (pageSearch) {
    var pageInput = qs('input[name="q"]', pageSearch);
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    if (pageInput) {
      pageInput.value = initialQuery;
      applyQuery(initialQuery);
      pageInput.addEventListener('input', function () {
        applyQuery(pageInput.value);
      });
    }
    pageSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      if (pageInput) {
        applyQuery(pageInput.value);
      }
    });
  }

  qsa('[data-filter-bar]').forEach(function (bar) {
    var buttons = qsa('[data-filter]', bar);
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        var filter = button.getAttribute('data-filter');
        qsa('[data-card]').forEach(function (card) {
          var type = card.getAttribute('data-type') || '';
          var matched = filter === 'all' || type.indexOf(filter) !== -1;
          card.classList.toggle('is-hidden', !matched);
        });
      });
    });
  });

  qsa('[data-hero]').forEach(function (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener('click', function () {
        show(itemIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });
})();