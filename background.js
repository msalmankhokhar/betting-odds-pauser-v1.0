// Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
    console.log('Betting Odds Pauser extension installed');
    // Initialize badge
    updateBadge(false);
});

// Keep service worker alive
chrome.runtime.onStartup.addListener(() => {
    console.log('Betting Odds Pauser extension started');
    updateBadge(false);
});

// Handle messages between popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
        // Forward messages if needed
        if (request.action === 'statusUpdate') {
            // Update badge based on pause status
            updateBadge(request.isPaused);
        }
        
        // Always send a response to keep connection alive
        sendResponse({received: true});
    } catch (e) {
        console.log('Background script error:', e);
        sendResponse({error: e.message});
    }
    
    // Return true to indicate we will send a response asynchronously
    return true;
});

// Update extension badge based on pause status
function updateBadge(isPaused) {
    try {
        if (isPaused) {
            chrome.action.setBadgeText({text: '⏸'});
            chrome.action.setBadgeBackgroundColor({color: '#ff5722'});
        } else {
            chrome.action.setBadgeText({text: '▶'});
            chrome.action.setBadgeBackgroundColor({color: '#4caf50'});
        }
    } catch (e) {
        console.log('Badge update error:', e);
    }
}

// Handle extension errors
chrome.runtime.onConnect.addListener((port) => {
    port.onDisconnect.addListener(() => {
        if (chrome.runtime.lastError) {
            console.log('Port disconnected:', chrome.runtime.lastError);
        }
    });
});

// Initialize badge when service worker starts
updateBadge(false);
