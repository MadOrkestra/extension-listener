// Universal content script for handling web+cardano links
// This script will be injected into web pages to intercept web+cardano URLs

// Function to handle web+cardano links
function interceptCardanoLinks() {
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

    // Send message to background script
    chrome.runtime.sendMessage({
        action: 'handleCardanoUrl',
        url: cardanoUrl
    });
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
        interceptCardanoLinks();
        createTestCardanoLink();

        // Watch for dynamically added links
        const observer = new MutationObserver(function () {
            interceptCardanoLinks();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
} else {
    // DOM is already ready
    interceptCardanoLinks();
    createTestCardanoLink();

    // Watch for dynamically added links
    const observer = new MutationObserver(function () {
        interceptCardanoLinks();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}
