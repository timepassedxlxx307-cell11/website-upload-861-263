(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function textMatch(value, query) {
    return String(value || '').toLowerCase().indexOf(query) !== -1;
  }

  function renderSearchResult(item) {
    return [
      '<a class="search-result-item" href="' + item.url + '">',
      '<img src="' + item.image + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy">',
      '<span>',
      '<strong class="block text-stone-800 line-clamp-1">' + item.title + '</strong>',
      '<span class="block text-sm text-stone-500 line-clamp-1">' + item.year + ' · ' + item.region + ' · ' + item.type + '</span>',
      '<span class="block text-sm text-stone-600 line-clamp-2 mt-1">' + item.oneLine + '</span>',
      '</span>',
      '</a>'
    ].join('');
  }

  function updateSearch(form) {
    var input = qs('.site-search-input', form);
    var panel = qs('.search-panel', form);
    if (!input || !panel) {
      return;
    }
    var query = input.value.trim().toLowerCase();
    if (!query) {
      panel.hidden = true;
      panel.innerHTML = '';
      return;
    }
    var movies = window.siteMovies || [];
    var results = movies.filter(function (item) {
      return textMatch(item.title, query) || textMatch(item.terms, query) || textMatch(item.oneLine, query);
    }).slice(0, 12);
    panel.hidden = false;
    panel.innerHTML = results.length ? results.map(renderSearchResult).join('') : '<div class="p-4 text-stone-500">未找到相关影片</div>';
  }

  function setupSearch() {
    qsa('.site-search-form').forEach(function (form) {
      var input = qs('.site-search-input', form);
      var panel = qs('.search-panel', form);
      if (!input || !panel) {
        return;
      }
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        updateSearch(form);
      });
      input.addEventListener('input', function () {
        updateSearch(form);
      });
      input.addEventListener('focus', function () {
        updateSearch(form);
      });
    });

    document.addEventListener('click', function (event) {
      qsa('.site-search-form').forEach(function (form) {
        if (!form.contains(event.target)) {
          var panel = qs('.search-panel', form);
          if (panel) {
            panel.hidden = true;
          }
        }
      });
    });
  }

  function setupMobileMenu() {
    var toggle = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var previous = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
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

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(current - 1);
        startTimer();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        startTimer();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        startTimer();
      });
    });
    show(0);
    startTimer();
  }

  function setupCatalogFilters() {
    qsa('[data-filter-scope]').forEach(function (scope) {
      var buttons = qsa('[data-filter]', scope);
      var cards = qsa('.movie-card', scope);
      var pageInput = qs('[data-page-search]', scope);
      var activeFilter = 'all';

      function applyFilter() {
        var query = pageInput ? pageInput.value.trim().toLowerCase() : '';
        var visibleCount = 0;
        cards.forEach(function (card) {
          var haystack = String(card.getAttribute('data-tags') || '').toLowerCase();
          var matchesButton = activeFilter === 'all' || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var isVisible = matchesButton && matchesQuery;
          card.hidden = !isVisible;
          if (isVisible) {
            visibleCount += 1;
          }
        });
        var empty = qs('.empty-state', scope);
        if (empty) {
          empty.hidden = visibleCount !== 0;
        }
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          activeFilter = button.getAttribute('data-filter') || 'all';
          buttons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          applyFilter();
        });
      });
      if (pageInput) {
        pageInput.addEventListener('input', applyFilter);
      }
      applyFilter();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupSearch();
    setupMobileMenu();
    setupHero();
    setupCatalogFilters();
  });
}());
