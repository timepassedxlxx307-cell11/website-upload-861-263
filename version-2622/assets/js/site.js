(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".nav-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var carousel = document.querySelector(".hero-carousel");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });

    start();
  }

  function initSearchForms() {
    var forms = document.querySelectorAll(".site-search-form");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
        }
      });
    });
  }

  function initFilters() {
    var bars = document.querySelectorAll(".filter-bar");
    bars.forEach(function (bar) {
      var buttons = Array.prototype.slice.call(bar.querySelectorAll("[data-filter]"));
      if (!buttons.length) {
        return;
      }
      var section = bar.closest(".content-section");
      var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          var value = button.getAttribute("data-filter");
          buttons.forEach(function (item) {
            item.classList.toggle("active", item === button);
          });
          cards.forEach(function (card) {
            var type = card.getAttribute("data-type") || "";
            var genre = card.getAttribute("data-genre") || "";
            var visible = value === "all" || type.indexOf(value) !== -1 || genre.indexOf(value) !== -1;
            card.style.display = visible ? "" : "none";
          });
        });
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initSearchForms();
    initFilters();
  });
})();
