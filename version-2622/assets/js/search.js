(function () {
  function createCard(movie) {
    var tags = Array.isArray(movie.tags) ? movie.tags.slice(0, 3) : [];
    var tagHtml = tags.map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "" +
      "<article class=\"movie-card\" data-title=\"" + escapeHtml(movie.title) + "\" data-type=\"" + escapeHtml(movie.type) + "\" data-genre=\"" + escapeHtml(movie.genre) + "\">" +
      "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"观看 " + escapeHtml(movie.title) + "\">" +
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"play-chip\">播放</span>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<div class=\"movie-meta-line\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
      "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
      "<p>" + escapeHtml(movie.description) + "</p>" +
      "<div class=\"tag-row\">" + tagHtml + "</div>" +
      "</div>" +
      "</article>";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get("q") || "").trim();
  }

  function match(movie, query) {
    if (!query) {
      return true;
    }
    var haystack = [
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      movie.category,
      movie.description,
      Array.isArray(movie.tags) ? movie.tags.join(" ") : ""
    ].join(" ").toLowerCase();
    return haystack.indexOf(query.toLowerCase()) !== -1;
  }

  function render(filter) {
    var box = document.getElementById("search-results");
    var input = document.getElementById("page-search");
    var query = getQuery();
    if (input && query) {
      input.value = query;
    }
    var movies = Array.isArray(window.SEARCH_MOVIES) ? window.SEARCH_MOVIES : [];
    var results = movies.filter(function (movie) {
      var typeText = String(movie.type || "") + " " + String(movie.genre || "");
      var typeOk = !filter || filter === "all" || typeText.indexOf(filter) !== -1;
      return typeOk && match(movie, query);
    }).slice(0, 240);
    if (!box) {
      return;
    }
    box.innerHTML = results.length ? results.map(createCard).join("") : "<div class=\"empty-result\">没有找到匹配影片</div>";
  }

  document.addEventListener("DOMContentLoaded", function () {
    render("all");
    document.querySelectorAll("[data-search-filter]").forEach(function (button) {
      button.addEventListener("click", function () {
        document.querySelectorAll("[data-search-filter]").forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        render(button.getAttribute("data-search-filter"));
      });
    });
  });
})();
