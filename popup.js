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

    // Collections
    const myCollectionsBtn = document.getElementById('my_collections');
    const collectionsView = document.getElementById('collectionsView');
    const collectionsList = document.getElementById('collectionsList');
    const createCollectionBtn = document.getElementById('createCollectionBtn');

    // Collection Detail
    const collectionDetailView = document.getElementById('collectionDetailView');
    const collectionDetailTitle = document.getElementById('collectionDetailTitle');
    const collectionResourcesList = document.getElementById('collectionResourcesList');
    const closeCollectionDetailViewBtn = document.getElementById('closeCollectionDetailViewBtn');

    // Add Resource Modal
    const addResourceModal = document.getElementById('addResourceModal');
    const addResourceCollectionNameSpan = document.getElementById('addResourceCollectionName');
    const newResourceNameInput = document.getElementById('newResourceNameInput');
    const newResourceLinkInput = document.getElementById('newResourceLinkInput');
    const saveNewResourceBtn = document.getElementById('saveNewResourceBtn');
    const closeAddResourceModalBtn = document.getElementById('closeAddResourceModalBtn');

    const categories = [
        {
            name: 'Animation Libraries',
            label: 'Animated Components',
            filePath: 'Resources/animation-libraries.json',
            background: "#1ABC9C",
            icon: `<img src="./Assets/animation.svg" alt="icons" />`,
        },
        {
            name: 'free web templates',
            label: 'Free Web Templates',
            filePath: 'Resources/web-templates.json',
            background: "#E74C3C",
            icon: `<img src="./Assets/web.svg" alt="icons" />`,
        },
        {
            name: 'icons',
            label: 'Icons',
            filePath: 'Resources/icons.json',
            background: "#4A90E2",
            icon: `<img src="./Assets/icons.svg" alt="icons" />`,
        },
        {
            name: '3d',
            label: '3D',
            filePath: 'Resources/3d.json',
            background: "#9B59B6",
            icon: `<img src="./Assets/3d.svg" alt="3D" />`,
        },
        {
            name: 'background',
            label: 'Background',
            filePath: 'Resources/background.json',
            background: "#3498DB",
            icon: `<img src="./Assets/backgrounds.svg" alt="background" />`,
        },
        {
            name: 'blog',
            label: 'Blog',
            filePath: 'Resources/blog.json',
            background: "#2ECC71",
            icon: `<img src="./Assets/blogs.svg" alt="blog" />`,
        },
        {
            name: 'colors',
            label: 'Colors',
            filePath: 'Resources/colors.json',
            background: "#E74C3C",
            icon: `<img src="./Assets/colors.svg" alt="colors" />`,
        },
        {
            name: 'components',
            label: 'Components Libraries',
            filePath: 'Resources/components.json',
            background: "#F1C40F",
            icon: `<img src="./Assets/components.svg" alt="components" />`,
        },
        {
            name: 'illustrations',
            label: 'Illustrations',
            filePath: 'Resources/illustrations.json',
            background: "#1ABC9C",
            icon: `<img src="./Assets/illustrations.svg" alt="illustrations" />`,
        },
        {
            name: 'libraries',
            label: 'Libraries',
            filePath: 'Resources/libraries.json',
            background: "#D35400",
            icon: `<img src="./Assets/libraries.svg" alt="libraries" />`,
        },
        {
            name: 'photos',
            label: 'Photos',
            filePath: 'Resources/photos.json',
            background: "#8E44AD",
            icon: `<img src="./Assets/photos.svg" alt="photos" />`,
        },
        {
            name: 'tools',
            label: 'Tools',
            filePath: 'Resources/tools.json',
            background: "#C0392B",
            icon: `<img src="./Assets/tools.svg" alt="tools" />`,
        },
        {
            name: 'font',
            label: 'Fonts',
            filePath: 'Resources/fonts.json',
            background: "#27AE60",
            icon: `<img src="./Assets/typography.svg" alt="fonts" />`,
        },
        {
            name: 'video',
            label: 'Video',
            filePath: 'Resources/video.json',
            background: "#2980B9",
            icon: `<img src="./Assets/videos.svg" alt="video" />`,
        },
        {
            name: 'low-code/no-code',
            label: 'low-code/no-code tools',
            filePath: 'Resources/low-code.json',
            background: "#E67E22",
            icon: `<img src="./Assets/code.svg" alt="icons" />`,
        },
        {
            name: 'design inspiration',
            label: 'Design Inspirations',
            filePath: 'Resources/design.json',
            background: "#16A085",
            icon: `<img src="./Assets/design.svg" alt="icons" />`,
        },
        {
            name: 'deployments',
            label: 'Deployments',
            filePath: 'Resources/deployment.json',
            background: "#C0392B",
            icon: `<img src="./Assets/web.svg" alt="icons" />`,

        },
        {
            name: 'database',
            label: 'Database',
            filePath: 'Resources/database.json',
            background: "#8E44AD",
            icon: `<img src="./Assets/database.svg" alt="icons" />`,

        },
        {
            name: 'ai',
            label: 'AI Builders',
            filePath: 'Resources/ai.json',
            background: "#D35400",
            icon: `<img src="./Assets/ai.svg" alt="icons" />`,

        },
        {
            name: 'tailwind',
            label: 'Tailwind Components',
            filePath: 'Resources/tailwind.json',
            background: "#27AE60",
            icon: `<img src="./Assets/tailwind.svg" alt="icons" />`,

        },
        {
            name: 'shadcn',
            label: 'ShadCN Components',
            filePath: 'Resources/shadcn.json',
            background: "#2980B9",
            icon: `<img src="./Assets/code.svg" alt="icons" />`,


        },
        {
            name: 'freelance',
            label: 'Freelance Platforms',
            filePath: 'Resources/freelance.json',
            background: "#1ABC9C",
            icon: `<img src="./Assets/coin.svg" alt="icons" />`,


        },
        {
            name: 'learning',
            label: 'Learning Platform',
            filePath: 'Resources/learning-resources.json',
            background: "#E74C3C",
            icon: `<img src="./Assets/book.svg" alt="icons" />`,


        },
        {
            name: 'web',
            label: 'Web Builder Platform',
            filePath: 'Resources/builder.json',
            background: "#27AE60",
            icon: `<img src="./Assets/ai.svg" alt="icons" />`,



        },

    ];



    let allResources = {};
    let totalResources = 0;
    let currentView = 'home';

    let collections = {};

    Promise.all(
        categories.map(cat =>
            fetch(chrome.runtime.getURL(cat.filePath)).then(r => r.json())
        )
    )
        .then(dataArray => {
            dataArray.forEach((jsonData, i) => {
                console.log(Array.isArray(jsonData), jsonData);
                const catName = categories[i].name;
                const sortedData = jsonData.sort((a, b) => {
                    const aName = a.name || "";
                    const bName = b.name || "";
                    return aName.localeCompare(bName);
                });

                allResources[catName] = sortedData;
                totalResources += sortedData.length;
            });

            // Load existing collections
            chrome.storage.sync.get(['collections'], (res) => {
                collections = res.collections || {};
                renderCategoryList();
                updateFavoritesView();
                showHomeView();
            });
        })
        .catch(error => console.error('Error fetching JSON files:', error));

    // =================== VIEW FUNCTIONS ===================
    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function showHomeView() {
        homeView.style.display = 'block';
        categoryView.style.display = 'none';
        searchResultsView.style.display = 'none';
        favoritesView.style.display = 'none';
        collectionsView.style.display = 'none';
        collectionDetailView.style.display = 'none';

        pageTitle.innerHTML = `
      <div style="display:flex; align-items:center; width:100%; justify-content:end">
        <span style="margin-left: 8px;">Total resources: ${totalResources}</span>
      </div>
    `;
        backButton.style.display = 'none';
        currentView = 'home';
        scrollToTop();
    }

    function showCategoryView(categoryName) {
        homeView.style.display = 'none';
        categoryView.style.display = 'block';
        searchResultsView.style.display = 'none';
        favoritesView.style.display = 'none';
        collectionsView.style.display = 'none';
        collectionDetailView.style.display = 'none';

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
        items.forEach(item => {
            categoryItems.appendChild(createResourceItemElement(item, false, false));
        });

        currentView = 'category';
        scrollToTop();
    }

    function showSearchResultsView(query, matchedItems) {
        homeView.style.display = 'none';
        categoryView.style.display = 'none';
        searchResultsView.style.display = 'block';
        favoritesView.style.display = 'none';
        collectionsView.style.display = 'none';
        collectionDetailView.style.display = 'none';

        pageTitle.textContent = `Search: "${query}"`;
        backButton.style.display = 'inline-block';

        searchResultsList.innerHTML = '';
        matchedItems.forEach(item => {
            searchResultsList.appendChild(createResourceItemElement(item, false, false));
        });

        currentView = 'search';
        scrollToTop();
    }

    function showFavoritesView() {
        homeView.style.display = 'none';
        categoryView.style.display = 'none';
        searchResultsView.style.display = 'none';
        favoritesView.style.display = 'block';
        collectionsView.style.display = 'none';
        collectionDetailView.style.display = 'none';

        pageTitle.textContent = 'My Favorites';
        backButton.style.display = 'inline-block';

        updateFavoritesView();
        currentView = 'favorites';
        scrollToTop();
    }

    function showCollectionsView() {
        homeView.style.display = 'none';
        categoryView.style.display = 'none';
        searchResultsView.style.display = 'none';
        favoritesView.style.display = 'none';
        collectionDetailView.style.display = 'none';

        collectionsView.style.display = 'block';
        pageTitle.textContent = 'My Collections';
        backButton.style.display = 'inline-block';
        currentView = 'collections';

        renderCollectionsList();
        scrollToTop();
    }

    // ================= CATEGORY LIST =================
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

    function createResourceItemElement(item, isFavorite = false) {
        const resourceItem = document.createElement('div');
        resourceItem.className = 'resource-item';

        const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${item.link}`;


        const starIconClass = isFavorite ? 'star-icon favorited' : 'star-icon';
        resourceItem.innerHTML = `
  <img class="resource-favicon" src="${faviconUrl}" alt="favicon" />
  <div class="resource-info">
    <div class="resource-name">${item.name}</div>
    <span class="resource-link">
      ${item.link}
    </span>
  </div>
  <div class="resource-actions">
    <span class="${starIconClass}" data-resource-id="${item.link}">❤</span>
 
  </div>
`;


        // Clicking anywhere except the star => open link
        resourceItem.addEventListener('click', (e) => {
            if (!e.target.classList.contains('star-icon')) {
                chrome.tabs.create({ url: item.link });
            }
        });

        // Click star to add/remove favorites
        const starIcon = resourceItem.querySelector('.star-icon');
        starIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            // If it's already favorited, remove it
            // Otherwise, add it
            if (starIcon.classList.contains('favorited')) {
                toggleFavorite(item, true);
            } else {
                toggleFavorite(item);
            }
        });

        return resourceItem;
    }



    function toggleFavorite(resource, forceRemove = false) {
        chrome.storage.sync.get(['favorites'], (result) => {
            let favorites = result.favorites || [];
            const index = favorites.findIndex(fav => fav.link === resource.link);

            // If forceRemove or item is found in favorites => remove it
            if (forceRemove) {
                if (index !== -1) favorites.splice(index, 1);
            } else {
                if (index === -1) {
                    favorites.push(resource);
                } else {
                    favorites.splice(index, 1);
                }
            }

            chrome.storage.sync.set({ favorites }, () => {
                // Re-render favorites
                updateFavoritesView();

                // Find the star icon for this resource
                const starIcon = document.querySelector(`.star-icon[data-resource-id="${resource.link}"]`);
                if (starIcon) {
                    // If it’s now favorited => add .favorited
                    const isFavoritedNow = (index === -1 && !forceRemove);
                    starIcon.classList.toggle('favorited', isFavoritedNow);

                    // Animate the star icon
                    starIcon.classList.add('animate');
                    setTimeout(() => starIcon.classList.remove('animate'), 300);
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
        chrome.storage.sync.get(['favorites'], (result) => {
            const favorites = result.favorites || [];
            favoriteCount.textContent = favorites.length;
            favoritesList.innerHTML = '';

            // Check if there are no favorites
            if (favorites.length === 0) {
                favoritesView.classList.add('empty');
                return;
            } else {
                favoritesView.classList.remove('empty');
            }

            // Loop through favorite objects and create elements
            favorites.forEach(item => {
                const resourceItem = createResourceItemElement(item, true, false);
                favoritesList.appendChild(resourceItem);
            });
        });
    }


    function findResourceByName(resourceName) {
        // Search all predefined categories
        for (const catData of Object.values(allResources)) {
            const item = catData.find(res => res.name === resourceName);
            if (item) return item;
        }
        return null;
    }

    // ================== COLLECTIONS ==================
    function renderCollectionsList() {
        collectionsList.innerHTML = '';

        const collNames = Object.keys(collections);
        if (!collNames.length) {
            collectionsList.innerHTML = `<p style="opacity:0.7; margin-left:4px;">No collections yet.</p>`;
            return;
        }

        // Some random background colors
        const bgColors = ["#5548EB", "#FF45A9", "#32CD6B", "#C22246", "#F97316", "#E79B1C", "#1F8B26", "#FF006E"];
        let colorIndex = 0;

        collNames.forEach(name => {
            const resourcesCount = collections[name].length;
            const li = document.createElement('li');
            li.classList.add('categoryItem'); // reuse style
            li.style.color = '#ffffff';

            const firstLetter = name.charAt(0).toUpperCase();
            const bgColor = bgColors[colorIndex % bgColors.length];
            colorIndex++;

            li.innerHTML = `
        <div class="category-icon" style="background-color:${bgColor};">
          ${firstLetter}
        </div>
        <span class="category-label">${name}</span>
        <span class="resource-count">${resourcesCount} resources</span>
        <span style="margin-left:auto; display:flex; align-items:center; gap:6px;">
          <span class="add-resource-icon" style="cursor:pointer; font-weight:bold;">➕</span>
          <span class="delete-collection" style="cursor:pointer; color:#ff5e5e; font-weight:bold;">×</span>
        </span>
      `;

            // Make entire li a drop target
            li.addEventListener('dragover', (e) => {
                e.preventDefault();
                li.classList.add('drag-over');
            });
            li.addEventListener('dragleave', () => {
                li.classList.remove('drag-over');
            });
            li.addEventListener('drop', (e) => {
                e.preventDefault();
                li.classList.remove('drag-over');
                try {
                    const resourceData = JSON.parse(e.dataTransfer.getData('application/json'));
                    addResourceToCollection(name, resourceData);
                } catch (err) {
                    console.error('Invalid drag data', err);
                }
            });

            // Clicking li => open detail (unless user clicked add/delete icons)
            li.addEventListener('click', (evt) => {
                if (
                    evt.target.classList.contains('add-resource-icon') ||
                    evt.target.classList.contains('delete-collection')
                ) {
                    return;
                }
                openCollectionDetailView(name);
            });

            // plus => add resource
            const plusIcon = li.querySelector('.add-resource-icon');
            plusIcon.addEventListener('click', (evt) => {
                evt.stopPropagation();
                openAddResourceModal(name);
            });

            // cross => delete entire collection
            const crossIcon = li.querySelector('.delete-collection');
            crossIcon.addEventListener('click', (evt) => {
                evt.stopPropagation();
                if (!confirm(`Delete entire collection "${name}"?`)) return;
                delete collections[name];
                saveCollections();
            });

            collectionsList.appendChild(li);
        });
    }

    function openAddResourceModal(collectionName) {
        addResourceCollectionNameSpan.textContent = collectionName;
        newResourceNameInput.value = '';
        newResourceLinkInput.value = '';
        addResourceModal.style.display = 'block';
    }

    saveNewResourceBtn.addEventListener('click', () => {
        const collName = addResourceCollectionNameSpan.textContent;
        const rName = newResourceNameInput.value.trim();
        const rLink = newResourceLinkInput.value.trim() || "https://";
        if (!rName || !collName) return;

        const resourceObj = {
            name: rName,
            link: rLink,
            description: ''
        };
        addResourceToCollection(collName, resourceObj);

        addResourceModal.style.display = 'none';
    });

    closeAddResourceModalBtn.addEventListener('click', () => {
        addResourceModal.style.display = 'none';
    });

    function createNewCollection(name) {
        if (!collections[name]) {
            collections[name] = [];
            saveCollections();
        }
    }

    function saveCollections() {
        chrome.storage.sync.set({ collections }, () => {
            renderCollectionsList();
            // If a detail view is open, re-render it
            if (collectionDetailView.style.display === 'block') {
                const openName = collectionDetailTitle.getAttribute('data-collection-name');
                if (openName) {
                    renderCollectionDetail(openName);
                }
            }
        });
    }

    function addResourceToCollection(collName, resourceObj) {
        if (!collections[collName]) return;
        // avoid duplicates by name
        const exists = collections[collName].some(r => r.name === resourceObj.name);
        if (!exists) {
            collections[collName].push(resourceObj);
            saveCollections();
        }
    }

    // =========== COLLECTION DETAIL VIEW ===========
    function openCollectionDetailView(name) {
        homeView.style.display = 'none';
        categoryView.style.display = 'none';
        searchResultsView.style.display = 'none';
        favoritesView.style.display = 'none';
        collectionsView.style.display = 'none';

        collectionDetailView.style.display = 'block';

        pageTitle.textContent = `Collection: ${name}`;
        backButton.style.display = 'inline-block';
        currentView = 'collectionDetail';

        collectionDetailTitle.textContent = name;
        collectionDetailTitle.setAttribute('data-collection-name', name);

        renderCollectionDetail(name);
        scrollToTop();
    }

    function renderCollectionDetail(name) {
        collectionResourcesList.innerHTML = '';
        const items = collections[name] || [];

        if (!items.length) {
            collectionResourcesList.innerHTML = `
        <li style="opacity:0.7; margin:6px 0;">No resources in this collection.</li>
      `;
            return;
        }

        items.forEach((item, idx) => {
            const li = document.createElement('li');
            li.style.marginBottom = '6px';
            li.style.listStyle = 'none';
            li.style.cursor = 'pointer';

            const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${item.link}`;
            li.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px;">
          <img src="${faviconUrl}" alt="favicon" style="width:16px; height:16px;" />
          <span style="flex:1;">${item.name}</span>
          <span class="remove-icon" style="color:#ff5e5e; cursor:pointer; font-weight:bold;">×</span>
        </div>
      `;

            // clicking => open the link
            li.addEventListener('click', (e) => {
                if (!e.target.classList.contains('remove-icon')) {
                    chrome.tabs.create({ url: item.link });
                }
            });

            // remove item from collection
            const removeIcon = li.querySelector('.remove-icon');
            removeIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                collections[name].splice(idx, 1);
                saveCollections(); // re-renders
            });

            collectionResourcesList.appendChild(li);
        });
    }

    closeCollectionDetailViewBtn.addEventListener('click', () => {
        showCollectionsView();
    });

    // =========== EVENT LISTENERS ===========
    myFav.addEventListener('click', showFavoritesView);

    // *** THIS LINE FIXES THE "My Collections" BUTTON CLICK ***
    myCollectionsBtn.addEventListener('click', showCollectionsView);

    backButton.addEventListener('click', () => {
        if (['category', 'search', 'favorites', 'collections', 'collectionDetail'].includes(currentView)) {
            showHomeView();
        }
    });

    createCollectionBtn.addEventListener('click', () => {
        const newName = prompt("Enter collection name:");
        if (!newName) return;
        createNewCollection(newName.trim());
    });

    // =========== UNIFIED SEARCH LOGIC ===========
    searchBar.addEventListener('input', async () => {
        const query = searchBar.value.trim().toLowerCase();
        if (!query) {
            showHomeView();
            return;
        }

        // We'll gather items from:
        // 1) allResources
        // 2) favorites + customFavorites
        // 3) all collections
        // then filter them by `query`.

        const finalList = [];
        const seen = new Set();

        // 1) All Predefined
        for (const catData of Object.values(allResources)) {
            catData.forEach(item => {
                if (!seen.has(item.name)) {
                    seen.add(item.name);
                    finalList.push(item);
                }
            });
        }

        // 2) Favorites & custom
        let { favorites = [], customFavorites = [] } = await getStorage(['favorites', 'customFavorites']);
        // Normal favorites => find in allResources
        favorites.forEach(favName => {
            if (!seen.has(favName)) {
                const found = findResourceByName(favName);
                if (found) {
                    seen.add(favName);
                    finalList.push(found);
                }
            }
        });
        // custom domain => build item obj
        customFavorites.forEach(domain => {
            if (!seen.has(domain)) {
                seen.add(domain);
                finalList.push({
                    name: domain,
                    link: `https://${domain}`,
                    description: ''
                });
            }
        });

        // 3) Collections
        Object.keys(collections).forEach(collName => {
            const resources = collections[collName];
            resources.forEach(r => {
                if (!seen.has(r.name)) {
                    seen.add(r.name);
                    finalList.push(r);
                }
            });
        });

        // filter finalList by query
        const matched = finalList.filter(item => {
            // search in name + description + tags
            const text = (
                item.name + ' ' +
                (item.description || '') + ' ' +
                (item.tags || []).join(' ')
            ).toLowerCase();
            return text.includes(query);
        });

        showSearchResultsView(query, matched);
    });

    // helper for storage
    function getStorage(keys) {
        return new Promise(resolve => {
            chrome.storage.sync.get(keys, res => resolve(res));
        });
    }
});
