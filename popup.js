// Popup JavaScript - Controls the extension UI
// Professional Chrome Extension by Salman Malik
// LinkedIn: https://www.linkedin.com/in/msalmankhokhar/
// Available for custom extension development

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Odds Pauser] Professional Extension by Salman Malik - LinkedIn: https://www.linkedin.com/in/msalmankhokhar/');
    
    const pauseBtn = document.getElementById('pauseBtn');
    const resumeBtn = document.getElementById('resumeBtn');
    const statusDiv = document.getElementById('status');
    const statusText = document.getElementById('statusText');
    const timerNumber = document.getElementById('timerNumber');// Get current tab and send message to content script
    function sendMessageToCurrentTab(action, callback) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                // Try to send message first
                chrome.tabs.sendMessage(tabs[0].id, {action: action}, function(response) {
                    if (chrome.runtime.lastError) {
                        // If content script not found, inject it manually
                        console.log('Content script not found, injecting manually...');
                        injectContentScript(tabs[0].id, function() {
                            // Try sending message again after injection
                            setTimeout(() => {
                                chrome.tabs.sendMessage(tabs[0].id, {action: action}, function(response) {
                                    if (chrome.runtime.lastError) {
                                        console.log('Failed to connect after injection:', chrome.runtime.lastError);
                                        callback(null);
                                    } else {
                                        callback(response);
                                    }
                                });
                            }, 200); // Increased delay
                        });
                    } else {
                        callback(response);
                    }
                });
            } else {
                callback(null);
            }
        });
    }
    
    // Manually inject content script if needed
    function injectContentScript(tabId, callback) {
        chrome.scripting.executeScript({
            target: {tabId: tabId},
            files: ['content.js']
        }, callback);
    }
      // Update UI based on current status
    function updateUI(isPaused, timerCount) {
        if (isPaused) {
            statusDiv.className = 'status paused';
            statusText.textContent = '⏸️ Odds Updates PAUSED';
            pauseBtn.style.display = 'none';
            resumeBtn.style.display = 'block';
        } else {
            statusDiv.className = 'status running';
            statusText.textContent = '▶️ Odds Updates RUNNING';
            pauseBtn.style.display = 'block';
            resumeBtn.style.display = 'none';
        }
        
        if (timerCount && typeof timerCount.total === 'number') {
            timerNumber.textContent = timerCount.total;
        } else {
            timerNumber.textContent = '0';
        }
    }
    
    // Pause button click handler
    pauseBtn.addEventListener('click', function() {
        pauseBtn.disabled = true;
        pauseBtn.textContent = '⏳ Pausing...';
        
        sendMessageToCurrentTab('pauseTimers', function(response) {
            if (response && response.success) {
                updateUI(response.isPaused);
                showNotification('Odds updates paused successfully!', 'success');
            } else {
                showNotification('Failed to pause odds updates', 'error');
            }
            pauseBtn.disabled = false;
            pauseBtn.textContent = '⏸️ Pause Odds';
        });
    });
    
    // Resume button click handler
    resumeBtn.addEventListener('click', function() {
        resumeBtn.disabled = true;
        resumeBtn.textContent = '⏳ Resuming...';
        
        sendMessageToCurrentTab('resumeTimers', function(response) {
            if (response && response.success) {
                updateUI(response.isPaused);
                showNotification('Odds updates resumed successfully!', 'success');
            } else {
                showNotification('Failed to resume odds updates', 'error');
            }
            resumeBtn.disabled = false;
            resumeBtn.textContent = '▶️ Resume Odds';
        });
    });
    
    // Show notification
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            padding: 10px 15px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            transition: all 0.3s ease;
            ${type === 'success' ? 'background-color: #4caf50;' : 'background-color: #f44336;'}
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }    // Debounce status updates to prevent flickering
    let statusUpdateTimeout;
    let lastKnownStatus = null;
    
    function debouncedUpdateUI(isPaused, timerCount) {
        clearTimeout(statusUpdateTimeout);
        statusUpdateTimeout = setTimeout(() => {
            // Only update if status actually changed
            let newStatus = JSON.stringify({isPaused, timerCount});
            if (newStatus !== lastKnownStatus) {
                updateUI(isPaused, timerCount);
                lastKnownStatus = newStatus;
            }
        }, 100);
    }
    
    // Listen for status updates from content script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'statusUpdate') {
            debouncedUpdateUI(request.isPaused, request.timerCount);
        }
    });
    
    // Initial status check
    sendMessageToCurrentTab('getStatus', function(response) {
        if (response) {
            debouncedUpdateUI(response.isPaused, response.timerCount);
        } else {
            statusText.textContent = '🔄 Connecting...';
            statusDiv.className = 'status running';
            
            // Try to manually inject and reconnect
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs[0]) {
                    injectContentScript(tabs[0].id, function() {
                        setTimeout(() => {
                            sendMessageToCurrentTab('getStatus', function(retryResponse) {
                                if (retryResponse) {
                                    debouncedUpdateUI(retryResponse.isPaused, retryResponse.timerCount);
                                } else {
                                    statusText.textContent = '❌ Not compatible with this page';
                                    statusDiv.className = 'status running';
                                }
                            });
                        }, 500);
                    });
                }
            });
        }
    });
    
    // Refresh status every 2 seconds
    setInterval(() => {
        sendMessageToCurrentTab('getStatus', function(response) {
            if (response) {
                updateUI(response.isPaused, response.timerCount);
            }
        });
    }, 2000);
});
