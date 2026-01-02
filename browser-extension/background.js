/**
 * TrustVault SafePay - Background Service Worker
 * Handles extension lifecycle and background tasks
 */

// Initialize on install
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[TrustVault] Extension installed');
    // Set default values
    chrome.storage.sync.set({
      'trustvault-safepay-enabled': true
    });
  } else if (details.reason === 'update') {
    console.log('[TrustVault] Extension updated');
  }
});

// Listen for tab updates and notify content script
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Page fully loaded, content script should have analyzed it
    console.log(`[TrustVault] Tab ${tabId} loaded: ${tab.url}`);
  }
});

// Handle messages from content scripts and popups
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateAnalysis') {
    // Analysis from content script - store for popup to retrieve
    chrome.storage.session.set({
      [`analysis-${sender.tab.id}`]: request.analysis
    });
  } else if (request.action === 'getAnalysis') {
    // Popup requesting latest analysis
    chrome.storage.session.get([`analysis-${sender.tab.id}`], (result) => {
      sendResponse({
        analysis: result[`analysis-${sender.tab.id}`] || null
      });
    });
    return true; // Will respond asynchronously
  }
});

// Clean up storage when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.session.remove([`analysis-${tabId}`]);
});
