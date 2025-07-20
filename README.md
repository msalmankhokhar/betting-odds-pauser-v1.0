# Betting Odds Pauser Chrome Extension

## Overview
A Chrome extension specifically designed to pause and resume real-time odds updates on cricket betting websites. This extension intercepts and controls JavaScript timer functions that are responsible for automatically refreshing betting odds.

## Features

### ⏸️ **Pause Odds Updates**
- Immediately stops all automatic odds refreshing
- Blocks `setInterval()` and `setTimeout()` functions
- Maintains current odds display frozen in time

### ▶️ **Resume Odds Updates**  
- Restores normal odds updating behavior
- Resumes all paused timer functions
- Calculates elapsed time for accurate resumption

### 📊 **Real-time Monitoring**
- Shows count of active timers on the page
- Displays current pause/resume status
- Updates badge icon to reflect current state

### 🎯 **Smart Detection**
- Automatically identifies betting odds update mechanisms
- Works with HLS.js and other streaming libraries
- Compatible with various betting website architectures

## Installation

1. Download or clone this extension
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension icon will appear in your Chrome toolbar

## Usage

1. **Navigate to a cricket betting website**
2. **Open the betting odds page** (cricket match with live odds)
3. **Click the extension icon** in the toolbar
4. **Click "Pause Odds"** to freeze all odds updates
5. **Click "Resume Odds"** to restore normal updating

## Technical Details

### How It Works
The extension overrides JavaScript's native timer functions:

```javascript
// Intercepts setInterval calls
window.setInterval = function(callback, delay, ...args) {
    if (isTimersPaused) {
        // Store timer info but don't execute
        pausedIntervals.push({callback, delay, args});
        return timerId;
    }
    return originalSetInterval.call(window, callback, delay, ...args);
};
```

### Supported Timer Functions
- `setInterval()` - Periodic odds updates
- `setTimeout()` - Delayed updates  
- `clearInterval()` - Timer cleanup
- `clearTimeout()` - Timer cleanup

### Target Mechanisms
- HLS.js live streaming updates
- AJAX polling for odds data
- WebSocket reconnection timers
- Auto-refresh mechanisms

## Browser Compatibility
- ✅ Chrome (Manifest V3)
- ✅ Edge (Chromium-based)
- ❌ Firefox (requires Manifest V2 conversion)
- ❌ Safari (different extension system)

## File Structure
```
ali-murtaza-extension/
├── manifest.json          # Extension configuration
├── popup.html             # Extension UI interface  
├── popup.js               # UI logic and controls
├── content.js             # Main timer control script
├── background.js          # Background service worker
├── icons/                 # Extension icons
└── README.md             # This documentation
```

## Permissions Required
- `activeTab` - Access current tab content
- `storage` - Save extension settings
- `scripting` - Inject control scripts

## Development Notes

### Key Functions in content.js
- `pauseTimers()` - Stops all active timers
- `resumeTimers()` - Restarts paused timers  
- `getTimerCount()` - Returns timer statistics
- `updateStatus()` - Syncs with popup UI

### Message Communication
```javascript
// Popup → Content Script
chrome.tabs.sendMessage(tabId, {action: 'pauseTimers'});

// Content Script → Popup  
chrome.runtime.sendMessage({action: 'statusUpdate'});
```

## Troubleshooting

### Extension Not Working?
1. **Refresh the betting page** after installing
2. **Check developer console** for error messages
3. **Verify website compatibility** - some sites may use different update mechanisms
4. **Try different betting sections** - odds pages vs general pages

### Common Issues
- **"Not connected to page"** - Content script failed to inject
- **Timers still updating** - Website uses WebSockets or server-sent events
- **Extension icon not showing** - Installation incomplete

## Security & Privacy
- ✅ No data collection or transmission
- ✅ Works entirely locally in browser
- ✅ No external server communication
- ✅ Only affects timer functions, not betting logic

## Legal Disclaimer
This extension is for educational and testing purposes only. Users are responsible for compliance with:
- Website terms of service
- Local gambling regulations  
- Applicable laws and restrictions

## Version History
- **v1.0** - Initial release with pause/resume functionality
- Timer interception and control
- Real-time status monitoring
- Chrome Manifest V3 compliance

## Support
For issues or feature requests, please check:
1. Browser developer console for errors
2. Extension popup for connection status
3. Website compatibility with timer interception

---

**Created for Ali Murtaza** - Cricket betting odds control extension
