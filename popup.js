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

    // Predefined categories with icon and background color
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
    let currentView = 'home';
    let currentCategory = '';

    // Fetch all categories' JSON data
    Promise.all(
        categories.map(cat =>
            fetch(chrome.runtime.getURL(cat.filePath)).then(r => r.json())
        )
    )
        .then(dataArray => {
            dataArray.forEach((jsonData, i) => {
                const catName = categories[i].name;
                // Sort resources alphabetically by name
                allResources[catName] = jsonData.sort((a, b) => a.name.localeCompare(b.name));
            });
            renderCategoryList();
            updateFavoritesView();
        })
        .catch((error) => console.error('Error fetching JSON files:', error));

    // =========== Render Category List ===========
    function renderCategoryList() {
        categoriesList.innerHTML = '';

        categories.forEach(category => {
            const li = document.createElement('li');
            li.classList.add('categoryItem');
            li.setAttribute('data-category', category.name);

            // Set the entire background color
            li.style.backgroundColor = category.background;

            // We want the text/icon to be white, so let's ensure color is white
            li.style.color = '#ffffff';

            const resourceCount = allResources[category.name]?.length || 0;

            li.innerHTML = `
        <div class="category-icon">
          ${category.icon}
        </div>
        <span class="category-label">${category.label}</span>
        <span class="resource-count">(${resourceCount} resources)</span>
      `;

            li.addEventListener('click', () => showCategoryView(category.name));
            categoriesList.appendChild(li);
        });
    }

    // =========== View Handlers ===========
    function showHomeView() {
        homeView.style.display = 'block';
        categoryView.style.display = 'none';
        searchResultsView.style.display = 'none';
        favoritesView.style.display = 'none';
        pageTitle.innerHTML = `<img src="./Assets/home-button.png" style="height: 18px; width: 20px;" alt="">`;
        backButton.style.display = 'none';
        currentView = 'home';
    }

    function showCategoryView(categoryName) {
        homeView.style.display = 'none';
        categoryView.style.display = 'block';
        searchResultsView.style.display = 'none';
        favoritesView.style.display = 'none';

        const catObj = categories.find(cat => cat.name === categoryName);
        pageTitle.innerHTML = `${catObj.icon} <span>${catObj.label}</span>`;
        backButton.style.display = 'inline-block';

        categoryItems.innerHTML = '';
        const items = allResources[categoryName] || [];
        items.forEach((item) => {
            // "isFavorite" = false here, because we show the star icon
            // "isCustom" = false as well (these are from categories)
            categoryItems.appendChild(createResourceItemElement(item, false, false));
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
            searchResultsList.appendChild(createResourceItemElement(item, false, false));
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

    // =========== Create Resource Item Element ===========
    // isFavorite => whether we are rendering an item in the favorites list (then we show the cross)
    // isCustom   => whether it's from "customFavorites" or from "predefined categories"
    function createResourceItemElement(item, isFavorite = false, isCustom = false) {
        const resourceItem = document.createElement('div');
        resourceItem.className = 'resource-item';

        // We'll use the domain's favicon
        const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${item.link}`;

        // If it's in favorites, show an 'X' to remove. Otherwise show a star icon.
        const iconHTML = isFavorite
            ? `<span class="remove-icon" data-is-custom="${isCustom}">×</span>`
            : `<span class="star-icon" data-resource-id="${item.name}">★</span>`;

        // Hide description if isFavorite
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

        // If user clicks anywhere (except the star/remove), open the link
        resourceItem.addEventListener('click', (e) => {
            const target = e.target;
            if (
                !target.classList.contains('star-icon') &&
                !target.classList.contains('remove-icon')
            ) {
                chrome.tabs.create({ url: item.link });
            }
        });

        // Handle icon click (star => add/remove favorite, cross => remove favorite)
        if (isFavorite) {
            // Removing from favorites
            const removeIcon = resourceItem.querySelector('.remove-icon');
            removeIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                removeIcon.classList.add('animate');
                setTimeout(() => removeIcon.classList.remove('animate'), 300);

                if (isCustom) {
                    removeCustomFavorite(item.name);
                } else {
                    toggleFavorite(item.name, true); // pass "forceRemove" = true
                }
            });
        } else {
            // Toggling star
            const starIcon = resourceItem.querySelector('.star-icon');
            starIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                starIcon.classList.add('animate');
                setTimeout(() => starIcon.classList.remove('animate'), 300);
                toggleFavorite(item.name);
            });

            // Check if the item is already a favorite, highlight star if so
            chrome.storage.sync.get(['favorites'], (result) => {
                const favorites = result.favorites || [];
                if (favorites.includes(item.name)) {
                    starIcon.classList.add('favorited');
                }
            });
        }

        return resourceItem;
    }

    // =========== Toggle Favorite (Predefined Category Items) ===========
    // If "forceRemove" is true, we remove the item from favorites.
    function toggleFavorite(resourceName, forceRemove = false) {
        chrome.storage.sync.get(['favorites'], (result) => {
            let favorites = result.favorites || [];
            const index = favorites.indexOf(resourceName);

            if (forceRemove) {
                // Force removal
                if (index !== -1) {
                    favorites.splice(index, 1);
                }
            } else {
                // Normal toggle
                if (index === -1) {
                    // Add to favorites
                    favorites.push(resourceName);
                } else {
                    // Remove from favorites
                    favorites.splice(index, 1);
                }
            }

            chrome.storage.sync.set({ favorites }, () => {
                updateFavoritesView();

                // Also update any star icons in the DOM
                const starIcon = document.querySelector(`.star-icon[data-resource-id="${resourceName}"]`);
                if (starIcon) {
                    starIcon.classList.toggle('favorited', index === -1 && !forceRemove);
                }
            });
        });
    }

    // =========== Remove from Custom Favorites (User-Added Websites) ===========
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

    // =========== Update Favorites View ===========
    function updateFavoritesView() {
        chrome.storage.sync.get(['favorites', 'customFavorites'], (result) => {
            const favorites = result.favorites || [];
            const customFavorites = result.customFavorites || [];

            favoriteCount.textContent = favorites.length + customFavorites.length;
            favoritesList.innerHTML = '';

            // 1) Show category-based favorites
            favorites.forEach(resourceName => {
                const item = findResourceByName(resourceName);
                if (item) {
                    favoritesList.appendChild(createResourceItemElement(item, true, false));
                }
            });

            // 2) Show user-added (custom) favorites
            customFavorites.forEach(domain => {
                // We'll treat domain as the 'name'. We'll pass link as https://domain
                const customItem = {
                    name: domain,
                    link: `https://${domain}`,
                    description: ''
                };
                favoritesList.appendChild(createResourceItemElement(customItem, true, true));
            });

            // If no favorites at all
            if (favorites.length === 0 && customFavorites.length === 0) {
                favoritesView.classList.add('empty');
            } else {
                favoritesView.classList.remove('empty');
            }
        });
    }

    // =========== Find Resource By Name ===========
    function findResourceByName(resourceName) {
        for (const category of Object.values(allResources)) {
            const item = category.find(res => res.name === resourceName);
            if (item) return item;
        }
        return null;
    }

    // =========== Event Listeners ===========
    myFav.addEventListener('click', () => {
        showFavoritesView();
    });

    backButton.addEventListener('click', () => {
        if (['category', 'search', 'favorites'].includes(currentView)) {
            searchBar.value = '';
            showHomeView();
        }
    });

    // Simple search logic
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

    // Start at home
    showHomeView();
});
