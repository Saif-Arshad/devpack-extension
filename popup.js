document.addEventListener('DOMContentLoaded', () => {
    // =========== DOM Elements ===========
    const backButton = document.getElementById('backButton');
    const pageTitle = document.getElementById('pageTitle');
    const searchBar = document.getElementById('searchBar');
    const homeView = document.getElementById('homeView');
    const categoryView = document.getElementById('categoryView');
    const categoryItems = document.getElementById('categoryItems');
    const searchResultsView = document.getElementById('searchResultsView');
    const searchResultsList = document.getElementById('searchResultsList');
    const categoriesList = document.getElementById('categoriesList');
    const favoritesView = document.getElementById('favoritesView');
    const favoritesList = document.getElementById('favoritesList');
    const favoriteCount = document.getElementById('favoriteCount');
    const myFav = document.getElementById('my_fav');

    const categories = [
        {
            name: 'icons',
            label: 'Icons',
            filePath: 'Resources/icons.json',
        },
        {
            name: 'components',
            label: 'Components',
            filePath: 'Resources/components.json',
        },

    ];

    let allResources = {};
    let currentView = 'home';
    let currentCategory = '';

    // =========== FETCH DATA for All Categories ===========
    Promise.all(
        categories.map(cat =>
            fetch(chrome.runtime.getURL(cat.filePath)).then(r => r.json())
        )
    )
        .then(dataArray => {
            dataArray.forEach((jsonData, i) => {
                const catName = categories[i].name;
                allResources[catName] = jsonData.sort((a, b) => a.name.localeCompare(b.name));
            });
            renderCategoryList();
            updateFavoritesView(); // Initialize favorites view
        })
        .catch((error) => console.error('Error fetching JSON files:', error));

    // =========== RENDER CATEGORIES LIST ===========
    function renderCategoryList() {
        categoriesList.innerHTML = '';
        categories.forEach(category => {
            const li = document.createElement('li');
            li.classList.add('categoryItem');
            li.setAttribute('data-category', category.name);

            const resourceCount = allResources[category.name]?.length || 0;
            li.innerHTML = `
                <span class="category-label">${category.label}</span>
                <span class="resource-count">(${resourceCount} resources)</span>
            `;

            li.addEventListener('click', () => showCategoryView(category.name));
            categoriesList.appendChild(li);
        });
    }

    // =========== VIEW TOGGLING HELPERS ===========
    function showHomeView() {
        homeView.style.display = 'block';
        categoryView.style.display = 'none';
        searchResultsView.style.display = 'none';
        favoritesView.style.display = 'none';
        pageTitle.innerHTML = '<img src="./Assets/home-button.png" style="height: 18px; width: 20px;" alt="">';
        backButton.style.display = 'none';
        currentView = 'home';
    }

    function showCategoryView(categoryName) {
        homeView.style.display = 'none';
        categoryView.style.display = 'block';
        searchResultsView.style.display = 'none';
        favoritesView.style.display = 'none';
        pageTitle.textContent = capitalize(categoryName);
        backButton.style.display = 'inline-block';
        categoryItems.innerHTML = '';
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
        favoritesView.style.display = 'none';
        pageTitle.textContent = `Search: "${query}"`;
        backButton.style.display = 'inline-block';
        searchResultsList.innerHTML = '';
        matchedItems.forEach((item) => {
            searchResultsList.appendChild(createResourceItemElement(item));
        });
        currentView = 'search';
    }

    function showFavoritesView() {
        homeView.style.display = 'none';
        categoryView.style.display = 'none';
        searchResultsView.style.display = 'none';
        favoritesView.style.display = 'block';
        pageTitle.textContent = 'My Favorites';
        backButton.style.display = 'inline-block';
        updateFavoritesView();
        currentView = 'favorites';
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
            <span class="star-icon" data-resource-id="${item.name}">★</span>
        `;

        resourceItem.addEventListener('click', (e) => {
            if (!e.target.classList.contains('star-icon')) {
                chrome.tabs.create({ url: item.link });
            }
        });

        const starIcon = resourceItem.querySelector('.star-icon');
        starIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(item.name);
            starIcon.classList.add('animate');
            setTimeout(() => starIcon.classList.remove('animate'), 300);
        });

        // Check if the item is already a favorite
        chrome.storage.sync.get(['favorites'], (result) => {
            const favorites = result.favorites || [];
            if (favorites.includes(item.name)) {
                starIcon.classList.add('favorited');
            }
        });

        return resourceItem;
    }

    function toggleFavorite(resourceName) {
        chrome.storage.sync.get(['favorites'], (result) => {
            const favorites = result.favorites || [];
            const index = favorites.indexOf(resourceName);
            if (index === -1) {
                favorites.push(resourceName);
            } else {
                favorites.splice(index, 1);
            }
            chrome.storage.sync.set({ favorites }, () => {
                updateFavoritesView();
                const starIcon = document.querySelector(`.star-icon[data-resource-id="${resourceName}"]`);
                if (starIcon) {
                    starIcon.classList.toggle('favorited');
                }
            });
        });
    }

    function updateFavoritesView() {
        chrome.storage.sync.get(['favorites'], (result) => {
            const favorites = result.favorites || [];
            favoriteCount.textContent = favorites.length;

            favoritesList.innerHTML = '';
            if (favorites.length > 0) {
                favorites.forEach(resourceName => {
                    const item = findResourceByName(resourceName);
                    if (item) {
                        favoritesList.appendChild(createResourceItemElement(item));
                    }
                });
                favoritesView.classList.remove('empty');
            } else {
                favoritesView.classList.add('empty');
            }
        });
    }

    function findResourceByName(resourceName) {
        for (const category of Object.values(allResources)) {
            const item = category.find(res => res.name === resourceName);
            if (item) return item;
        }
        return null;
    }

    myFav.addEventListener('click', () => {
        showFavoritesView();
    });

    backButton.addEventListener('click', () => {
        if (currentView === 'category' || currentView === 'search' || currentView === 'favorites') {
            searchBar.value = '';
            showHomeView();
        }
    });

    searchBar.addEventListener('input', () => {
        const query = searchBar.value.trim().toLowerCase();
        if (query === '') {
            if (currentView === 'search') {
                showHomeView();
            }
            return;
        }
        const allMatches = [];
        Object.keys(allResources).forEach((catKey) => {
            const items = allResources[catKey] || [];
            items.forEach((item) => {
                const textToSearch = (item.name + ' ' + (item.tags || []).join(' ')).toLowerCase();
                if (textToSearch.includes(query)) {
                    allMatches.push(item);
                }
            });
        });
        showSearchResultsView(query, allMatches);
    });

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    showHomeView();
});