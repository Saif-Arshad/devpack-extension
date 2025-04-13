import { categories } from './categories.js';

document.addEventListener('DOMContentLoaded', async () => {
    // DOM Elements
    const backButton = document.getElementById('backButton');
    const viewTitle = document.getElementById('viewTitle');
    const searchInput = document.getElementById('searchInput');
    const favoritesButton = document.getElementById('favoritesButton');
    const favoritesCount = document.getElementById('favoritesCount');
    const favCount = document.getElementById('favCount');
    const favoritesTotal = document.getElementById('favoritesTotal');
    const collectionsButton = document.getElementById('collectionsButton');

    // Views
    const homeView = document.getElementById('homeView');
    const categoryView = document.getElementById('categoryView');
    const favoritesView = document.getElementById('favoritesView');
    const collectionsView = document.getElementById('collectionsView');
    const collectionDetailView = document.getElementById('collectionDetailView');
    const searchResultsView = document.getElementById('searchResultsView');

    // Lists
    const categoriesList = document.getElementById('categoriesList');
    const categoryResources = document.getElementById('categoryResources');
    const favoritesList = document.getElementById('favoritesList');
    const collectionsList = document.getElementById('collectionsList');
    const collectionResources = document.getElementById('collectionResources');
    const searchResultsList = document.getElementById('searchResultsList');

    // Empty states
    const emptyFavorites = document.getElementById('emptyFavorites');
    const emptyCollection = document.getElementById('emptyCollection');
    const emptySearchResults = document.getElementById('emptySearchResults');

    // Collection detail
    const collectionDetailTitle = document.getElementById('collectionDetailTitle');
    const addResourceBtn = document.getElementById('addResourceBtn');

    // Modals
    const newCollectionModal = document.getElementById('newCollectionModal');
    const createCollectionBtn = document.getElementById('createCollectionBtn');
    const createCollectionConfirm = document.getElementById('createCollectionConfirm');
    const createCollectionCancel = document.getElementById('createCollectionCancel');
    const newCollectionName = document.getElementById('newCollectionName');

    const addResourceModal = document.getElementById('addResourceModal');
    const currentCollectionName = document.getElementById('currentCollectionName');
    const newResourceName = document.getElementById('newResourceName');
    const newResourceLink = document.getElementById('newResourceLink');
    const addResourceConfirm = document.getElementById('addResourceConfirm');
    const addResourceCancel = document.getElementById('addResourceCancel');

    // Loading indicator
    const loadingIndicator = document.getElementById('loadingIndicator');

    const resourceTooltip = document.createElement('div');
    resourceTooltip.className = 'tooltip hidden';
    document.body.appendChild(resourceTooltip);



    // State variables
    let currentView = 'home';
    let currentCategory = '';
    let currentCollection = '';
    let allResources = {}; // Will hold resource arrays keyed by category name
    let favorites = [];
    let collections = {};

    // Show loading indicator
    function showLoading() {
        loadingIndicator.classList.remove('hidden');
    }

    // Hide loading indicator
    function hideLoading() {
        loadingIndicator.classList.add('hidden');
    }

    // Fetch resources for a single category if not already loaded
    async function fetchCategoryResources(category) {
        if (allResources[category.name]) {
            // Already fetched
            return;
        }
        try {
            showLoading();
            const response = await fetch(category.filePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            allResources[category.name] = data.filter(resource => resource.name && resource.link);
        } catch (error) {
            console.error(`Error loading resources for ${category.name}:`, error);
            allResources[category.name] = [];
        } finally {
            hideLoading();
        }
    }

    // Load all categories (for global search)
    async function fetchAllCategories() {
        for (const category of categories) {
            if (!allResources[category.name]) {
                await fetchCategoryResources(category);
            }
        }
    }

    // Initialize: load favorites/collections from storage, render categories
    async function initialize() {
        showLoading();
        // Load favorites
        chrome.storage.sync.get(['favorites'], (result) => {
            favorites = result.favorites || [];
            updateFavoriteCount();
        });
        // Load collections
        chrome.storage.sync.get(['collections'], (result) => {
            collections = result.collections || {};
        });
        // Render categories (just icons and labels, no fetching yet)
        renderCategories();
        hideLoading();
    }





    // Close a modal
    function closeModal(modal) {
        modal.classList.add('hidden');
    }

    // Smooth scroll to top when switching views
    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Helper function to show tooltip
    function showTooltip(element, text) {
        // Get the dimensions of the element
        const elementRect = element.getBoundingClientRect();

        // Reset any previous width setting
        resourceTooltip.style.width = 'auto';
        resourceTooltip.style.maxWidth = '220px';
        resourceTooltip.textContent = text;

        // Make the tooltip visible but with opacity 0 to measure its width
        resourceTooltip.classList.remove('hidden');
        resourceTooltip.style.opacity = '0';
        resourceTooltip.style.pointerEvents = 'none';

        // Get the tooltip dimensions
        const tooltipRect = resourceTooltip.getBoundingClientRect();

        // Calculate the centered position
        const left = elementRect.left + (elementRect.width / 2) - (tooltipRect.width / 2);

        // Get the scroll position
        const scrollTop = window.scrollY || document.documentElement.scrollTop;

        // Position the tooltip centered above the element with a 10px gap
        // Use fixed positioning to avoid scroll issues
        resourceTooltip.style.position = 'fixed';
        resourceTooltip.style.left = `${Math.max(10, left)}px`;
        resourceTooltip.style.top = `${elementRect.top - tooltipRect.height - 10}px`;

        // Make the tooltip fully visible
        resourceTooltip.style.opacity = '';
        resourceTooltip.classList.add('visible');
    }

    // Helper function to hide tooltip
    function hideTooltip() {
        resourceTooltip.classList.remove('visible');
        resourceTooltip.classList.add('hidden');
    }





    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === newCollectionModal) {
            closeModal(newCollectionModal);
        }
        if (e.target === addResourceModal) {
            closeModal(addResourceModal);
        }
    });

    // Update favorites count
    function updateFavoriteCount() {
        const count = favorites.length;
        favoritesCount.textContent = count;
        favCount.textContent = count;
        favoritesTotal.textContent = count;
        emptyFavorites.style.display = count > 0 ? 'none' : 'block';
    }

    // Render category icons/labels
    function renderCategories() {
        categoriesList.innerHTML = '';
        categories.forEach(category => {
            const li = document.createElement('li');
            li.className = 'category-item';

            // Create the category card structure
            const card = document.createElement('div');
            card.className = 'category-card';

            // Create the icon container
            const iconContainer = document.createElement('div');
            iconContainer.className = 'category-icon';

            // Create the icon element - either use SVG or load from file
            if (category.icon.includes('<svg')) {
                iconContainer.innerHTML = category.icon;
            } else {
                // For image icons, create an img element with proper sizing
                const img = document.createElement('img');
                img.src = category.icon.includes('src="')
                    ? category.icon.match(/src="([^"]+)"/)[1]
                    : category.icon;
                img.alt = category.label;
                img.style.width = '24px';
                img.style.height = '24px';
                iconContainer.appendChild(img);
            }

            // Create the title element
            const title = document.createElement('div');
            title.className = 'category-title';
            title.textContent = category.label;

            // Create the description element
            const description = document.createElement('p');
            description.className = 'category-description';
            description.textContent = category.description;
            description.style.fontSize = '12px';
            description.style.color = 'var(--text-light)';
            description.style.margin = '4px 0 0 0';

            // Assemble the card
            card.appendChild(iconContainer);
            card.appendChild(title);
            card.appendChild(description);
            li.appendChild(card);

            // Add click event
            li.addEventListener('click', async () => {
                await fetchCategoryResources(category);
                showCategoryView(category.name);
            });

            categoriesList.appendChild(li);
        });
    }

    function createResourceElement(resource, isFavorite = false) {
        if (!resource.name || !resource.link) return null;
        const div = document.createElement('div');
        div.className = 'resource-item';
        const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${resource.link}`;
        div.innerHTML = `
        <div class="resource-favicon">
            <img src="${faviconUrl}" alt="${resource.name}" onerror="this.src='assets/placeholder.svg'">
        </div>
        <div class="resource-info">
        <div class="resource-title">
            <div class="resource-name">${resource.name}</div>
            <div class="resource-actions">
                <button class="heart-icon ${isFavorite ? 'active' : ''}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                        viewBox="0 0 24 24" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                    </svg>
                </button>

            </div>
            </div>
            <div class="resource-link">${resource.link}</div>
        </div>
    `;

        // Open link when clicking outside icons
        div.addEventListener('click', (e) => {
            if (!e.target.closest('.heart-icon') && !e.target.closest('.link-icon') && !e.target.closest('.info-icon') && !e.target.closest('.remove-icon')) {
                chrome.tabs.create({ url: resource.link });
            }
        });

        // Heart icon => toggle favorite
        const heartIcon = div.querySelector('.heart-icon');

        // Add tooltip to the heart icon
        heartIcon.addEventListener('mouseenter', (e) => {
            e.stopPropagation(); // Prevent triggering the parent's mouseenter
            const tooltipText = heartIcon.classList.contains('active')
                ? "Remove from favorites"
                : "Add to favorites";
            showTooltip(heartIcon, tooltipText);
        });

        heartIcon.addEventListener('mouseleave', (e) => {
            e.stopPropagation(); // Prevent triggering the parent's mouseleave
            hideTooltip();
        });

        heartIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(resource);
            heartIcon.classList.toggle('active');
            heartIcon.classList.add('animate');
            const svg = heartIcon.querySelector('svg');
            svg.setAttribute('fill', heartIcon.classList.contains('active') ? 'currentColor' : 'none');
            setTimeout(() => { heartIcon.classList.remove('animate'); }, 300);
        });

        // Add tooltip functionality to the entire resource element
        if (resource.description) {
            div.addEventListener('mouseenter', (e) => {
                // Only show tooltip if not hovering over an icon
                if (!e.target.closest('.heart-icon') && !e.target.closest('.info-icon') && !e.target.closest('.remove-icon')) {
                    showTooltip(div, resource.description);
                }
            });

            div.addEventListener('mouseleave', (e) => {
                hideTooltip();
            });

            // Still add the info icon for visual indication
            const infoIcon = document.createElement('button');
            infoIcon.className = 'info-icon';
            infoIcon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                 viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
        `;
            // Append the info icon to the actions container
            const actionsContainer = div.querySelector('.resource-actions');
            actionsContainer.appendChild(infoIcon);

            // Add tooltip to the info icon
            infoIcon.addEventListener('mouseenter', (e) => {
                e.stopPropagation(); // Prevent triggering the parent's mouseenter
                showTooltip(infoIcon, "Hover over the resource to see details");
            });

            infoIcon.addEventListener('mouseleave', (e) => {
                e.stopPropagation(); // Prevent triggering the parent's mouseleave
                hideTooltip();
            });

            // Prevent the info icon from triggering the link
            infoIcon.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        return div;
    }

    // Resource element with remove button for collections
    function createCollectionResourceElement(resource, collectionName) {
        const element = createResourceElement(resource, isResourceInFavorites(resource));
        if (!element) return null;
        const actionsDiv = element.querySelector('.resource-actions');
        const removeButton = document.createElement('button');
        removeButton.className = 'remove-icon';
        removeButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
        `;
        // Add tooltip to the remove button
        removeButton.addEventListener('mouseenter', (e) => {
            e.stopPropagation(); // Prevent triggering the parent's mouseenter
            showTooltip(removeButton, "Remove from collection");
        });

        removeButton.addEventListener('mouseleave', (e) => {
            e.stopPropagation(); // Prevent triggering the parent's mouseleave
            hideTooltip();
        });

        removeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            removeFromCollection(resource, collectionName);
        });
        actionsDiv.appendChild(removeButton);
        return element;
    }

    // Toggle favorite
    function toggleFavorite(resource) {
        const index = favorites.findIndex(fav => fav.link === resource.link);
        if (index === -1) {
            favorites.push(resource);
        } else {
            favorites.splice(index, 1);
        }
        chrome.storage.sync.set({ favorites }, () => {
            updateFavoriteCount();
            if (currentView === 'favorites') renderFavorites();
        });
    }

    // Check if resource is favorite
    function isResourceInFavorites(resource) {
        return favorites.some(fav => fav.link === resource.link);
    }

    // Collections
    function addToCollection(resource, collectionName) {
        if (!collections[collectionName]) {
            collections[collectionName] = [];
        }
        if (!collections[collectionName].some(r => r.link === resource.link)) {
            collections[collectionName].push(resource);
            chrome.storage.sync.set({ collections }, () => {
                if (currentView === 'collectionDetail' && currentCollection === collectionName) {
                    renderCollectionDetail(collectionName);
                }
            });
        }
    }

    function removeFromCollection(resource, collectionName) {
        if (!collections[collectionName]) return;
        const index = collections[collectionName].findIndex(r => r.link === resource.link);
        if (index !== -1) {
            collections[collectionName].splice(index, 1);
            chrome.storage.sync.set({ collections }, () => {
                renderCollectionDetail(collectionName);
            });
        }
    }

    function createCollection(name) {
        if (!collections[name]) {
            collections[name] = [];
            chrome.storage.sync.set({ collections }, () => {
                renderCollections();
            });
        }
    }

    function deleteCollection(name) {
        if (collections[name]) {
            delete collections[name];
            chrome.storage.sync.set({ collections }, () => {
                renderCollections();
            });
        }
    }

    // View switching
    function showHomeView() {
        homeView.classList.remove('hidden');
        categoryView.classList.add('hidden');
        favoritesView.classList.add('hidden');
        collectionsView.classList.add('hidden');
        collectionDetailView.classList.add('hidden');
        searchResultsView.classList.add('hidden');
        viewTitle.textContent = 'Home';
        backButton.style.display = 'none';
        currentView = 'home';
        scrollToTop();
    }

    function showCategoryView(categoryName) {
        homeView.classList.add('hidden');
        categoryView.classList.remove('hidden');
        favoritesView.classList.add('hidden');
        collectionsView.classList.add('hidden');
        collectionDetailView.classList.add('hidden');
        searchResultsView.classList.add('hidden');
        const category = categories.find(cat => cat.name === categoryName);
        viewTitle.textContent = category ? category.label : 'Category';
        backButton.style.display = 'inline-block';
        currentView = 'category';
        currentCategory = categoryName;
        renderCategoryResources(categoryName);
        scrollToTop();
    }

    function showFavoritesView() {
        homeView.classList.add('hidden');
        categoryView.classList.add('hidden');
        favoritesView.classList.remove('hidden');
        collectionsView.classList.add('hidden');
        collectionDetailView.classList.add('hidden');
        searchResultsView.classList.add('hidden');
        viewTitle.textContent = 'My Favorites';
        backButton.style.display = 'inline-block';
        currentView = 'favorites';
        renderFavorites();
        scrollToTop();
    }

    function showCollectionsView() {
        homeView.classList.add('hidden');
        categoryView.classList.add('hidden');
        favoritesView.classList.add('hidden');
        collectionsView.classList.remove('hidden');
        collectionDetailView.classList.add('hidden');
        searchResultsView.classList.add('hidden');
        viewTitle.textContent = 'My Collections';
        backButton.style.display = 'inline-block';
        currentView = 'collections';
        renderCollections();
        scrollToTop();
    }

    function showCollectionDetailView(collectionName) {
        homeView.classList.add('hidden');
        categoryView.classList.add('hidden');
        favoritesView.classList.add('hidden');
        collectionsView.classList.add('hidden');
        collectionDetailView.classList.remove('hidden');
        searchResultsView.classList.add('hidden');
        viewTitle.textContent = 'Collection';
        backButton.style.display = 'inline-block';
        currentView = 'collectionDetail';
        currentCollection = collectionName;
        renderCollectionDetail(collectionName);
        scrollToTop();
    }

    function showSearchResultsView(query, results) {
        homeView.classList.add('hidden');
        categoryView.classList.add('hidden');
        favoritesView.classList.add('hidden');
        collectionsView.classList.add('hidden');
        collectionDetailView.classList.add('hidden');
        searchResultsView.classList.remove('hidden');
        viewTitle.textContent = `Search: "${query}"`;
        document.getElementById('searchResultsTitle').textContent = `Results for "${query}"`;
        backButton.style.display = 'inline-block';
        currentView = 'search';
        renderSearchResults(results);
        scrollToTop();
    }

    // Rendering
    function renderCategoryResources(categoryName) {
        categoryResources.innerHTML = '';
        const resources = allResources[categoryName] || [];
        resources.forEach(resource => {
            const isFavorite = isResourceInFavorites(resource);
            const element = createResourceElement(resource, isFavorite);
            if (element) categoryResources.appendChild(element);
        });
    }

    function renderFavorites() {
        favoritesList.innerHTML = '';
        favorites.forEach(resource => {
            const element = createResourceElement(resource, true);
            if (element) favoritesList.appendChild(element);
        });
        emptyFavorites.style.display = favorites.length > 0 ? 'none' : 'block';
    }

    function renderCollections() {
        collectionsList.innerHTML = '';
        const collectionNames = Object.keys(collections);
        if (collectionNames.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.className = 'empty-message';
            emptyMsg.textContent = 'No collections yet. Create one to get started.';
            collectionsList.appendChild(emptyMsg);
            return;
        }
        const bgColors = ["#4361ee", "#f72585", "#4cc9f0", "#3f37c9", "#4895ef", "#560bad", "#7209b7", "#b5179e"];
        collectionNames.forEach((name, index) => {
            const resources = collections[name] || [];
            const bgColor = bgColors[index % bgColors.length];
            const li = document.createElement('li');
            li.className = 'collection-item';
            li.innerHTML = `
                <div class="collection-icon" style="background-color: ${bgColor};">
                    ${name.charAt(0).toUpperCase()}
                </div>
                <div class="collection-info">
                    <div class="collection-name">${name}</div>
                    <div class="collection-count">${resources.length} resources</div>
                </div>
                <div class="collection-actions">
                    <button class="remove-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            `;
            li.addEventListener('click', (e) => {
                if (!e.target.closest('.remove-icon')) {
                    showCollectionDetailView(name);
                }
            });
            const deleteBtn = li.querySelector('.remove-icon');

            // Add tooltip to the collection delete button
            deleteBtn.addEventListener('mouseenter', (e) => {
                e.stopPropagation(); // Prevent triggering the parent's mouseenter
                showTooltip(deleteBtn, "Delete collection");
            });

            deleteBtn.addEventListener('mouseleave', (e) => {
                e.stopPropagation(); // Prevent triggering the parent's mouseleave
                hideTooltip();
            });

            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Delete collection "${name}"?`)) {
                    deleteCollection(name);
                }
            });
            collectionsList.appendChild(li);
        });
    }

    function renderCollectionDetail(collectionName) {
        collectionDetailTitle.textContent = collectionName;
        collectionResources.innerHTML = '';
        const resources = collections[collectionName] || [];
        emptyCollection.style.display = resources.length > 0 ? 'none' : 'block';
        resources.forEach(resource => {
            const element = createCollectionResourceElement(resource, collectionName);
            if (element) collectionResources.appendChild(element);
        });
    }

    function renderSearchResults(results) {
        searchResultsList.innerHTML = '';
        emptySearchResults.style.display = results.length > 0 ? 'none' : 'block';
        results.forEach(resource => {
            const isFavorite = isResourceInFavorites(resource);
            const element = createResourceElement(resource, isFavorite);
            if (element) searchResultsList.appendChild(element);
        });
    }

    // **Updated** performSearch: fetch all categories, then search
    async function performSearch(query) {
        if (!query.trim()) {
            showHomeView();
            return;
        }

        // 1. Fetch any categories not already fetched
        await fetchAllCategories();

        // 2. Now search in allResources
        const results = [];
        const lowerQuery = query.toLowerCase();
        Object.values(allResources).forEach(catResources => {
            catResources.forEach(resource => {
                if (resource.name && resource.link) {
                    if (
                        resource.name.toLowerCase().includes(lowerQuery) ||
                        resource.link.toLowerCase().includes(lowerQuery) ||
                        (resource.description && resource.description.toLowerCase().includes(lowerQuery))
                    ) {
                        results.push(resource);
                    }
                }
            });
        });

        // 3. Show results
        showSearchResultsView(query, results);
    }

    // Event Listeners

    backButton.addEventListener('click', () => {
        if (!newCollectionModal.classList.contains('hidden')) {
            closeModal(newCollectionModal);
            return;
        }
        if (!addResourceModal.classList.contains('hidden')) {
            closeModal(addResourceModal);
            return;
        }
        // Navigate back
        if (currentView === 'collectionDetail') {
            showCollectionsView();
        } else {
            showHomeView();
        }
    });

    favoritesButton.addEventListener('click', showFavoritesView);
    collectionsButton.addEventListener('click', showCollectionsView);

    // **Make this listener async** to await performSearch
    searchInput.addEventListener('input', async (e) => {
        const query = e.target.value.trim();
        if (query) {
            await performSearch(query);
        } else {
            showHomeView();
        }
    });

    // Collection Create Modal
    createCollectionBtn.addEventListener('click', () => {
        newCollectionName.value = '';
        newCollectionModal.classList.remove('hidden');
    });

    createCollectionConfirm.addEventListener('click', () => {
        const name = newCollectionName.value.trim();
        if (name) {
            createCollection(name);
            closeModal(newCollectionModal);
        }
    });

    createCollectionCancel.addEventListener('click', () => {
        closeModal(newCollectionModal);
    });

    // Add Resource Modal
    addResourceBtn.addEventListener('click', () => {
        currentCollectionName.textContent = currentCollection;
        newResourceName.value = '';
        newResourceLink.value = 'https://';
        addResourceModal.classList.remove('hidden');
    });

    addResourceConfirm.addEventListener('click', () => {
        const name = newResourceName.value.trim();
        const link = newResourceLink.value.trim();
        if (name && link) {
            const resource = { name, link, description: '' };
            addToCollection(resource, currentCollection);
            closeModal(addResourceModal);
        }
    });

    addResourceCancel.addEventListener('click', () => {
        closeModal(addResourceModal);
    });

    // Init + show home
    await initialize();
    showHomeView();
});
