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
                    chrome.notifications.create({
                        type: 'basic',
                        iconUrl: 'Assets/logo.png',
                        title: 'Added to Favorites',
                        message: `Added to DevPack Favorites:\n${urlToAdd}`,
                        priority: 1
                    });
                });
            } else {
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'Assets/logo.png',
                    title: 'Already a Favorite',
                    message: `This URL is already in your favorites:\n${urlToAdd}`,
                    priority: 1
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
                    chrome.notifications.create({
                        type: 'basic',
                        iconUrl: 'Assets/logo.png',
                        title: 'Added to Collection',
                        message: `Added to "${collectionName}":\n${urlToAdd}`,
                        priority: 1
                    });
                });
            } else {
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'Assets/logo.png',
                    title: 'Already in Collection',
                    message: `This URL is already in "${collectionName}":\n${urlToAdd}`,
                    priority: 1
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

// Handle bookmark additions
chrome.bookmarks.onCreated.addListener((id, bookmark) => {
    if (!bookmark.url) return;
    const exactLink = bookmark.url;

    chrome.storage.sync.get(['favorites'], (res) => {
        let favorites = res.favorites || {};
        if (!favorites[exactLink]) {
            chrome.storage.local.set({ lastBookmarkedLink: exactLink }, () => {
                chrome.notifications.create('devpack-bookmark-notification', {
                    type: 'basic',
                    iconUrl: 'Assets/logo.png',
                    title: 'Add to DevPack Favorites?',
                    message: `You just bookmarked:\n${exactLink}\nWould you like to add it to DevPack Favorites?`,
                    priority: 2,
                    buttons: [{ title: 'Yes' }, { title: 'No' }]
                });
            });
        }
    });
});

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener((notifId, btnIdx) => {
    if (notifId === 'devpack-bookmark-notification') {
        if (btnIdx === 0) { // Yes
            chrome.storage.local.get(['lastBookmarkedLink'], (resLocal) => {
                const exactLink = resLocal.lastBookmarkedLink;
                if (!exactLink) return;

                chrome.storage.sync.get(['favorites'], (resSync) => {
                    let favorites = resSync.favorites || {};
                    if (!favorites[exactLink]) {
                        favorites[exactLink] = {
                            name: extractResourceName(exactLink),
                            link: exactLink
                        };
                        chrome.storage.sync.set({ favorites }, () => {
                            chrome.notifications.create({
                                type: 'basic',
                                iconUrl: 'Assets/logo.png',
                                title: 'Added to Favorites',
                                message: `Added to DevPack Favorites:\n${exactLink}`,
                                priority: 1
                            });
                            chrome.storage.local.remove('lastBookmarkedLink');
                        });
                    } else {
                        chrome.storage.local.remove('lastBookmarkedLink');
                    }
                });
            });
        } else { // No or closed notification
            chrome.storage.local.remove('lastBookmarkedLink');
        }
    }
});