// ContractScan AI — Content Script
// Detects contract-like text on pages and highlights it

(function () {
  // Don't inject twice
  if (window.__contractscan_injected) return;
  window.__contractscan_injected = true;

  // Keywords that suggest contract text
  const CONTRACT_KEYWORDS = [
    'hereby', 'agreement', 'party', 'parties', 'shall', 'obligation',
    'liability', 'indemnify', 'termination', 'governing law', 'warrant',
    'confidential', 'breach', 'arbitration', 'jurisdiction', 'notwithstanding',
    'force majeure', 'severability', 'entire agreement', 'waiver',
    'intellectual property', 'non-compete', 'non-disclosure',
  ];

  function scoreText(text) {
    const lower = text.toLowerCase();
    let score = 0;
    for (const kw of CONTRACT_KEYWORDS) {
      if (lower.includes(kw)) score++;
    }
    return score;
  }

  // Listen for messages from extension
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'getPageText') {
      sendResponse({ text: document.body.innerText });
    }
    if (msg.type === 'getSelectedText') {
      sendResponse({ text: window.getSelection().toString() });
    }
  });
})();
