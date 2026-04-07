/* RefPip Background Script */

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "pinSelection",
      title: "Pin Selection to RefPip",
      contexts: ["selection"]
    });
    chrome.contextMenus.create({
      id: "pinVisible",
      title: "Pin Current View (Mirror)",
      contexts: ["page"]
    });
    chrome.contextMenus.create({
      id: "selectElement",
      title: "Select Element to Pin",
      contexts: ["page"]
    });
  });
});

async function ensureContentScript(tabId) {
  try {
    // Try to send a ping message to see if content script is already there
    await chrome.tabs.sendMessage(tabId, { action: "ping" });
  } catch (e) {
    // If it fails, inject the script and styles
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

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab) return;
  
  await ensureContentScript(tab.id);
  
  if (info.menuItemId === "pinSelection") {
    chrome.tabs.sendMessage(tab.id, { action: "pinSelection" });
  } else if (info.menuItemId === "pinVisible") {
    chrome.tabs.sendMessage(tab.id, { action: "pinVisible" });
  } else if (info.menuItemId === "selectElement") {
    chrome.tabs.sendMessage(tab.id, { action: "startSelectElement" });
  }
});
