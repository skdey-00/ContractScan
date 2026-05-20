// ContractScan AI — Background Service Worker
// Handles context menu and side panel logic

const API_URL = 'https://contractscan-eight.vercel.app/api/analyze';

chrome.runtime.onInstalled.addListener(() => {
  // Create right-click context menu
  chrome.contextMenus.create({
    id: 'contractscan-analyze',
    title: 'Analyze with ContractScan',
    contexts: ['selection'],
  });

  // Open side panel on action click
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'contractscan-analyze' && info.selectionText) {
    const text = info.selectionText.trim();

    if (text.length < 100) {
      // Tell sidepanel text is too short
      chrome.storage.local.set({
        contractscan_state: {
          status: 'error',
          error: 'Selected text is too short. Please select the full contract (at least 100 characters).',
          timestamp: Date.now(),
        },
      });
      chrome.sidePanel.open({ tabId: tab.id });
      return;
    }

    // Store the text and trigger analysis
    chrome.storage.local.set({
      contractscan_state: {
        status: 'loading',
        text: text,
        timestamp: Date.now(),
      },
    });

    // Open side panel
    await chrome.sidePanel.open({ tabId: tab.id });

    // Call the API
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `Analysis failed (${res.status})`);
      }

      const data = await res.json();

      chrome.storage.local.set({
        contractscan_state: {
          status: 'done',
          text: text,
          result: data,
          timestamp: Date.now(),
        },
      });
    } catch (err) {
      chrome.storage.local.set({
        contractscan_state: {
          status: 'error',
          error: err.message,
          timestamp: Date.now(),
        },
      });
    }
  }
});

// Listen for messages from sidepanel (re-analyze, etc.)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'analyze' && msg.text) {
    const text = msg.text.trim();
    if (text.length < 100) {
      sendResponse({ status: 'error', error: 'Text too short.' });
      return true;
    }

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((b) => Promise.reject(new Error(b?.error || `Failed (${r.status})`)));
        return r.json();
      })
      .then((data) => sendResponse({ status: 'done', result: data }))
      .catch((err) => sendResponse({ status: 'error', error: err.message }));

    return true; // keep channel open for async response
  }
});
