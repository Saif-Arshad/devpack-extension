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

    // Load resources from JSON files for each category
    async function loadResources() {
        for (const category of categories) {
            try {
                const response = await fetch(category.filePath);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                // Use the category name as the key
                // Also filter out any resource that does not have a valid name or link
                allResources[category.name] = data.filter(
                    resource => resource.name && resource.link
                );
            } catch (error) {
                console.error(`Error loading resources for ${category.name}:`, error);
                allResources[category.name] = [];
            }
        }
    }

    // Initialize: load resources and favorites/collections from storage
    async function initialize() {
        showLoading();
        await loadResources();
        chrome.storage.sync.get(['favorites'], (result) => {
            favorites = result.favorites || [];
            updateFavoriteCount();
            renderCategories();
        });
        chrome.storage.sync.get(['collections'], (result) => {
            collections = result.collections || {};
        });
        hideLoading();
    }

    // Helper function to close modals
    function closeModal(modal) {
        modal.classList.add('hidden');
    }

    // Smooth scroll to top when switching views
    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Close modals when clicking outside modal content
    window.addEventListener('click', (e) => {
        if (e.target === newCollectionModal) {
            closeModal(newCollectionModal);
        }
        if (e.target === addResourceModal) {
            closeModal(addResourceModal);
        }
    });

    // Update UI counters for favorites
    function updateFavoriteCount() {
        const count = favorites.length;
        favoritesCount.textContent = count;
        favCount.textContent = count;
        favoritesTotal.textContent = count;
        emptyFavorites.style.display = count > 0 ? 'none' : 'block';
    }

    // Render the categories list using the imported categories data
    function renderCategories() {
        categoriesList.innerHTML = '';
        categories.forEach(category => {
            // Get the resources for the category (loaded via fetch)
            const resources = allResources[category.name] || [];
            const li = document.createElement('li');
            li.className = 'category-item';
            li.innerHTML = `
        <div class="category-icon" style="background-color: ${category.background};">
          ${category.icon}
        </div>
        <div class="category-info">
          <div class="category-name">${category.label}</div>
          <div class="category-count">${resources.length} resources</div>
        </div>
      `;
            li.addEventListener('click', () => {
                showCategoryView(category.name);
            });
            categoriesList.appendChild(li);
        });
    }

    // Create a resource card element (skip if no name or link)
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
        <div class="resource-name">${resource.name}</div>
        <div class="resource-link">${resource.link}</div>
      </div>
      <div class="resource-actions">
        <button class="heart-icon ${isFavorite ? 'active' : ''}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
        </button>
        <button class="link-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
        </button>
      </div>
    `;

        // Open resource link on click (unless clicking an icon)
        div.addEventListener('click', (e) => {
            if (!e.target.closest('.heart-icon') && !e.target.closest('.link-icon') && !e.target.closest('.remove-icon')) {
                chrome.tabs.create({ url: resource.link });
            }
        });

        // Toggle favorite on heart icon click
        const heartIcon = div.querySelector('.heart-icon');
        heartIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(resource);
            heartIcon.classList.toggle('active');
            heartIcon.classList.add('animate');
            const svg = heartIcon.querySelector('svg');
            svg.setAttribute('fill', heartIcon.classList.contains('active') ? 'currentColor' : 'none');
            setTimeout(() => { heartIcon.classList.remove('animate'); }, 300);
        });

        // Open resource link in a new tab on link icon click
        const linkIcon = div.querySelector('.link-icon');
        linkIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            chrome.tabs.create({ url: resource.link });
        });

        return div;
    }

    // Create resource element with remove button for collections
    function createCollectionResourceElement(resource, collectionName) {
        const element = createResourceElement(resource, isResourceInFavorites(resource));
        if (!element) return null;
        const actionsDiv = element.querySelector('.resource-actions');
        const removeButton = document.createElement('button');
        removeButton.className = 'remove-icon';
        removeButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 6h18"/>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      </svg>
    `;
        removeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            removeFromCollection(resource, collectionName);
        });
        actionsDiv.appendChild(removeButton);
        return element;
    }

    // Toggle favorite for a resource
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

    // Check if a resource is in favorites
    function isResourceInFavorites(resource) {
        return favorites.some(fav => fav.link === resource.link);
    }

    // Add resource to a collection
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

    // Remove resource from a collection
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

    // Create a new collection
    function createCollection(name) {
        if (!collections[name]) {
            collections[name] = [];
            chrome.storage.sync.set({ collections }, () => {
                renderCollections();
            });
        }
    }

    // Delete a collection
    function deleteCollection(name) {
        if (collections[name]) {
            delete collections[name];
            chrome.storage.sync.set({ collections }, () => {
                renderCollections();
            });
        }
    }

    // View switching functions with smooth scroll to top
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

    // Rendering functions for views
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
        const bgColors = ["#5548EB", "#FF45A9", "#32CD6B", "#C22246", "#F97316", "#E79B1C", "#1F8B26", "#FF006E"];
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
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

    // Search functionality: only include resources that have a valid name and link
    function performSearch(query) {
        if (!query.trim()) {
            showHomeView();
            return;
        }
        const results = [];
        const lowerQuery = query.toLowerCase();
        Object.values(allResources).forEach(categoryResources => {
            categoryResources.forEach(resource => {
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
        if (currentView === 'collectionDetail') {
            showCollectionsView();
        } else {
            showHomeView();
        }
    });

    favoritesButton.addEventListener('click', showFavoritesView);
    collectionsButton.addEventListener('click', showCollectionsView);
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query) {
            performSearch(query);
        } else {
            showHomeView();
        }
    });

    // Collection Create Modal events
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

    // Add Resource Modal events
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

    // Initialize the extension and show home view
    await initialize();
    showHomeView();
});
