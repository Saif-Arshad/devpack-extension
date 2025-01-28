// Enable side panel auto-open behavior (if your extension supports Side Panel)
chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error("Error setting side panel behavior:", error));

// Initialize everything once, on install/update
chrome.runtime.onInstalled.addListener(() => {
    console.log("DevPack extension installed and side panel behavior set.");

    // Create the context menu option for adding pages to DevPack Favorites
    chrome.contextMenus.create({
        id: "devpackAddFavorite",
        title: "Add to DevPack Favorites",
        contexts: ["page"]
    });
});

// 1) Handle the right-click context menu for adding a domain to DevPack favorites
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "devpackAddFavorite") {
        if (!info.pageUrl) return;

        const domain = new URL(info.pageUrl).hostname.replace(/^www\./, '');
        chrome.storage.sync.get(['customFavorites'], (result) => {
            let customFavorites = result.customFavorites || [];
            if (!customFavorites.includes(domain)) {
                customFavorites.push(domain);
                chrome.storage.sync.set({ customFavorites }, () => {
                    console.log(`Added ${domain} to customFavorites.`);
                });
            } else {
                console.log(`${domain} is already in customFavorites.`);
            }
        });
    }
});

// 2) Listen for normal Chrome bookmarks being created and show a notification
chrome.bookmarks.onCreated.addListener((id, bookmark) => {
    if (!bookmark.url) return; // Some bookmarks might be folders
    const domain = new URL(bookmark.url).hostname.replace(/^www\./, '');

    // Store the just-bookmarked domain in storage so we can retrieve it when user clicks the notification
    chrome.storage.local.set({ lastBookmarkedDomain: domain }, () => {
        // Create a notification asking if user wants to add to DevPack
        chrome.notifications.create('devpack-bookmark-notification', {
            type: 'basic',
            iconUrl: 'Assets/logo.png',
            title: 'Add to DevPack Favorites?',
            message: `You just bookmarked ${domain}. Add it to DevPack favorites?`,
            priority: 2,
            buttons: [
                { title: 'Yes' },
                { title: 'No' }
            ]
        });
    });
});

// 3) When the user clicks a button on our notification:
chrome.notifications.onButtonClicked.addListener((notifId, btnIdx) => {
    if (notifId === 'devpack-bookmark-notification') {
        // "Yes" button was clicked
        if (btnIdx === 0) {
            // Retrieve the last bookmarked domain from storage
            chrome.storage.local.get(['lastBookmarkedDomain'], (res) => {
                const domain = res.lastBookmarkedDomain;
                if (!domain) return;

                // Add domain to DevPack customFavorites if not already there
                chrome.storage.sync.get(['customFavorites'], (result) => {
                    let customFavorites = result.customFavorites || [];
                    if (!customFavorites.includes(domain)) {
                        customFavorites.push(domain);
                        chrome.storage.sync.set({ customFavorites }, () => {
                            console.log(`Added ${domain} to DevPack favorites from bookmark.`);
                        });
                    } else {
                        console.log(`${domain} is already in DevPack favorites.`);
                    }
                });
            });
        }
        // "No" button was clicked => do nothing
    }
});
