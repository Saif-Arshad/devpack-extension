document.addEventListener('DOMContentLoaded', () => {
    // =========== DOM Elements ===========
    const backButton = document.getElementById('backButton');
    const pageTitle = document.getElementById('pageTitle');

    const searchBar = document.getElementById('searchBar');

    // Views
    const homeView = document.getElementById('homeView');
    const categoryView = document.getElementById('categoryView');
    const categoryItems = document.getElementById('categoryItems');
    const searchResultsView = document.getElementById('searchResultsView');
    const searchResultsList = document.getElementById('searchResultsList');

    const categoriesList = document.getElementById('categoriesList');

    const categories = [
        {
            name: 'favorites',
            label: 'Favorites',
            filePath: 'Resources/favorites.json',
            icon: `
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 12.026l-3.995 2.178.763-4.444L1.07 6.691l4.456-.647L8 2l2.473 4.044 4.456.647-3.698 3.069.763 4.444L8 12.026z"/>
                </svg>
            `
        },
        {
            name: 'icons',
            label: 'Icons',
            filePath: 'Resources/icons.json',
            icon: `
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M2 2h12v12H2z" fill="none" stroke="currentColor" stroke-width="1"/>
                    <text x="50%" y="55%" text-anchor="middle" font-size="9" fill="currentColor">ICN</text>
                </svg>
            `
        },
        {
            name: 'components',
            label: 'Components',
            filePath: 'Resources/components.json',
            icon: `
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="1" y="1" width="14" height="6" rx="1" ry="1" fill="currentColor" opacity="0.3"/>
                    <rect x="1" y="9" width="14" height="6" rx="1" ry="1" fill="currentColor"/>
                </svg>
            `
        }
    ];

    let allResources = {};
    let currentView = 'home'; // 'home' | 'category' | 'search'
    let currentCategory = ''; // e.g. 'favorites'

    // =========== DYNAMIC CATEGORY LIST CREATION ===========
    // Build the <li> elements for each category and append them to #categoriesList
    function renderCategoryList() {
        // Clear any existing <li> items (if needed)
        categoriesList.innerHTML = '';

        categories.forEach(category => {
            const li = document.createElement('li');
            li.classList.add('categoryItem');
            li.setAttribute('data-category', category.name);

            // Optional: add an icon + label
            // If you want the icon inline, you can just set innerHTML to icon + label:
            li.innerHTML = `
                <span class="category-icon" style="margin-right: 6px;">
                    ${category.icon}
                </span>
                <span class="category-label">${category.label}</span>
            `;

            categoriesList.appendChild(li);
        });
    }

    // Call it once on DOMContentLoaded, so the category list is visible
    renderCategoryList();

    // =========== FETCH DATA for All Categories ===========
    // We map over categories, fetch each JSON, then store them in allResources[name].
    Promise.all(
        categories.map(cat =>
            fetch(chrome.runtime.getURL(cat.filePath)).then(r => r.json())
        )
    )
        .then(dataArray => {
            // dataArray is an array of JSON results in the same order as categories
            dataArray.forEach((jsonData, i) => {
                const catName = categories[i].name;
                allResources[catName] = jsonData;
            });
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

        // Use Google's favicon service (or your own icon logic)
        const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${item.link}`;

        resourceItem.innerHTML = `
            <img class="resource-favicon" src="${faviconUrl}" alt="favicon" />
            <div class="resource-info">
                <div class="resource-name">${item.name}</div>
                <div class="resource-description">${item.description}</div>
            </div>
        `;

        resourceItem.addEventListener('click', () => {
            // Open link in new tab
            chrome.tabs.create({ url: item.link });
        });

        return resourceItem;
    }

    // =========== EVENT: CLICK ON A CATEGORY (HOME SCREEN) ===========
    categoriesList.addEventListener('click', (e) => {
        // Make sure we're clicking on the .categoryItem (li)
        const li = e.target.closest('.categoryItem');
        if (!li) return;

        const categoryName = li.getAttribute('data-category');
        showCategoryView(categoryName);
    });

    // =========== EVENT: BACK BUTTON ===========
    backButton.addEventListener('click', () => {
        if (currentView === 'category' || currentView === 'search') {
            searchBar.value = ''; // clear search bar
            showHomeView();
        }
    });

    // =========== EVENT: SEARCH BAR ===========
    searchBar.addEventListener('input', () => {
        const query = searchBar.value.trim().toLowerCase();

        if (query === '') {
            // If search is cleared, return to home view (if we were in search)
            if (currentView === 'search') {
                showHomeView();
            }
            return;
        }

        // Global search across all categories
        const allMatches = [];
        Object.keys(allResources).forEach((catKey) => {
            const items = allResources[catKey] || [];
            items.forEach((item) => {
                const textToSearch = (
                    item.name +
                    ' ' +

                    (item.tags || []).join(' ')
                ).toLowerCase();

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
