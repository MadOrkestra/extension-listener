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
} else {
    message += "\nNo URL parameters found.";
}

// Display the information
alert(message);

// You can also access specific parameters like this:
// const specificParam = urlParams.get('paramName');
// console.log('Specific parameter:', specificParam);
