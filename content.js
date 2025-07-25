// Get the current URL and extract parameters
const currentUrl = new URL(window.location.href);
const urlParams = new URLSearchParams(currentUrl.search);

// Create a message showing the URL and parameters
let message = "✅ Extension triggered from localhost:5173/trigger!\n\n";
message += `Full URL: ${currentUrl.href}\n`;

// Check if there are any parameters
if (urlParams.toString()) {
    message += "\nURL Parameters:\n";
    for (const [key, value] of urlParams.entries()) {
        message += `• ${key}: ${value}\n`;
    }

    // Check for Cardano-related parameters
    const cardanoParams = ['address', 'amount', 'asset', 'metadata', 'utxo'];
    const foundCardanoParams = cardanoParams.filter(param => urlParams.has(param));

    if (foundCardanoParams.length > 0) {
        message += "\n🔗 Cardano-related parameters detected:\n";
        foundCardanoParams.forEach(param => {
            message += `• ${param}: ${urlParams.get(param)}\n`;
        });
    }
} else {
    message += "\nNo URL parameters found.";
}

// Display the information
alert(message);

// Add event listener for web+cardano protocol handling
document.addEventListener('DOMContentLoaded', function () {
    // Check if extension context is still valid
    if (!chrome || !chrome.runtime || !chrome.runtime.id) {
        console.log('Extension context invalidated in content.js');
        return;
    }

    // Look for web+cardano links on the page
    const cardanoLinks = document.querySelectorAll('a[href^="web+cardano:"]');

    cardanoLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const cardanoUrl = this.href;

            // Send message to background script with error handling
            try {
                chrome.runtime.sendMessage({
                    action: 'handleCardanoUrl',
                    url: cardanoUrl
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('Extension context invalidated:', chrome.runtime.lastError.message);
                        alert(`Extension context invalidated. Please reload the page.\n\nCardano URL: ${cardanoUrl}`);
                    }
                });
            } catch (error) {
                console.error('Failed to send message:', error);
                alert(`Extension error. Please reload the page.\n\nCardano URL: ${cardanoUrl}`);
            }
        });
    });
});

// You can also access specific parameters like this:
// const specificParam = urlParams.get('paramName');
// console.log('Specific parameter:', specificParam);
