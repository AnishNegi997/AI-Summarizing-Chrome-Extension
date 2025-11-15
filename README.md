# AI Summary for Articles - Chrome Extension

A powerful Chrome extension that uses Google's Gemini AI to generate intelligent summaries of webpage content. Perfect for quickly understanding long articles, blog posts, and web pages.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)

## ✨ Features

- **Smart Content Extraction**: Automatically extracts article text from webpages using intelligent content detection
- **Multiple Summary Types**:
  - **Brief Summary**: Quick 2-3 sentence overview
  - **Detailed Summary**: Comprehensive coverage of all main points
  - **Bullet Points**: 5-7 key points formatted as a list
- **AI-Powered**: Uses Google's Gemini AI for high-quality, context-aware summaries
- **One-Click Copy**: Easily copy summaries to your clipboard
- **Auto-Model Detection**: Automatically finds and uses available Gemini models
- **Works on Most Websites**: Compatible with articles, blogs, news sites, and more
- **Secure**: API key is stored locally in Chrome's secure storage

## 📋 Prerequisites

- Google Chrome browser (latest version recommended)
- A Google Gemini API key (free to get from [Google AI Studio](https://makersuite.google.com/app/apikey))

## 🚀 Installation

### Step 1: Get Your API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key" or use an existing key
4. Copy your API key (you'll need it in Step 3)

**Important**: Make sure the Gemini API is enabled in your Google Cloud Console:
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Navigate to "APIs & Services" → "Library"
- Search for "Generative Language API"
- Click "Enable" if not already enabled

### Step 2: Download the Extension

1. Download or clone this repository
2. Extract the files to a folder on your computer

### Step 3: Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top-right corner)
3. Click "Load unpacked"
4. Select the folder containing the extension files
5. The extension should now appear in your extensions list

### Step 4: Configure Your API Key

1. Right-click on the extension icon in Chrome's toolbar
2. Select "Options" (or go to `chrome://extensions/` → find the extension → click "Options")
3. Paste your Gemini API key in the input field
4. Click "Save Settings"
5. The options page will close automatically

## 📖 How to Use

1. **Navigate to a webpage** with article or content you want to summarize
2. **Click the extension icon** in Chrome's toolbar
3. **Select your preferred summary type**:
   - Brief Summary (2-3 sentences)
   - Detailed Summary (comprehensive)
   - Bullet Points (5-7 key points)
4. **Click "Summarize This Page"**
5. Wait a few seconds for the AI to generate your summary
6. **Copy the summary** using the "Copy Summary" button if needed

### Tips for Best Results

- Works best on pages with article-style content (news articles, blog posts, documentation)
- Make sure the page has fully loaded before clicking "Summarize"
- For very long articles, the extension automatically truncates content to fit API limits
- The extension works on most websites, but may not work on:
  - Chrome internal pages (`chrome://` URLs)
  - Extension pages
  - Pages with very strict security policies

## 🔧 Troubleshooting

### Extension Not Working?

**Issue**: "API key not found" error
- **Solution**: Make sure you've configured your API key in the extension options

**Issue**: "Could not communicate with content script"
- **Solution**: 
  - Refresh the webpage and try again
  - Make sure you're not on a `chrome://` or extension page
  - Try reloading the extension in `chrome://extensions/`

**Issue**: "Could not extract article text from this page"
- **Solution**: 
  - The page may not have standard article structure
  - Try waiting for the page to fully load
  - Some pages with dynamic content may not work

**Issue**: API errors (404, 403, etc.)
- **Solution**: 
  - Verify your API key is correct and active
  - Check that Gemini API is enabled in Google Cloud Console
  - Ensure your API key doesn't have restrictions that block the extension
  - Check the browser console (F12) for detailed error messages

**Issue**: All models returning errors
- **Solution**: 
  - Open Developer Tools (F12) → Console tab
  - Check which models were tried and their specific errors
  - Verify your API key has proper permissions
  - Make sure Gemini API is enabled for your Google Cloud project

### Still Having Issues?

1. Check the browser console for detailed error messages (Press F12 → Console tab)
2. Verify your API key at [Google AI Studio](https://makersuite.google.com/app/apikey)
3. Try reloading the extension:
   - Go to `chrome://extensions/`
   - Find the extension
   - Click the reload icon

## 🛠️ Technical Details

- **Manifest Version**: 3
- **Permissions Required**:
  - `scripting`: To inject content scripts
  - `activeTab`: To access the current tab's content
  - `storage`: To securely store your API key
  - `host_permissions`: To communicate with Gemini API
- **Content Scripts**: Automatically injected on all webpages
- **API**: Uses Google's Generative Language API (Gemini)
- **Models**: Automatically detects and uses available Gemini models (gemini-1.5-flash, gemini-1.5-pro, gemini-pro, etc.)

## 📁 Project Structure

```
AI Summarizer ChromeExtension/
├── manifest.json       # Extension configuration
├── popup.html         # Extension popup UI
├── popup.js           # Main popup logic and API calls
├── content.js         # Content script for text extraction
├── background.js        # Background service worker
├── options.html       # Options page UI
├── options.js         # Options page logic
├── config.js          # Configuration file
├── icon.png           # Extension icon
└── README.md          # This file
```

## 🔒 Privacy & Security

- Your API key is stored locally in Chrome's secure sync storage
- Content is extracted from webpages locally before being sent to the Gemini API
- No data is collected or stored by the extension itself
- All communication with Google's API is done securely over HTTPS
- The extension only accesses the current active tab when you click the summarize button

## ⚠️ API Usage & Limits

- Google Gemini API has rate limits based on your API key's quota
- Free tier has usage limits (check Google's current pricing)
- Very long articles are automatically truncated to fit API limits (~20,000 characters)
- The extension will show error messages if you hit rate limits

## 🤝 Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## 📝 License

This project is open source and available for personal and commercial use.

---

**Note**: This extension requires an active internet connection and a valid Google Gemini API key to function.


