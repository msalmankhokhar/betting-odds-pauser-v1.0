// Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
    console.log('Betting Odds Pauser extension installed');
});

// Handle messages between popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Forward messages if needed
    if (request.action === 'statusUpdate') {
        // This could be used to update badge or other background features
        updateBadge(request.isPaused);
    }
});

// Update extension badge based on pause status
function updateBadge(isPaused) {
    if (isPaused) {
        chrome.action.setBadgeText({text: '⏸'});
        chrome.action.setBadgeBackgroundColor({color: '#ff5722'});
    } else {
        chrome.action.setBadgeText({text: '▶'});
        chrome.action.setBadgeBackgroundColor({color: '#4caf50'});
    }
}

// Initialize badge
updateBadge(false);
