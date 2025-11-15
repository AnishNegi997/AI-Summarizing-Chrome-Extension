// Background service worker for the extension
chrome.runtime.onInstalled.addListener((details) => {
  // This will prompt the user to enter their API key on first install
  if (details.reason === "install" || details.reason === "update") {
    chrome.storage.sync.get(["geminiApiKey"], (result) => {
      if (!result.geminiApiKey) {
        chrome.runtime.openOptionsPage();
      }
    });
  }
});
