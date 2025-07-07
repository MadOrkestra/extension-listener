// Extract the Cardano URL from the current page's hash
function getCardanoUrlFromHash() {
    const hash = window.location.hash;
    const match = hash.match(/\?q=(.+)/);
    if (match) {
        return decodeURIComponent(match[1]);
    }
    return null;
}

// Parse Cardano URL parameters
function parseCardanoUrl(cardanoUrl) {
    try {
        const url = new URL(cardanoUrl);
        const params = new URLSearchParams(url.search);
        return {
            protocol: url.protocol,
            pathname: url.pathname,
            params: Object.fromEntries(params)
        };
    } catch (error) {
        console.error('Error parsing Cardano URL:', error);
        return null;
    }
}

// Display the Cardano URL and parameters
function displayCardanoRequest() {
    const cardanoUrl = getCardanoUrlFromHash();
    const urlDisplay = document.getElementById('cardano-url');
    const parametersDiv = document.getElementById('parameters');

    if (!cardanoUrl) {
        urlDisplay.textContent = 'No Cardano URL found';
        return;
    }

    urlDisplay.textContent = cardanoUrl;

    const parsed = parseCardanoUrl(cardanoUrl);
    if (parsed && Object.keys(parsed.params).length > 0) {
        parametersDiv.innerHTML = '<h3>Parameters:</h3>';
        Object.entries(parsed.params).forEach(([key, value]) => {
            const paramDiv = document.createElement('div');
            paramDiv.className = 'param-item';
            paramDiv.innerHTML = `<strong>${key}:</strong> ${value}`;
            parametersDiv.appendChild(paramDiv);
        });
    } else {
        parametersDiv.innerHTML = '<p>No parameters found</p>';
    }
}

// Handle user approval
function handleApproval() {
    const cardanoUrl = getCardanoUrlFromHash();

    // Send message to background script
    chrome.runtime.sendMessage({
        action: 'cardanoApproved',
        url: cardanoUrl
    }, (response) => {
        console.log('Cardano request approved:', response);
        // Close the window or show success message
        window.close();
    });
}

// Handle user denial
function handleDenial() {
    const cardanoUrl = getCardanoUrlFromHash();

    // Send message to background script
    chrome.runtime.sendMessage({
        action: 'cardanoDenied',
        url: cardanoUrl
    }, (response) => {
        console.log('Cardano request denied:', response);
        // Close the window
        window.close();
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
    displayCardanoRequest();

    // Add event listeners
    document.getElementById('approve-btn').addEventListener('click', handleApproval);
    document.getElementById('deny-btn').addEventListener('click', handleDenial);
});
