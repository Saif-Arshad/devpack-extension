// Set up the side panel behavior
chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error("Error setting side panel behavior:", error));

// On installation, set up context menus
chrome.runtime.onInstalled.addListener(() => {
    console.log("DevPack extension installed and side panel behavior set.");
    buildCollectionSubmenus();
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    const urlToAdd = info.linkUrl || info.pageUrl;
    if (!urlToAdd) {
        console.warn("No URL found. Operation aborted.");
        return;
    }

    // Add to Favorites
    if (info.menuItemId === "devpackAddFavorite") {
        chrome.storage.sync.get(['favorites'], (res) => {
            let favorites = res.favorites || {};
            if (!favorites[urlToAdd]) {
                const newFav = {
                    name: extractResourceName(urlToAdd),
                    link: urlToAdd
                };
                favorites[urlToAdd] = newFav;
                chrome.storage.sync.set({ favorites }, () => {
                    console.log(`Added to DevPack Favorites: ${urlToAdd}`);
                });
            }
        });
    }

    // Add to Collection
    else if (info.menuItemId.startsWith("collection_")) {
        const collectionName = info.menuItemId.replace("collection_", "");
        const resourceObj = {
            name: extractResourceName(urlToAdd),
            link: urlToAdd,
            description: ''
        };

        chrome.storage.sync.get(['collections'], (res) => {
            let collections = res.collections || {};
            if (!collections[collectionName]) collections[collectionName] = {};
            if (!collections[collectionName][urlToAdd]) {
                collections[collectionName][urlToAdd] = resourceObj;
                chrome.storage.sync.set({ collections }, () => {
                    console.log(`Added to collection "${collectionName}": ${urlToAdd}`);
                });
            }
        });
    }
});

// Rebuild submenus on storage changes
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync' && changes.collections) {
        buildCollectionSubmenus();
    }
});

// Build collection submenus
function buildCollectionSubmenus() {
    chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
            id: "devpackAddFavorite",
            title: "Add to DevPack Favorites",
            contexts: ["page", "link"]
        });

        chrome.contextMenus.create({
            id: "devpackAddToCollection",
            title: "Add to DevPack Collection",
            contexts: ["page", "link"]
        });

        chrome.storage.sync.get(['collections'], (res) => {
            const collections = res.collections || {};
            Object.keys(collections).forEach(collName => {
                chrome.contextMenus.create({
                    id: `collection_${collName}`,
                    parentId: "devpackAddToCollection",
                    title: collName,
                    contexts: ["page", "link"]
                });
            });
        });
    });
}

// Extract a friendly name from a URL
function extractResourceName(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace(/^www\./, '');
    } catch (e) {
        console.error("Invalid URL:", url);
        return url;
    }
}