// Content Script - Injected into web pages to control timers
(function() {
    'use strict';
    
    let isTimersPaused = false;
    let pausedTimers = [];
    let pausedIntervals = [];
    let originalSetTimeout = window.setTimeout;
    let originalSetInterval = window.setInterval;
    let originalClearTimeout = window.clearTimeout;
    let originalClearInterval = window.clearInterval;
    let timerIdCounter = 0;
    
    // Store active timers
    let activeTimers = new Map();
    let activeIntervals = new Map();
    
    // Override setTimeout
    window.setTimeout = function(callback, delay, ...args) {
        timerIdCounter++;
        let timerId = timerIdCounter;
        
        if (isTimersPaused) {
            // Store the timer info but don't execute
            pausedTimers.push({
                id: timerId,
                callback: callback,
                delay: delay,
                args: args,
                timestamp: Date.now()
            });
            console.log('[Odds Pauser] setTimeout blocked:', delay + 'ms');
            return timerId;
        }
        
        let actualId = originalSetTimeout.call(window, callback, delay, ...args);
        activeTimers.set(timerId, actualId);
        return timerId;
    };
    
    // Override setInterval  
    window.setInterval = function(callback, delay, ...args) {
        timerIdCounter++;
        let timerId = timerIdCounter;
        
        if (isTimersPaused) {
            // Store the interval info but don't execute
            pausedIntervals.push({
                id: timerId,
                callback: callback,
                delay: delay,
                args: args,
                timestamp: Date.now()
            });
            console.log('[Odds Pauser] setInterval blocked:', delay + 'ms');
            return timerId;
        }
        
        let actualId = originalSetInterval.call(window, callback, delay, ...args);
        activeIntervals.set(timerId, actualId);
        return timerId;
    };
    
    // Override clearTimeout
    window.clearTimeout = function(timerId) {
        if (activeTimers.has(timerId)) {
            let actualId = activeTimers.get(timerId);
            activeTimers.delete(timerId);
            return originalClearTimeout.call(window, actualId);
        }
        return originalClearTimeout.call(window, timerId);
    };
    
    // Override clearInterval
    window.clearInterval = function(timerId) {
        if (activeIntervals.has(timerId)) {
            let actualId = activeIntervals.get(timerId);
            activeIntervals.delete(timerId);
            return originalClearInterval.call(window, actualId);
        }
        return originalClearInterval.call(window, timerId);
    };
    
    // Function to pause all timers
    function pauseTimers() {
        if (isTimersPaused) return;
        
        isTimersPaused = true;
        
        // Clear all active intervals
        activeIntervals.forEach((actualId, timerId) => {
            originalClearInterval.call(window, actualId);
        });
        
        // Clear all active timeouts
        activeTimers.forEach((actualId, timerId) => {
            originalClearTimeout.call(window, actualId);
        });
        
        console.log('[Odds Pauser] All timers paused');
        updateStatus();
    }
    
    // Function to resume all timers
    function resumeTimers() {
        if (!isTimersPaused) return;
        
        isTimersPaused = false;
        
        // Resume paused intervals
        pausedIntervals.forEach(timer => {
            let actualId = originalSetInterval.call(window, timer.callback, timer.delay, ...timer.args);
            activeIntervals.set(timer.id, actualId);
        });
        pausedIntervals = [];
        
        // Resume paused timeouts (adjust delay for elapsed time)
        let currentTime = Date.now();
        pausedTimers.forEach(timer => {
            let elapsedTime = currentTime - timer.timestamp;
            let remainingDelay = Math.max(0, timer.delay - elapsedTime);
            let actualId = originalSetTimeout.call(window, timer.callback, remainingDelay, ...timer.args);
            activeTimers.set(timer.id, actualId);
        });
        pausedTimers = [];
        
        console.log('[Odds Pauser] All timers resumed');
        updateStatus();
    }
    
    // Function to get current timer count
    function getTimerCount() {
        return {
            active: activeTimers.size + activeIntervals.size,
            paused: pausedTimers.length + pausedIntervals.length,
            total: activeTimers.size + activeIntervals.size + pausedTimers.length + pausedIntervals.length
        };
    }
    
    // Function to update status
    function updateStatus() {
        let timerInfo = getTimerCount();
        
        // Send status to popup
        chrome.runtime.sendMessage({
            action: 'statusUpdate',
            isPaused: isTimersPaused,
            timerCount: timerInfo
        });
    }
    
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
    });
    
    // Initial status update
    setTimeout(() => {
        updateStatus();
    }, 1000);
    
    // Periodic status updates
    setInterval(() => {
        updateStatus();
    }, 5000);
    
    console.log('[Odds Pauser] Content script loaded and ready!');
    
})();
