(function () {
    const qs = function (selector, scope) {
        return (scope || document).querySelector(selector);
    };

    const qsa = function (selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    };

    const menuToggle = qs('[data-menu-toggle]');
    const mobilePanel = qs('[data-mobile-panel]');

    if (menuToggle && mobilePanel) {
        menuToggle.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    const carousel = qs('[data-hero-carousel]');

    if (carousel) {
        const slides = qsa('[data-hero-slide]', carousel);
        const dots = qsa('[data-hero-dot]', carousel);
        const prev = qs('[data-hero-prev]', carousel);
        const next = qs('[data-hero-next]', carousel);
        let active = 0;
        let timer = null;

        const setActive = function (index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        };

        const start = function () {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                setActive(active + 1);
            }, 5200);
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                setActive(index);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                setActive(active - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                setActive(active + 1);
                start();
            });
        }

        start();
    }

    const searchLayer = qs('[data-search-layer]');
    const searchResults = qs('[data-search-results]');
    const closeSearch = qs('[data-search-close]');

    const openSearch = function () {
        if (searchLayer) {
            searchLayer.hidden = false;
        }
    };

    const closeSearchLayer = function () {
        if (searchLayer) {
            searchLayer.hidden = true;
        }
    };

    if (closeSearch) {
        closeSearch.addEventListener('click', closeSearchLayer);
    }

    if (searchLayer) {
        searchLayer.addEventListener('click', function (event) {
            if (event.target === searchLayer) {
                closeSearchLayer();
            }
        });
    }

    const renderSearch = function (term) {
        if (!searchResults || !Array.isArray(window.YG_MOVIES)) {
            return;
        }

        const keyword = term.trim().toLowerCase();
        if (!keyword) {
            return;
        }

        const matched = window.YG_MOVIES.filter(function (movie) {
            return movie.keywords.toLowerCase().indexOf(keyword) !== -1;
        }).slice(0, 18);

        if (matched.length === 0) {
            searchResults.innerHTML = '<p class="empty-result">没有找到相关影片</p>';
        } else {
            searchResults.innerHTML = matched.map(function (movie) {
                return '<a class="search-result-item" href="' + movie.url + '">' +
                    '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '">' +
                    '<span><strong>' + escapeHtml(movie.title) + '</strong>' +
                    '<p>' + escapeHtml(movie.description) + '</p></span>' +
                    '</a>';
            }).join('');
        }

        openSearch();
    };

    qsa('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const input = qs('input[name="q"], input[type="search"]', form);
            renderSearch(input ? input.value : '');
        });
    });

    const filterPanel = qs('[data-filter-panel]');

    if (filterPanel) {
        const input = qs('[data-local-filter]', filterPanel);
        const yearButtons = qsa('[data-filter-year]', filterPanel);
        const cards = qsa('[data-movie-card]', qs('[data-filter-grid]') || document);
        let activeYear = 'all';

        const runFilter = function () {
            const keyword = input ? input.value.trim().toLowerCase() : '';
            cards.forEach(function (card) {
                const title = (card.getAttribute('data-title') || '').toLowerCase();
                const keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
                const yearMatched = activeYear === 'all' || keywords.indexOf(activeYear.toLowerCase()) !== -1;
                const keywordMatched = !keyword || title.indexOf(keyword) !== -1 || keywords.indexOf(keyword) !== -1;
                card.hidden = !(yearMatched && keywordMatched);
            });
        };

        if (input) {
            input.addEventListener('input', runFilter);
        }

        yearButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeYear = button.getAttribute('data-filter-year') || 'all';
                yearButtons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                runFilter();
            });
        });
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>'"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[char];
        });
    }
})();
