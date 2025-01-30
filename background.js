// Set up the side panel behavior (Ensure this API is supported and permissions are set)
chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error("Error setting side panel behavior:", error));

// On installation, set up context menus
chrome.runtime.onInstalled.addListener(() => {
    console.log("DevPack extension installed and side panel behavior set.");

    // Create a top-level "Add to DevPack Favorites" context menu
    chrome.contextMenus.create({
        id: "devpackAddFavorite",
        title: "Add to DevPack Favorites",
        contexts: ["link"] // Ensure it appears only when right-clicking a link
    });

    // Create a top-level "Add to DevPack Collection" context menu
    chrome.contextMenus.create({
        id: "devpackAddToCollection",
        title: "Add to DevPack Collection",
        contexts: ["link"] // Ensure it appears only when right-clicking a link
    });

    // Build submenus for existing collections
    buildCollectionSubmenus();
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    // Ensure that the clicked context has a link URL
    if (!info.linkUrl) {
        console.warn("No link URL found. Operation aborted.");
        return;
    }

    const exactLink = info.linkUrl; // Get the exact clicked link

    // **Add to Favorites**
    if (info.menuItemId === "devpackAddFavorite") {
        if (exactLink) {
            // Retrieve existing favorites from storage
            chrome.storage.sync.get(['favorites'], (res) => {
                let favorites = res.favorites || [];

                // Check if the exact link is already in favorites
                if (!favorites.includes(exactLink)) {
                    favorites.push(exactLink); // Add the exact link
                    chrome.storage.sync.set({ favorites }, () => {
                        console.log(`Added to DevPack Favorites: ${exactLink}`);
                        // Notify the user
                        chrome.notifications.create({
                            type: 'basic',
                            iconUrl: 'Assets/logo.png',
                            title: 'Added to Favorites',
                            message: `Added to DevPack Favorites:\n${exactLink}`,
                            priority: 1
                        });
                    });
                } else {
                    console.log(`Already in DevPack Favorites: ${exactLink}`);
                    // Notify the user
                    chrome.notifications.create({
                        type: 'basic',
                        iconUrl: 'Assets/logo.png',
                        title: 'Already a Favorite',
                        message: `This link is already in your favorites:\n${exactLink}`,
                        priority: 1
                    });
                }
            });
        }
    }

    // **Add to Collection**
    else if (info.menuItemId.startsWith("collection_")) {
        const collectionName = info.menuItemId.replace("collection_", "");

        if (exactLink) {
            const resourceObj = {
                name: extractResourceName(exactLink), // Extract a friendly name from the URL
                link: exactLink,
                description: '' // Optional: You can add a description field if needed
            };

            // Retrieve existing collections from storage
            chrome.storage.sync.get(['collections'], (res) => {
                let collections = res.collections || {};

                // Initialize the collection array if it doesn't exist
                if (!collections[collectionName]) {
                    collections[collectionName] = [];
                }

                // Check for duplicates based on the exact link
                const exists = collections[collectionName].some(item => item.link === exactLink);
                if (!exists) {
                    collections[collectionName].push(resourceObj); // Add the resource to the collection
                    chrome.storage.sync.set({ collections }, () => {
                        console.log(`Added to collection "${collectionName}": ${exactLink}`);
                        // Notify the user
                        chrome.notifications.create({
                            type: 'basic',
                            iconUrl: 'Assets/logo.png',
                            title: 'Added to Collection',
                            message: `Added to "${collectionName}":\n${exactLink}`,
                            priority: 1
                        });
                    });
                } else {
                    console.log(`Already in collection "${collectionName}": ${exactLink}`);
                    // Notify the user
                    chrome.notifications.create({
                        type: 'basic',
                        iconUrl: 'Assets/logo.png',
                        title: 'Already in Collection',
                        message: `This link is already in "${collectionName}":\n${exactLink}`,
                        priority: 1
                    });
                }
            });
        }
    }
});

// Listen to changes in storage to rebuild context menus if collections are updated
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync' && changes.collections) {
        // Rebuild submenus
        buildCollectionSubmenus();
    }
});

/**
 * Function to build collection submenus under "Add to DevPack Collection"
 */
function buildCollectionSubmenus() {
    // First, remove all context menus to prevent duplicates
    chrome.contextMenus.removeAll(() => {
        // Recreate top-level "Add to DevPack Favorites"
        chrome.contextMenus.create({
            id: "devpackAddFavorite",
            title: "Add to DevPack Favorites",
            contexts: ["link"]
        });

        // Recreate top-level "Add to DevPack Collection"
        chrome.contextMenus.create({
            id: "devpackAddToCollection",
            title: "Add to DevPack Collection",
            contexts: ["link"]
        });

        // Now create submenus for each existing collection
        chrome.storage.sync.get(['collections'], (res) => {
            const collections = res.collections || {};
            Object.keys(collections).forEach(collName => {
                chrome.contextMenus.create({
                    id: `collection_${collName}`,
                    parentId: "devpackAddToCollection",
                    title: collName,
                    contexts: ["link"]
                });
            });
        });
    });
}

/**
 * Helper function to extract a friendly name from a URL
 * You can customize this function based on your requirements
 * For now, it extracts the hostname without 'www.'
 */
function extractResourceName(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace(/^www\./, '');
    } catch (e) {
        console.error("Invalid URL:", url);
        return url; // Fallback to the full URL if parsing fails
    }
}

/**
 * Optional: Handle bookmark additions
 * Automatically add bookmarked URLs to favorites with user confirmation
 */
chrome.bookmarks.onCreated.addListener((id, bookmark) => {
    if (!bookmark.url) return;

    const exactLink = bookmark.url; // Get the exact bookmark URL

    chrome.storage.sync.get(['favorites'], (res) => {
        let favorites = res.favorites || [];

        // Check if the exact link is already in favorites
        if (!favorites.includes(exactLink)) {
            // Store the last bookmarked link in local storage to reference in notification
            chrome.storage.local.set({ lastBookmarkedLink: exactLink }, () => {
                // Create a notification asking the user to add the bookmark to favorites
                chrome.notifications.create('devpack-bookmark-notification', {
                    type: 'basic',
                    iconUrl: 'Assets/logo.png',
                    title: 'Add to DevPack Favorites?',
                    message: `You just bookmarked:\n${exactLink}\nWould you like to add it to DevPack Favorites?`,
                    priority: 2,
                    buttons: [
                        { title: 'Yes' },
                        { title: 'No' }
                    ]
                });
            });
        } else {
            console.log(`${exactLink} is already in DevPack Favorites.`);
        }
    });
});

/**
 * Handle notification button clicks
 * Specifically handle the "Add to DevPack Favorites?" notification buttons
 */
chrome.notifications.onButtonClicked.addListener((notifId, btnIdx) => {
    if (notifId === 'devpack-bookmark-notification') {
        if (btnIdx === 0) { // User clicked "Yes"
            chrome.storage.local.get(['lastBookmarkedLink'], (res) => {
                const exactLink = res.lastBookmarkedLink;
                if (!exactLink) return;

                // Retrieve existing favorites from storage
                chrome.storage.sync.get(['favorites'], (res) => {
                    let favorites = res.favorites || [];

                    // Check if the exact link is already in favorites
                    if (!favorites.includes(exactLink)) {
                        favorites.push(exactLink); // Add the exact link
                        chrome.storage.sync.set({ favorites }, () => {
                            console.log(`Added to DevPack Favorites from bookmark: ${exactLink}`);
                            // Notify the user
                            chrome.notifications.create({
                                type: 'basic',
                                iconUrl: 'Assets/logo.png',
                                title: 'Added to Favorites',
                                message: `Added to DevPack Favorites:\n${exactLink}`,
                                priority: 1
                            });
                        });
                    } else {
                        console.log(`Already in DevPack Favorites: ${exactLink}`);
                        // Notify the user
                        chrome.notifications.create({
                            type: 'basic',
                            iconUrl: 'Assets/logo.png',
                            title: 'Already a Favorite',
                            message: `This link is already in your favorites:\n${exactLink}`,
                            priority: 1
                        });
                    }
                });
            });
        }
        // btnIdx === 1 corresponds to "No" button, do nothing
    }
});
