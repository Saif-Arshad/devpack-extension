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

    // Predefined categories
    const categories = [
        {
            name: 'icons',
            label: 'Icons',
            filePath: 'Resources/icons.json',
            background: "#2B6DFF",
            icon: `<img src="./Assets/icons.svg" alt="icons" />`,
        },
        {
            name: '3d',
            label: '3D',
            filePath: 'Resources/3d.json',
            background: "#8935FF",
            icon: `<img src="./Assets/3d.svg" alt="3D" />`,
        },
        {
            name: 'background',
            label: 'Background',
            filePath: 'Resources/background.json',
            background: "#5548EB",
            icon: `<img src="./Assets/backgrounds.svg" alt="background" />`,
        },
        {
            name: 'blog',
            label: 'Blog',
            filePath: 'Resources/blog.json',
            background: "#058CDB",
            icon: `<img src="./Assets/blogs.svg" alt="blog" />`,
        },
        {
            name: 'colors',
            label: 'Colors',
            filePath: 'Resources/colors.json',
            background: "#FF45A9",
            icon: `<img src="./Assets/colors.svg" alt="colors" />`,
        },
        {
            name: 'components',
            label: 'Components',
            filePath: 'Resources/components.json',
            background: "#32CD6B",
            icon: `<img src="./Assets/components.svg" alt="components" />`,
        },
        {
            name: 'illustrations',
            label: 'Illustrations',
            filePath: 'Resources/illustrations.json',
            background: "#1F8B26",
            icon: `<img src="./Assets/illustrations.svg" alt="illustrations" />`,
        },
        {
            name: 'libaries',
            label: 'Libraries',
            filePath: 'Resources/libraries.json',
            background: "#FF006E",
            icon: `<img src="./Assets/libraries.svg" alt="libraries" />`,
        },
        {
            name: 'photos',
            label: 'Photos',
            filePath: 'Resources/photos.json',
            background: "#A81DBF",
            icon: `<img src="./Assets/photos.svg" alt="photos" />`,
        },
        {
            name: 'tools',
            label: 'Tools',
            filePath: 'Resources/tools.json',
            background: "#F97316",
            icon: `<img src="./Assets/tools.svg" alt="tools" />`,
        },
        {
            name: 'font',
            label: 'Fonts',
            filePath: 'Resources/fonts.json',
            background: "#E79B1C",
            icon: `<img src="./Assets/typography.svg" alt="fonts" />`,
        },
        {
            name: 'video',
            label: 'Video',
            filePath: 'Resources/video.json',
            background: "#C22246",
            icon: `<img src="./Assets/videos.svg" alt="video" />`,
        },
    ];

    let allResources = {};
    let totalResources = 0;    // Will hold the combined count
    let currentView = 'home';  // Tracks which view is active
    let currentCategory = '';

    // ============= Fetch Data & Initialize =============
    Promise.all(
        categories.map(cat =>
            fetch(chrome.runtime.getURL(cat.filePath)).then(r => r.json())
        )
    )
        .then(dataArray => {
            dataArray.forEach((jsonData, i) => {
                const catName = categories[i].name;
                // Sort each category's data
                const sortedData = jsonData.sort((a, b) => a.name.localeCompare(b.name));
                allResources[catName] = sortedData;

                // Accumulate total resources
                totalResources += sortedData.length;
            });

            // Render categories, favorites, then show home view with correct total
            renderCategoryList();
            updateFavoritesView();

            // Now that data is ready, show the Home View (correct total)
            showHomeView();
        })
        .catch(error => console.error('Error fetching JSON files:', error));

    // =========== View Functions ===========
    // Scroll to top when switching views
    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Show the Home view
    function showHomeView() {
        // Switch view states
        homeView.style.display = 'block';
        categoryView.style.display = 'none';
        searchResultsView.style.display = 'none';
        favoritesView.style.display = 'none';

        // Update pageTitle to display total resources
        pageTitle.innerHTML = `
        <div style="display:flex; align-item:center; width:100%; justify-content:space-between">
           
            <span style="margin-left: 8px;">Total resources: ${totalResources}</span>
        </div>
            `;

        // Hide back button on home
        backButton.style.display = 'none';
        currentView = 'home';

        scrollToTop();
    }

    // Show the selected Category view
    function showCategoryView(categoryName) {
        homeView.style.display = 'none';
        categoryView.style.display = 'block';
        searchResultsView.style.display = 'none';
        favoritesView.style.display = 'none';

        const catObj = categories.find(cat => cat.name === categoryName);
        pageTitle.innerHTML = `
            <div class="title-page">
                ${catObj.icon}
                <span>${catObj.label}</span>
            </div>
        `;
        backButton.style.display = 'inline-block';

        categoryItems.innerHTML = '';
        const items = allResources[categoryName] || [];
        items.forEach((item) => {
            categoryItems.appendChild(createResourceItemElement(item, false, false));
        });

        currentView = 'category';
        currentCategory = categoryName;

        scrollToTop();
    }

    // Show Search Results view
    function showSearchResultsView(query, matchedItems) {
        homeView.style.display = 'none';
        categoryView.style.display = 'none';
        searchResultsView.style.display = 'block';
        favoritesView.style.display = 'none';

        pageTitle.textContent = `Search: "${query}"`;
        backButton.style.display = 'inline-block';

        searchResultsList.innerHTML = '';
        matchedItems.forEach(item => {
            searchResultsList.appendChild(createResourceItemElement(item, false, false));
        });

        currentView = 'search';
        scrollToTop();
    }

    // Show Favorites view
    function showFavoritesView() {
        homeView.style.display = 'none';
        categoryView.style.display = 'none';
        searchResultsView.style.display = 'none';
        favoritesView.style.display = 'block';

        pageTitle.textContent = 'My Favorites';
        backButton.style.display = 'inline-block';

        updateFavoritesView();
        currentView = 'favorites';

        scrollToTop();
    }

    // =========== Render Category List ===========
    function renderCategoryList() {
        categoriesList.innerHTML = '';

        categories.forEach(category => {
            const li = document.createElement('li');
            li.classList.add('categoryItem');
            li.style.color = '#ffffff';

            const resourceCount = allResources[category.name]?.length || 0;
            li.innerHTML = `
                <div class="category-icon" style="background-color: ${category.background};">
                    ${category.icon}
                </div>
                <span class="category-label">${category.label}</span>
                <span class="resource-count">${resourceCount} resources</span>
            `;

            li.addEventListener('click', () => showCategoryView(category.name));
            categoriesList.appendChild(li);
        });
    }

    // =========== Resource Item Creation ===========
    function createResourceItemElement(item, isFavorite = false, isCustom = false) {
        const resourceItem = document.createElement('div');
        resourceItem.className = 'resource-item';

        const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${item.link}`;



        const iconHTML = isFavorite
            ? `<span class="remove-icon" data-is-custom="${isCustom}">×</span>`
            : `<span class="star-icon" data-resource-id="${item.name}">★</span>`;

        resourceItem.innerHTML = `
            <img class="resource-favicon" src="${faviconUrl}" alt="favicon" />
            <div class="resource-info">
                <div class="resource-name">${item.name}</div>
                ${!isFavorite
                ? `<div class="resource-description">${item.description}</div>`
                : ''
            }
            </div>
            ${iconHTML}
        `;

        // Click opens the link (unless clicking the star/remove icon)
        resourceItem.addEventListener('click', (e) => {
            const target = e.target;
            if (
                !target.classList.contains('star-icon') &&
                !target.classList.contains('remove-icon')
            ) {
                chrome.tabs.create({ url: item.link });
            }
        });

        // If it's a favorite item, handle removing from favorites
        if (isFavorite) {
            const removeIcon = resourceItem.querySelector('.remove-icon');
            removeIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                removeIcon.classList.add('animate');
                setTimeout(() => removeIcon.classList.remove('animate'), 300);

                // If it's a custom domain favorite, remove from customFavorites
                if (isCustom) {
                    removeCustomFavorite(item.name);
                } else {
                    // Otherwise, remove from normal favorites
                    toggleFavorite(item.name, true); // pass "forceRemove" = true
                }
            });
        }
        // If not favorite, handle toggling "add to favorite"
        else {
            const starIcon = resourceItem.querySelector('.star-icon');
            starIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                starIcon.classList.add('animate');
                setTimeout(() => starIcon.classList.remove('animate'), 300);
                toggleFavorite(item.name);
            });

            // Check if already in favorites, visually mark
            chrome.storage.sync.get(['favorites'], (result) => {
                const favorites = result.favorites || [];
                if (favorites.includes(item.name)) {
                    starIcon.classList.add('favorited');
                }
            });
        }

        return resourceItem;
    }

    // =========== Favorites Logic ===========
    function toggleFavorite(resourceName, forceRemove = false) {
        chrome.storage.sync.get(['favorites'], (result) => {
            let favorites = result.favorites || [];
            const index = favorites.indexOf(resourceName);

            if (forceRemove) {
                if (index !== -1) {
                    favorites.splice(index, 1);
                }
            } else {
                if (index === -1) {
                    favorites.push(resourceName);
                } else {
                    favorites.splice(index, 1);
                }
            }

            chrome.storage.sync.set({ favorites }, () => {
                updateFavoritesView();
                const starIcon = document.querySelector(`.star-icon[data-resource-id="${resourceName}"]`);
                if (starIcon) {
                    // If we added the favorite (index was -1) => add .favorited
                    starIcon.classList.toggle('favorited', index === -1 && !forceRemove);
                }
            });
        });
    }

    function removeCustomFavorite(domain) {
        chrome.storage.sync.get(['customFavorites'], (result) => {
            let customFavorites = result.customFavorites || [];
            const idx = customFavorites.indexOf(domain);
            if (idx !== -1) {
                customFavorites.splice(idx, 1);
            }
            chrome.storage.sync.set({ customFavorites }, () => {
                updateFavoritesView();
            });
        });
    }

    function updateFavoritesView() {
        chrome.storage.sync.get(['favorites', 'customFavorites'], (result) => {
            const favorites = result.favorites || [];
            const customFavorites = result.customFavorites || [];

            favoriteCount.textContent = favorites.length + customFavorites.length;
            favoritesList.innerHTML = '';

            // Render normal favorites
            favorites.forEach(resourceName => {
                const item = findResourceByName(resourceName);
                if (item) {
                    favoritesList.appendChild(createResourceItemElement(item, true, false));
                }
            });

            // Render custom domain favorites
            customFavorites.forEach(domain => {
                const customItem = {
                    name: domain,
                    link: `https://${domain}`,
                    description: ''
                };
                favoritesList.appendChild(createResourceItemElement(customItem, true, true));
            });

            // If empty, add 'empty' class for styling a "No favorites" message
            if (favorites.length === 0 && customFavorites.length === 0) {
                favoritesView.classList.add('empty');
            } else {
                favoritesView.classList.remove('empty');
            }
        });
    }

    function findResourceByName(resourceName) {
        for (const categoryData of Object.values(allResources)) {
            const item = categoryData.find(res => res.name === resourceName);
            if (item) return item;
        }
        return null;
    }

    // =========== Event Listeners ===========
    myFav.addEventListener('click', () => {
        showFavoritesView();
    });

    backButton.addEventListener('click', () => {
        // Clicking back always goes home in this setup
        showHomeView();
    });

    searchBar.addEventListener('input', () => {
        const query = searchBar.value.trim().toLowerCase();
        if (!query) {
            // If empty search, go back to home
            showHomeView();
            return;
        }
        // Search all categories
        const matched = [];
        for (const categoryData of Object.values(allResources)) {
            categoryData.forEach(item => {
                const textToSearch = (item.name + ' ' + (item.tags || []).join(' ')).toLowerCase();
                if (textToSearch.includes(query)) {
                    matched.push(item);
                }
            });
        }
        showSearchResultsView(query, matched);
    });

    // NOTE: We do NOT call showHomeView() here,
    // because we only show the real home view AFTER data loads
});
