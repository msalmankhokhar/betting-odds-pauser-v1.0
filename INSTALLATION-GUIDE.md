# 🎯 **Cricket Betting Odds Pauser - Installation Guide**

## 📦 **Method 1: Direct ZIP Installation (Recommended)**

### **For End Users / Clients:**

#### **Step 1: Download Extension**
- Download the `betting-odds-pauser-v1.0.zip` file
- **Do NOT extract/unzip** the file yet

#### **Step 2: Chrome Extensions Page**
1. Open **Google Chrome**
2. Type in address bar: `chrome://extensions/`
3. Press **Enter**

#### **Step 3: Enable Developer Mode**
1. Look for **"Developer mode"** toggle (top-right corner)
2. **Turn it ON** (should turn blue)

#### **Step 4: Extract ZIP File**
1. **Right-click** on `betting-odds-pauser-v1.0.zip`
2. Select **"Extract All"** or **"Extract Here"**
3. A folder named `betting-odds-pauser-v1.0` will be created

#### **Step 5: Load Extension**
1. Back to Chrome extensions page
2. Click **"Load unpacked"** button (top-left)
3. Browse and **select the extracted folder** (not the ZIP file)
4. Click **"Select Folder"**

#### **Step 6: Verify Installation**
✅ Extension appears in the list  
✅ Extension icon shows in Chrome toolbar  
✅ Status shows **"Enabled"**  

---

## 🧪 **Testing the Extension**

### **Quick Test with Demo Page:**
1. Open the included `test-page.html` file in Chrome
2. You'll see a cricket betting page with live updating odds
3. Click the **extension icon** in toolbar
4. Click **"Pause Odds"** - odds will freeze
5. Click **"Resume Odds"** - odds will start updating again

### **Real Website Usage:**
1. Go to any cricket betting website
2. Navigate to live odds page
3. Click extension icon
4. Use Pause/Resume buttons as needed

---

## 📁 **Package Contents**

```
betting-odds-pauser-v1.0/
├── manifest.json       # Extension configuration
├── popup.html          # Extension interface
├── popup.js           # UI controls
├── content.js         # Main functionality
├── background.js      # Background service
├── icons/             # Extension icons
│   └── icon.svg
└── README.md          # Documentation
```

---

## 🔧 **Troubleshooting**

### **Extension Not Loading?**
- ✅ Make sure you selected the **folder**, not the ZIP file
- ✅ Developer mode is **enabled**
- ✅ All files are in the same folder

### **Not Working on Website?**
- ✅ Refresh the betting page after installing
- ✅ Check if website uses different update methods
- ✅ Look for console errors (F12 → Console)

### **Extension Icon Missing?**
- ✅ Click the puzzle piece icon in Chrome toolbar
- ✅ Pin the extension for easy access

---

## 📱 **Browser Compatibility**

| Browser | Status | Notes |
|---------|--------|-------|
| ✅ Google Chrome | Full Support | Recommended |
| ✅ Microsoft Edge | Full Support | Chromium-based |
| ❌ Mozilla Firefox | Not Compatible | Different extension system |
| ❌ Safari | Not Compatible | Different extension system |

---

## 🔒 **Security & Privacy**

- ✅ **No data collection** - works offline
- ✅ **No external connections** - purely local
- ✅ **Open source** - all code visible
- ✅ **No permissions abuse** - only timer control

---

## 📞 **Support**

If you face any issues:
1. Check browser console for errors (F12)
2. Verify extension is enabled in chrome://extensions/
3. Test with the demo page first
4. Contact developer with specific error details

---

**Version:** 1.0  
**Compatible with:** Chrome 88+ and Edge 88+  
**Created for:** Ali Murtaza  
**Date:** July 2025
