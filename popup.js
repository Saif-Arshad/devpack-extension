document.addEventListener('DOMContentLoaded', () => {
    // =========== DOM Elements ===========
    const body = document.body;
    const header = document.getElementById('header');
    const toggleThemeBtn = document.getElementById('toggleThemeBtn');
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');

    const backButton = document.getElementById('backButton');
    const pageTitle = document.getElementById('pageTitle');

    const searchBar = document.getElementById('searchBar');

    // Views
    const homeView = document.getElementById('homeView');
    const categoryView = document.getElementById('categoryView');
    const categoryItems = document.getElementById('categoryItems');
    const searchResultsView = document.getElementById('searchResultsView');
    const searchResultsList = document.getElementById('searchResultsList');

    // Category list items
    const categoriesList = document.getElementById('categoriesList');

    // =========== State Variables ===========
    let allResources = {
        favorites: [],
        icons: [],
        components: []
    };
    let currentView = 'home'; // 'home' | 'category' | 'search'
    let currentCategory = ''; // e.g. 'favorites'
    let previousView = 'home'; // track the previous view for going back from search, if needed

    // =========== THEME TOGGLE ===========
    chrome.storage.local.get('theme', (result) => {
        const savedTheme = result.theme || 'dark'; // Default to dark theme
        body.classList.add(savedTheme);
        header.classList.toggle('light', savedTheme === 'light');
        sunIcon.style.display = savedTheme === 'light' ? 'block' : 'none';
        moonIcon.style.display = savedTheme === 'light' ? 'none' : 'block';
    });

    toggleThemeBtn.addEventListener('click', () => {
        const isDark = body.classList.contains('dark');
        const newTheme = isDark ? 'light' : 'dark';

        body.classList.toggle('dark', !isDark);
        body.classList.toggle('light', isDark);
        header.classList.toggle('light', isDark);

        sunIcon.style.display = isDark ? 'block' : 'none';
        moonIcon.style.display = isDark ? 'none' : 'block';

        chrome.storage.local.set({ theme: newTheme });
    });

    // =========== FETCH DATA ===========
    Promise.all([
        fetch(chrome.runtime.getURL('resources/favorites.json')).then((r) => r.json()),
        fetch(chrome.runtime.getURL('resources/icons.json')).then((r) => r.json()),
        fetch(chrome.runtime.getURL('resources/components.json')).then((r) => r.json())
    ])
        .then(([favoritesData, iconsData, componentsData]) => {
            allResources.favorites = favoritesData;
            allResources.icons = iconsData;
            allResources.components = componentsData;
        })
        .catch((error) => console.error('Error fetching JSON files:', error));

    // =========== VIEW TOGGLING HELPERS ===========

    function showHomeView() {
        homeView.style.display = 'block';
        categoryView.style.display = 'none';
        searchResultsView.style.display = 'none';

        pageTitle.textContent = 'Home';
        backButton.style.display = 'none';
        currentView = 'home';
    }

    function showCategoryView(categoryName) {
        homeView.style.display = 'none';
        categoryView.style.display = 'block';
        searchResultsView.style.display = 'none';

        pageTitle.textContent = capitalize(categoryName);
        backButton.style.display = 'inline-block';

        // Clear old items
        categoryItems.innerHTML = '';

        // Render items from the chosen category
        const items = allResources[categoryName] || [];
        items.forEach((item) => {
            categoryItems.appendChild(createResourceItemElement(item));
        });

        currentView = 'category';
        currentCategory = categoryName;
    }

    function showSearchResultsView(query, matchedItems) {
        homeView.style.display = 'none';
        categoryView.style.display = 'none';
        searchResultsView.style.display = 'block';

        pageTitle.textContent = `Search: "${query}"`;
        backButton.style.display = 'inline-block';

        // Clear old results
        searchResultsList.innerHTML = '';

        matchedItems.forEach((item) => {
            searchResultsList.appendChild(createResourceItemElement(item));
        });

        currentView = 'search';
    }

    // =========== CREATE RESOURCE ITEM ELEMENT ===========

    function createResourceItemElement(item) {
        const resourceItem = document.createElement('div');
        resourceItem.className = 'resource-item';

        const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${item.link}`;

        resourceItem.innerHTML = `
      <img class="resource-favicon" src="${faviconUrl}" alt="favicon" />
      <div class="resource-info">
        <div class="resource-name">${item.name}</div>
        <div class="resource-description">${item.description}</div>
      </div>
    `;

        resourceItem.addEventListener('click', () => {
            // Open link in new tab (or do something else if you want)
            chrome.tabs.create({ url: item.link });
        });

        return resourceItem;
    }

    // =========== EVENT: CLICK ON A CATEGORY (HOME SCREEN) ===========
    categoriesList.addEventListener('click', (e) => {
        if (e.target.classList.contains('categoryItem')) {
            const categoryName = e.target.getAttribute('data-category');
            showCategoryView(categoryName);
        }
    });

    // =========== EVENT: BACK BUTTON ===========
    backButton.addEventListener('click', () => {
        if (currentView === 'category' || currentView === 'search') {
            // Go back to home
            searchBar.value = ''; // clear search bar
            showHomeView();
        }
    });

    // =========== EVENT: SEARCH BAR ===========
    searchBar.addEventListener('input', () => {
        const query = searchBar.value.trim().toLowerCase();

        if (query === '') {
            // If search is cleared, go back to whatever we were viewing before
            // or just default to the home screen
            if (currentView === 'search') {
                showHomeView();
            }
            return;
        }

        // If there's a query, we do a global search across all categories
        const allMatches = [];

        Object.keys(allResources).forEach((catKey) => {
            const items = allResources[catKey];
            items.forEach((item) => {
                const textToSearch =
                    (item.name + ' ' + item.description + ' ' + (item.tags || []).join(' '))
                        .toLowerCase();
                if (textToSearch.includes(query)) {
                    allMatches.push(item);
                }
            });
        });

        showSearchResultsView(query, allMatches);
    });

    // =========== UTILITY ===========

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Start on home view by default
    showHomeView();
});
