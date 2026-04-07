document.addEventListener('DOMContentLoaded', () => {
  const selectionMode = document.getElementById('selectionMode');
  const autoInject = document.getElementById('autoInject');
  const portalTheme = document.getElementById('portalTheme');
  const pinSelectionBtn = document.getElementById('pinSelectionBtn');
  const pinVisibleBtn = document.getElementById('pinVisibleBtn');
  const selectElementBtn = document.getElementById('selectElementBtn');

  // Load saved settings
  chrome.storage.sync.get(['selectionMode', 'autoInject', 'portalTheme'], (result) => {
    selectionMode.checked = result.selectionMode || false;
    autoInject.checked = result.autoInject !== false;
    portalTheme.value = result.portalTheme || 'light';
  });

  // Save settings on change
  selectionMode.addEventListener('change', () => {
    chrome.storage.sync.set({ selectionMode: selectionMode.checked });
  });

  autoInject.addEventListener('change', () => {
    chrome.storage.sync.set({ autoInject: autoInject.checked });
  });

  portalTheme.addEventListener('change', () => {
    chrome.storage.sync.set({ portalTheme: portalTheme.value });
  });

  async function ensureContentScript(tabId) {
    try {
      await chrome.tabs.sendMessage(tabId, { action: "ping" });
    } catch (e) {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["content.js"]
      });
      await chrome.scripting.insertCSS({
        target: { tabId: tabId },
        files: ["styles.css"]
      });
    }
  }

  // Pin Selection
  pinSelectionBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      await ensureContentScript(tab.id);
      chrome.tabs.sendMessage(tab.id, { action: 'pinSelection' }, (response) => {
        if (chrome.runtime.lastError) console.error(chrome.runtime.lastError);
        else window.close();
      });
    }
  });

  // Pin Visible View
  pinVisibleBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      await ensureContentScript(tab.id);
      chrome.tabs.sendMessage(tab.id, { action: 'pinVisible' }, (response) => {
        if (chrome.runtime.lastError) console.error(chrome.runtime.lastError);
        else window.close();
      });
    }
  });

  // Select Element to Pin
  selectElementBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      await ensureContentScript(tab.id);
      chrome.tabs.sendMessage(tab.id, { action: 'startSelectElement' }, (response) => {
        if (chrome.runtime.lastError) console.error(chrome.runtime.lastError);
        else window.close();
      });
    }
  });
});
