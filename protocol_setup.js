// Protocol setup JavaScript
document.addEventListener('DOMContentLoaded', function () {
    const registerBtn = document.getElementById('register-btn');
    const skipBtn = document.getElementById('skip-btn');
    const statusDiv = document.getElementById('status');

    // Check if protocol handler is already registered
    checkProtocolHandlerStatus();

    registerBtn.addEventListener('click', registerProtocolHandler);
    skipBtn.addEventListener('click', skipSetup);
});

async function checkProtocolHandlerStatus() {
    try {
        // Check if we can register protocol handlers
        if (!navigator.registerProtocolHandler) {
            showStatus('Your browser does not support protocol handlers.', 'error');
            document.getElementById('register-btn').disabled = true;
            return;
        }

        // Check if already registered (this is limited in what we can detect)
        console.log('Protocol handler support available');

    } catch (error) {
        console.error('Error checking protocol handler status:', error);
    }
}

function registerProtocolHandler() {
    try {
        const protocolUrl = chrome.runtime.getURL('main_window.html#/send-from-uri?q=%s');

        // Register the protocol handler
        navigator.registerProtocolHandler(
            'web+cardano',
            protocolUrl,
            'Cardano URL Handler'
        );

        showStatus('✅ Protocol handler registered successfully! You can now handle web+cardano URLs.', 'success');

        // Send message to background script to store the registration status
        chrome.runtime.sendMessage({
            action: 'protocolRegistered',
            registrationDate: new Date().toISOString()
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Error sending message:', chrome.runtime.lastError);
            } else {
                console.log('Protocol registration stored:', response);
            }
        });

        // Close the tab after a delay
        setTimeout(() => {
            window.close();
        }, 3000);

    } catch (error) {
        console.error('Error registering protocol handler:', error);
        showStatus('❌ Failed to register protocol handler: ' + error.message, 'error');
    }
}

function skipSetup() {
    // Send message to background script to store that user skipped setup
    chrome.runtime.sendMessage({
        action: 'protocolSkipped',
        skipDate: new Date().toISOString()
    }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError);
        } else {
            console.log('Protocol skip stored:', response);
        }
    });

    showStatus('Setup skipped. You can register the protocol handler later from the extension popup.', 'success');

    // Close the tab after a delay
    setTimeout(() => {
        window.close();
    }, 2000);
}

function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
}

// Handle messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'checkProtocolHandler') {
        checkProtocolHandlerStatus();
        sendResponse({ success: true });
    }
});
