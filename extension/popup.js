document.addEventListener('DOMContentLoaded', () => {
  const selectionMode = document.getElementById('selectionMode');
  const autoInject = document.getElementById('autoInject');
  const portalTheme = document.getElementById('portalTheme');
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

  // Pin Visible View
  pinVisibleBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { action: 'pinVisible' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        } else {
          window.close(); // Close popup after action
        }
      });
    }
  });

  // Select Element to Pin
  selectElementBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { action: 'startSelectElement' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        } else {
          window.close();
        }
      });
    }
  });
});
