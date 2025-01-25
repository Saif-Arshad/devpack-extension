chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error("Error setting side panel behavior:", error));

chrome.runtime.onInstalled.addListener(() => {
    console.log("DevPack extension installed and side panel behavior set.");
});
