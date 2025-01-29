chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error("Error setting side panel behavior:", error));

chrome.runtime.onInstalled.addListener(() => {
    console.log("DevPack extension installed and side panel behavior set.");

    chrome.contextMenus.create({
        id: "devpackAddFavorite",
        title: "Add to DevPack Favorites",
        contexts: ["page"]
    });
});

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

chrome.bookmarks.onCreated.addListener((id, bookmark) => {
    if (!bookmark.url) return; 
    const domain = new URL(bookmark.url).hostname.replace(/^www\./, '');

    chrome.storage.local.set({ lastBookmarkedDomain: domain }, () => {
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

chrome.notifications.onButtonClicked.addListener((notifId, btnIdx) => {
    if (notifId === 'devpack-bookmark-notification') {
        if (btnIdx === 0) {
            chrome.storage.local.get(['lastBookmarkedDomain'], (res) => {
                const domain = res.lastBookmarkedDomain;
                if (!domain) return;

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
