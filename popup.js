// Popup JavaScript - Controls the extension UI
document.addEventListener('DOMContentLoaded', function() {
    const pauseBtn = document.getElementById('pauseBtn');
    const resumeBtn = document.getElementById('resumeBtn');
    const statusDiv = document.getElementById('status');
    const statusText = document.getElementById('statusText');
    const timerNumber = document.getElementById('timerNumber');
    
    // Get current tab and send message to content script
    function sendMessageToCurrentTab(action, callback) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {action: action}, callback);
            }
        });
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
        
        if (timerCount) {
            timerNumber.textContent = timerCount.total || 0;
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
    }
    
    // Initial status check
    sendMessageToCurrentTab('getStatus', function(response) {
        if (response) {
            updateUI(response.isPaused, response.timerCount);
        } else {
            statusText.textContent = '❌ Not connected to page';
            statusDiv.className = 'status running';
        }
    });
    
    // Listen for status updates from content script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'statusUpdate') {
            updateUI(request.isPaused, request.timerCount);
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
