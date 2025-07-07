// Universal content script for handling web+cardano links
// This script will be injected into web pages to intercept web+cardano URLs

// Check if extension context is still valid
function isExtensionContextValid() {
    try {
        return !!(chrome && chrome.runtime && chrome.runtime.id);
    } catch (error) {
        return false;
    }
}

// Function to handle web+cardano links
function interceptCardanoLinks() {
    // Only proceed if extension context is valid
    if (!isExtensionContextValid()) {
        console.log('Extension context invalidated, skipping Cardano link interception');
        return;
    }

    // Find all web+cardano links on the page
    const cardanoLinks = document.querySelectorAll('a[href^="web+cardano:"]');

    cardanoLinks.forEach(link => {
        // Remove any existing event listeners
        link.removeEventListener('click', handleCardanoClick);
        // Add new event listener
        link.addEventListener('click', handleCardanoClick);
    });
}

// Handle clicks on web+cardano links
function handleCardanoClick(event) {
    event.preventDefault();
    const cardanoUrl = this.href;

    console.log('Intercepted web+cardano link:', cardanoUrl);

    // Send message to background script with error handling
    try {
        chrome.runtime.sendMessage({
            action: 'handleCardanoUrl',
            url: cardanoUrl
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Extension context invalidated or message failed:', chrome.runtime.lastError.message);
                // Fallback: try to handle the URL directly
                handleCardanoUrlFallback(cardanoUrl);
            } else {
                console.log('Cardano URL handled successfully:', response);
            }
        });
    } catch (error) {
        console.error('Failed to send message to extension:', error);
        // Fallback: try to handle the URL directly
        handleCardanoUrlFallback(cardanoUrl);
    }
}

// Fallback function when extension context is invalidated
function handleCardanoUrlFallback(cardanoUrl) {
    console.log('Using fallback handler for:', cardanoUrl);
    // Show a simple alert as fallback
    alert(`Cardano URL detected: ${cardanoUrl}\n\nPlease reload the page and try again, or check if the extension is working properly.`);
}

// Function to create a web+cardano link for testing
function createTestCardanoLink() {
    const testLink = document.createElement('a');
    testLink.href = 'web+cardano://send?amount=5&address=addr1test&asset=ADA';
    testLink.textContent = 'Test Cardano Transaction';
    testLink.style.cssText = `
        display: inline-block;
        padding: 10px 20px;
        background: #0033AD;
        color: white;
        text-decoration: none;
        border-radius: 5px;
        margin: 10px;
        font-weight: bold;
    `;

    // Add to page if we're on the trigger page
    if (window.location.pathname === '/trigger') {
        document.body.appendChild(testLink);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        if (!isExtensionContextValid()) {
            console.log('Extension context invalidated during initialization');
            return;
        }

        interceptCardanoLinks();
        createTestCardanoLink();

        // Watch for dynamically added links
        const observer = new MutationObserver(function () {
            if (isExtensionContextValid()) {
                interceptCardanoLinks();
            } else {
                // Stop observing if extension context is invalidated
                observer.disconnect();
                console.log('Extension context invalidated, stopping mutation observer');
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
} else {
    // DOM is already ready
    if (isExtensionContextValid()) {
        interceptCardanoLinks();
        createTestCardanoLink();

        // Watch for dynamically added links
        const observer = new MutationObserver(function () {
            if (isExtensionContextValid()) {
                interceptCardanoLinks();
            } else {
                // Stop observing if extension context is invalidated
                observer.disconnect();
                console.log('Extension context invalidated, stopping mutation observer');
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    } else {
        console.log('Extension context invalidated, skipping initialization');
    }
}
