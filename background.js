chrome.webNavigation.onCompleted.addListener((details) => {
    const url = new URL(details.url);

    if (url.hostname === "localhost" && url.port === "5173" && url.pathname === "/trigger") {
        // Inject the content script into the current tab
        chrome.scripting.executeScript({
            target: { tabId: details.tabId },
            files: ["content.js"]
        });
    }
});