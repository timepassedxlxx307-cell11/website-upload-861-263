(function () {
    var input = document.querySelector('[data-search-page-input]');
    var title = document.querySelector('[data-search-title]');
    var results = document.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var data = Array.isArray(SEARCH_INDEX) ? SEARCH_INDEX : [];

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function card(movie) {
        return [
            '<article class="movie-card">',
            '<a href="' + escapeHtml(movie.href) + '" class="card-link">',
            '<div class="poster-wrap">',
            '<img src="./' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="corner-label">' + escapeHtml(movie.category) + '</span>',
            '<span class="year-label">' + escapeHtml(movie.year) + '</span>',
            '<div class="poster-caption">',
            '<h3>' + escapeHtml(movie.title) + '</h3>',
            '<p>' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.region) + '</p>',
            '</div>',
            '</div>',
            '<div class="card-body">',
            '<p>' + escapeHtml(movie.oneLine) + '</p>',
            '<div class="tag-list"><span class="tag-pill">' + escapeHtml(movie.genre) + '</span></div>',
            '</div>',
            '</a>',
            '</article>'
        ].join('');
    }

    function render() {
        var keyword = query.toLowerCase();
        var list = keyword ? data.filter(function (movie) {
            return movie.search.indexOf(keyword) !== -1;
        }) : data.slice(0, 60);

        if (input) {
            input.value = query;
        }

        if (title) {
            title.textContent = keyword ? '与“' + query + '”相关的影片' : '推荐影片';
        }

        if (results) {
            results.innerHTML = list.slice(0, 120).map(card).join('');
        }
    }

    render();
})();
