// Listen for navigation events (existing localhost trigger)
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

// Listen for extension installation to register protocol handler
chrome.runtime.onInstalled.addListener(async () => {
    console.log('Extension installed, setting up protocol handler');

    // Check if user has already seen the setup
    const result = await chrome.storage.local.get(['protocolHandlerRegistered', 'protocolHandlerSkipped']);

    if (!result.protocolHandlerRegistered && !result.protocolHandlerSkipped) {
        // Create a popup window to ask user to register the protocol handler
        const window = await chrome.windows.create({
            url: chrome.runtime.getURL('protocol_setup.html'),
            type: 'popup',
            width: 700,
            height: 650,
            focused: true
        });
    }
});

// Listen for messages from content scripts and main window
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'handleCardanoUrl') {
        console.log('Received Cardano URL from content script:', request.url);

        // Open the main window in a popup window
        chrome.windows.create({
            url: chrome.runtime.getURL(`main_window.html#/send-from-uri?q=${encodeURIComponent(request.url)}`),
            type: 'popup',
            width: 650,
            height: 600,
            focused: true
        });

        sendResponse({ success: true });
    } else if (request.action === 'cardanoApproved') {
        console.log('User approved Cardano request:', request.url);
        processCardanoTransaction(request.url);
        sendResponse({ success: true });
    } else if (request.action === 'cardanoDenied') {
        console.log('User denied Cardano request:', request.url);
        sendResponse({ success: true });
    } else if (request.action === 'protocolRegistered') {
        console.log('Protocol handler registered');
        chrome.storage.local.set({
            protocolHandlerRegistered: true,
            registrationDate: request.registrationDate
        });
        sendResponse({ success: true });
    } else if (request.action === 'protocolSkipped') {
        console.log('Protocol handler setup skipped');
        chrome.storage.local.set({
            protocolHandlerSkipped: true,
            skipDate: request.skipDate
        });
        sendResponse({ success: true });
    }
});

// Function to process approved Cardano transactions
function processCardanoTransaction(cardanoUrl) {
    console.log('Processing Cardano transaction:', cardanoUrl);

    // Parse the URL to extract transaction details
    try {
        const url = new URL(cardanoUrl);
        const params = new URLSearchParams(url.search);

        const transactionDetails = {
            amount: params.get('amount'),
            address: params.get('address'),
            asset: params.get('asset') || 'ADA',
            metadata: params.get('metadata')
        };

        console.log('Transaction details:', transactionDetails);

        // Here you would integrate with Cardano wallet APIs
        // For now, just log the details
        console.log('Ready to process transaction:', transactionDetails);

        // You could show a notification or update the UI
        chrome.notifications?.create({
            type: 'basic',
            iconUrl: 'icon.png', // Add an icon if you have one
            title: 'Cardano Transaction',
            message: `Processing transaction of ${transactionDetails.amount} ${transactionDetails.asset}`
        });

    } catch (error) {
        console.error('Error processing Cardano transaction:', error);
    }
}