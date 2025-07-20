// Content Script - Injected into web pages to control timers
// Professional Chrome Extension by Salman Malik
// LinkedIn: https://www.linkedin.com/in/msalmankhokhar/
// Betting Odds Pauser - Advanced Timer Control System

(function() {
    'use strict';
    
    // Prevent multiple injections
    if (window.oddsTimerController) {
        console.log('[Odds Pauser] Already injected, skipping...');
        return;
    }
    
    // Mark as injected
    window.oddsTimerController = true;
    console.log('[Odds Pauser] Professional Extension by Salman Malik - LinkedIn: https://www.linkedin.com/in/msalmankhokhar/');
      let isTimersPaused = false;
    let pausedTimers = [];
    let pausedIntervals = [];
    let originalSetTimeout = window.setTimeout;
    let originalSetInterval = window.setInterval;
    let originalClearTimeout = window.clearTimeout;
    let originalClearInterval = window.clearInterval;
    let originalRequestAnimationFrame = window.requestAnimationFrame;
    let timerIdCounter = 0;
    
    // Store active timers with their actual browser IDs
    let activeTimers = new Map(); // Map of our ID -> browser timer ID
    let activeIntervals = new Map(); // Map of our ID -> browser interval ID
    let allRunningTimers = new Set(); // Track all browser timer IDs for pausing      // Override setTimeout
    window.setTimeout = function(callback, delay, ...args) {
        timerIdCounter++;
        let ourId = timerIdCounter;
        
        console.log('[Odds Pauser] setTimeout called:', delay + 'ms', isTimersPaused ? 'BLOCKED' : 'ALLOWED');
        
        if (isTimersPaused) {
            // Store the timer info but don't execute
            pausedTimers.push({
                id: ourId,
                callback: callback,
                delay: delay,
                args: args,
                timestamp: Date.now()
            });
            console.log('[Odds Pauser] setTimeout blocked:', delay + 'ms');
            updateStatus();
            return ourId;
        }
        
        // Create the actual timer
        let actualId = originalSetTimeout.call(window, function(...callbackArgs) {
            // Remove from tracking when executed
            activeTimers.delete(ourId);
            allRunningTimers.delete(actualId);
            updateStatus();
            return callback.apply(this, callbackArgs);
        }, delay, ...args);
        
        // Track both IDs
        activeTimers.set(ourId, actualId);
        allRunningTimers.add(actualId);
        updateStatus();
        return ourId;
    };
      // Override setInterval  
    window.setInterval = function(callback, delay, ...args) {
        timerIdCounter++;
        let ourId = timerIdCounter;
        
        console.log('[Odds Pauser] setInterval called:', delay + 'ms', isTimersPaused ? 'BLOCKED' : 'ALLOWED');
        
        if (isTimersPaused) {
            // Store the interval info but don't execute
            pausedIntervals.push({
                id: ourId,
                callback: callback,
                delay: delay,
                args: args,
                timestamp: Date.now()
            });
            console.log('[Odds Pauser] setInterval blocked:', delay + 'ms');
            updateStatus();
            return ourId;
        }
        
        // Create the actual interval
        let actualId = originalSetInterval.call(window, callback, delay, ...args);
        
        // Track both IDs
        activeIntervals.set(ourId, actualId);
        allRunningTimers.add(actualId);
        updateStatus();
        return ourId;
    };
      // Override clearTimeout
    window.clearTimeout = function(ourId) {
        if (activeTimers.has(ourId)) {
            let actualId = activeTimers.get(ourId);
            activeTimers.delete(ourId);
            allRunningTimers.delete(actualId);
            updateStatus();
            return originalClearTimeout.call(window, actualId);
        }
        // Also handle direct browser IDs
        allRunningTimers.delete(ourId);
        return originalClearTimeout.call(window, ourId);
    };
    
    // Override clearInterval
    window.clearInterval = function(ourId) {
        if (activeIntervals.has(ourId)) {
            let actualId = activeIntervals.get(ourId);
            activeIntervals.delete(ourId);
            allRunningTimers.delete(actualId);
            updateStatus();
            return originalClearInterval.call(window, actualId);
        }
        // Also handle direct browser IDs
        allRunningTimers.delete(ourId);
        return originalClearInterval.call(window, ourId);
    };    // Function to pause all timers
    function pauseTimers() {
        if (isTimersPaused) return;
        
        isTimersPaused = true;
        console.log('[Odds Pauser] Pausing all timers...');
        
        // Clear all active intervals first
        activeIntervals.forEach((actualId, ourId) => {
            console.log('[Odds Pauser] Clearing interval:', actualId);
            originalClearInterval.call(window, actualId);
            allRunningTimers.delete(actualId);
        });
        
        // Clear all active timeouts
        activeTimers.forEach((actualId, ourId) => {
            console.log('[Odds Pauser] Clearing timeout:', actualId);
            originalClearTimeout.call(window, actualId);
            allRunningTimers.delete(actualId);
        });
        
        // More aggressive clearing for existing timers
        // This helps catch timers that were created before our script loaded
        console.log('[Odds Pauser] Performing aggressive timer clearing...');
        for (let i = 1; i <= 10000; i++) {
            try {
                originalClearInterval.call(window, i);
                originalClearTimeout.call(window, i);
            } catch (e) {
                // Ignore errors for non-existent timers
            }
        }
        
        // Also try to override any new timer creation attempts immediately
        window.requestAnimationFrame = function(callback) {
            if (isTimersPaused) {
                console.log('[Odds Pauser] requestAnimationFrame blocked');
                return -1;
            }
            return originalRequestAnimationFrame.call(window, callback);
        };
        
        console.log('[Odds Pauser] All timers paused - Active:', activeTimers.size, 'Intervals:', activeIntervals.size);
        updateStatus();
    }    // Function to resume all timers
    function resumeTimers() {
        if (!isTimersPaused) return;
        
        isTimersPaused = false;
        console.log('[Odds Pauser] Resuming all timers...');
        
        // Restore requestAnimationFrame
        window.requestAnimationFrame = originalRequestAnimationFrame;
        
        // Resume paused intervals
        pausedIntervals.forEach(timer => {
            try {
                let actualId = originalSetInterval.call(window, timer.callback, timer.delay, ...timer.args);
                activeIntervals.set(timer.id, actualId);
                allRunningTimers.add(actualId);
                console.log('[Odds Pauser] Resumed interval:', timer.delay + 'ms');
            } catch (e) {
                console.log('[Odds Pauser] Error resuming interval:', e);
            }
        });
        pausedIntervals = [];
        
        // Resume paused timeouts (adjust delay for elapsed time)
        let currentTime = Date.now();
        pausedTimers.forEach(timer => {
            try {
                let elapsedTime = currentTime - timer.timestamp;
                let remainingDelay = Math.max(0, timer.delay - elapsedTime);
                let actualId = originalSetTimeout.call(window, function(...args) {
                    activeTimers.delete(timer.id);
                    allRunningTimers.delete(actualId);
                    updateStatus();
                    return timer.callback.apply(this, args);
                }, remainingDelay, ...timer.args);
                activeTimers.set(timer.id, actualId);
                allRunningTimers.add(actualId);
                console.log('[Odds Pauser] Resumed timeout:', remainingDelay + 'ms remaining');
            } catch (e) {
                console.log('[Odds Pauser] Error resuming timeout:', e);
            }
        });
        pausedTimers = [];
        
        // Force the page to restart its timer-based functionality
        try {
            // Trigger a custom event that pages can listen for
            window.dispatchEvent(new CustomEvent('oddsTimersResumed'));
            
            // Try to trigger common refresh patterns
            if (typeof window.startOddsUpdates === 'function') {
                window.startOddsUpdates();
            }
            
            // Trigger any data refresh functions if they exist
            if (typeof window.refreshData === 'function') {
                window.refreshData();
            }
            
        } catch (e) {
            console.log('[Odds Pauser] Error triggering restart functions:', e);
        }
        
        console.log('[Odds Pauser] All timers resumed');
        updateStatus();
    }// Function to get current timer count
    function getTimerCount() {
        // Simplified timer counting to avoid fluctuation
        let counts = {
            active: activeTimers.size + activeIntervals.size,
            paused: pausedTimers.length + pausedIntervals.length,
            total: activeTimers.size + activeIntervals.size + pausedTimers.length + pausedIntervals.length
        };
        
        console.log('[Odds Pauser] Timer counts:', counts);
        return counts;
    }    // Function to update status
    function updateStatus() {
        let timerInfo = getTimerCount();
        
        // Send status to popup with comprehensive error handling
        try {
            if (chrome?.runtime?.sendMessage && !chrome.runtime.lastError) {
                chrome.runtime.sendMessage({
                    action: 'statusUpdate',
                    isPaused: isTimersPaused,
                    timerCount: timerInfo
                }, function(response) {
                    // Suppress connection errors as they're expected when popup is closed
                    if (chrome.runtime.lastError) {
                        // Silently ignore - popup might be closed or extension reloaded
                    }
                });
            }
        } catch (e) {
            // Extension context invalidated - stop trying to communicate
            console.log('[Odds Pauser] Extension context lost, stopping communications');
            
            // Clear any remaining intervals to prevent further errors
            try {
                clearInterval(statusUpdateInterval);
            } catch (clearError) {
                // Ignore
            }
        }
    }    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        try {
            // Check if extension context is still valid
            if (!chrome.runtime || chrome.runtime.lastError) {
                return false;
            }
            
            switch(request.action) {
                case 'pauseTimers':
                    pauseTimers();
                    sendResponse({success: true, isPaused: isTimersPaused});
                    break;
                    
                case 'resumeTimers':
                    resumeTimers();
                    sendResponse({success: true, isPaused: isTimersPaused});
                    break;
                    
                case 'getStatus':
                    let timerInfo = getTimerCount();
                    sendResponse({
                        isPaused: isTimersPaused,
                        timerCount: timerInfo
                    });
                    break;
            }
            return true; // Keep message channel open for async response
        } catch (e) {
            console.log('[Odds Pauser] Extension context invalidated, removing listener');
            // Remove this listener to prevent future errors
            chrome.runtime.onMessage.removeListener(arguments.callee);
            return false;
        }
    });    // Initial status update - wait for page to load some timers
    setTimeout(() => {
        console.log('[Odds Pauser] Initial status update...');
        updateStatus();
    }, 500);
    
    // Store interval ID to allow cleanup on context invalidation
    let statusUpdateInterval = setInterval(() => {
        updateStatus();
    }, 5000); // Changed from 2000 to 5000ms
    
    // Listen for page unload to cleanup
    window.addEventListener('beforeunload', function() {
        try {
            clearInterval(statusUpdateInterval);
        } catch (e) {
            // Ignore cleanup errors
        }
    });
    
    console.log('[Odds Pauser] Content script loaded and ready!');
    
})();
