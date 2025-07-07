// Extension context monitor
// This script helps detect when the extension context becomes invalid

(function () {
    'use strict';

    // Check if this is a content script context
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        // Monitor for extension context invalidation
        const originalSendMessage = chrome.runtime.sendMessage;

        chrome.runtime.sendMessage = function (...args) {
            try {
                return originalSendMessage.apply(this, args);
            } catch (error) {
                console.warn('Extension context invalidated:', error.message);

                // Show user-friendly message
                if (error.message.includes('Extension context invalidated')) {
                    showContextInvalidatedMessage();
                }

                throw error;
            }
        };

        // Function to show context invalidated message
        function showContextInvalidatedMessage() {
            // Only show once per page load
            if (window.cardanoExtensionContextWarningShown) {
                return;
            }
            window.cardanoExtensionContextWarningShown = true;

            // Create a non-intrusive notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ff6b6b;
                color: white;
                padding: 15px;
                border-radius: 5px;
                font-family: Arial, sans-serif;
                font-size: 14px;
                z-index: 999999;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                max-width: 300px;
                cursor: pointer;
            `;

            notification.innerHTML = `
                <strong>⚠️ Extension Context Lost</strong><br>
                The Cardano extension was reloaded. Please refresh this page to restore functionality.
                <br><br>
                <small>Click to dismiss</small>
            `;

            notification.addEventListener('click', () => {
                notification.remove();
            });

            document.body.appendChild(notification);

            // Auto-remove after 10 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 10000);
        }

        // Also monitor for runtime becoming undefined
        const checkInterval = setInterval(() => {
            if (!chrome.runtime || !chrome.runtime.id) {
                console.warn('Extension runtime no longer available');
                showContextInvalidatedMessage();
                clearInterval(checkInterval);
            }
        }, 5000);

        // Clean up interval when page unloads
        window.addEventListener('beforeunload', () => {
            clearInterval(checkInterval);
        });
    }
})();
