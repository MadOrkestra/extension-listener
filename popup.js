// Popup JavaScript
document.addEventListener('DOMContentLoaded', function () {
    const statusDiv = document.getElementById('status');
    const setupBtn = document.getElementById('setup-btn');
    const testBtn = document.getElementById('test-btn');

    // Check protocol handler status
    checkStatus();

    setupBtn.addEventListener('click', openSetup);
    testBtn.addEventListener('click', testCardanoUrl);
});

async function checkStatus() {
    try {
        const result = await chrome.storage.local.get(['protocolHandlerRegistered', 'protocolHandlerSkipped']);
        const statusDiv = document.getElementById('status');

        if (result.protocolHandlerRegistered) {
            statusDiv.textContent = '✅ Protocol handler is registered';
            statusDiv.className = 'status registered';
            document.getElementById('setup-btn').textContent = 'Re-register Protocol Handler';
        } else if (result.protocolHandlerSkipped) {
            statusDiv.textContent = '⚠️ Protocol handler not registered';
            statusDiv.className = 'status not-registered';
        } else {
            statusDiv.textContent = '❓ Protocol handler status unknown';
            statusDiv.className = 'status not-registered';
        }
    } catch (error) {
        console.error('Error checking status:', error);
        document.getElementById('status').textContent = 'Error checking status';
    }
}

function openSetup() {
    chrome.windows.create({
        url: chrome.runtime.getURL('protocol_setup.html'),
        type: 'popup',
        width: 700,
        height: 650,
        focused: true
    });
    window.close();
}

function testCardanoUrl() {
    // Create a test popup window with a web+cardano URL
    chrome.windows.create({
        url: chrome.runtime.getURL('main_window.html#/send-from-uri?q=web%2Bcardano%3A%2F%2Fsend%3Famount%3D10%26address%3Daddr1test%26asset%3DADA'),
        type: 'popup',
        width: 650,
        height: 600,
        focused: true
    });
    window.close();
}
