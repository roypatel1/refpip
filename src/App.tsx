import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Pin, 
  Move, 
  Maximize2, 
  Download, 
  Github, 
  Chrome, 
  CheckCircle2, 
  Layers, 
  Layout,
  ExternalLink,
  Info
} from 'lucide-react';
import JSZip from 'jszip';
import { cn } from './lib/utils';

export default function App() {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadExtension = async () => {
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      
      const manifest = `{
  "manifest_version": 3,
  "name": "RefPip",
  "version": "1.0",
  "description": "RefPip (Reference Picture-in-Picture) - Pin AI chat blocks and web content into draggable, floating portals.",
  "permissions": ["activeTab", "scripting", "storage"],
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "css": ["styles.css"]
    }
  ],
  "action": {
    "default_popup": "popup.html"
  },
  "icons": {
    "16": "icon16.png",
    "48": "icon48.png",
    "128": "icon128.png"
  }
}`;

      const styles = `.ref-portal-container {
  position: fixed;
  top: 50px;
  left: 50px;
  width: 350px;
  height: 400px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 2147483647;
  resize: both;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  transition: box-shadow 0.2s ease;
}
.ref-portal-container:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
.ref-portal-header {
  padding: 8px 12px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;
  flex-shrink: 0;
}
.ref-portal-header:active {
  cursor: grabbing;
}
.ref-portal-title {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ref-portal-controls {
  display: flex;
  gap: 8px;
}
.ref-portal-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #9ca3af;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s;
}
.ref-portal-btn:hover {
  background: #f3f4f6;
  color: #4b5563;
}
.ref-portal-btn.close:hover {
  background: #fee2e2;
  color: #dc2626;
}
.ref-portal-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  font-size: 14px;
  line-height: 1.6;
  color: #1f2937;
  background: #fff;
}
.ref-portal-container.dark-mode .ref-portal-body {
  background: #1a1a1a;
  color: #e5e7eb;
}
.ref-portal-container.dark-mode .ref-portal-header {
  background: #2d2d2d;
  border-bottom-color: #404040;
}
.ref-portal-container.dark-mode .ref-portal-title {
  color: #f3f4f6;
}
.ref-portal-body pre {
  background: #f3f4f6;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 12px 0;
}
.ref-portal-body code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.9em;
  background: #f3f4f6;
  padding: 2px 4px;
  border-radius: 4px;
}
.ai-ref-pin-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: #ffffff;
  border: 2px solid #4f46e5;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #4f46e5;
  cursor: pointer;
  margin: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 100;
}
.ai-ref-pin-btn:hover {
  background: #4f46e5;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
}
.ai-ref-pin-btn svg {
  width: 14px;
  height: 14px;
}
.ai-ref-pin-btn.selection-float {
  position: absolute;
  z-index: 2147483647;
  border-color: #4f46e5;
  background: #4f46e5;
  color: white;
}
.ai-ref-pin-btn.selection-float:hover {
  background: #4338ca;
}`;

      const contentJs = `/* RefPip v1.0 
 * Created by RefPip Team 
 * License: MIT 
 * Repository: https://github.com/refpip/refpip
 */

(function() {
  const PIN_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>';
  const SELECTORS = {
    'aistudio.google.com': { 
      message: '.model-response-text, .user-query-text, ms-message-content, [role="article"]',
      container: '.message-content, [role="presentation"]'
    },
    'gemini.google.com': { 
      message: 'message-content, .query-text, .message-content-inner, .model-response-content',
      container: '.message-content-inner, .chat-content'
    },
    'chatgpt.com': { 
      message: '.markdown, .prose, [data-message-author-role], article',
      container: '.flex-col.gap-1, .w-full.text-token-text-primary'
    }
  };
  let settings = { selectionMode: false, autoInject: true, portalTheme: 'light' };
  chrome.storage.sync.get(['selectionMode', 'autoInject', 'portalTheme'], (result) => {
    settings.selectionMode = result.selectionMode || false;
    settings.autoInject = result.autoInject !== false;
    settings.portalTheme = result.portalTheme || 'light';
    injectPinButtons();
  });
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.selectionMode) settings.selectionMode = changes.selectionMode.newValue;
    if (changes.autoInject) settings.autoInject = changes.autoInject.newValue;
    if (changes.portalTheme) {
      settings.portalTheme = changes.portalTheme.newValue;
      document.querySelectorAll('.ref-portal-container').forEach(p => {
        if (settings.portalTheme === 'dark') p.classList.add('dark-mode');
        else p.classList.remove('dark-mode');
      });
    }
    if (!settings.autoInject) {
      document.querySelectorAll('.ai-ref-pin-btn').forEach(b => b.remove());
      document.querySelectorAll('[data-ref-portal-injected]').forEach(el => delete el.dataset.refPortalInjected);
    } else injectPinButtons();
  });
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'pinVisible') {
      createPortalFromVisible();
      sendResponse({ status: 'ok' });
    } else if (request.action === 'startSelectElement') {
      startElementSelection();
      sendResponse({ status: 'ok' });
    }
  });
  function createPortalFromVisible() {
    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.overflow = 'hidden';
    const clone = document.body.cloneNode(true);
    clone.querySelectorAll('.ref-portal-container, .ai-ref-pin-btn, .refpip-selection-overlay').forEach(el => el.remove());
    clone.style.position = 'absolute';
    clone.style.top = '-' + window.scrollY + 'px';
    clone.style.left = '-' + window.scrollX + 'px';
    clone.style.width = document.documentElement.scrollWidth + 'px';
    clone.style.height = document.documentElement.scrollHeight + 'px';
    clone.style.pointerEvents = 'none';
    container.appendChild(clone);
    createPortal(container, "Screen Mirror");
  }
  function startElementSelection() {
    if (document.querySelector('.refpip-selection-overlay')) return;
    const overlay = document.createElement('div');
    overlay.className = 'refpip-selection-overlay';
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(79, 70, 229, 0.1); z-index: 2147483647; cursor: crosshair; pointer-events: auto;';
    const highlight = document.createElement('div');
    highlight.style.cssText = 'position: absolute; border: 2px solid #4f46e5; background: rgba(79, 70, 229, 0.2); pointer-events: none; transition: all 0.1s ease; display: none;';
    overlay.appendChild(highlight);
    document.body.appendChild(overlay);
    let lastTarget = null;
    const onMouseMove = (e) => {
      overlay.style.pointerEvents = 'none';
      const target = document.elementFromPoint(e.clientX, e.clientY);
      overlay.style.pointerEvents = 'auto';
      if (target && target !== overlay && target !== highlight && !target.closest('.ref-portal-container')) {
        lastTarget = target;
        const rect = target.getBoundingClientRect();
        highlight.style.display = 'block';
        highlight.style.top = rect.top + 'px';
        highlight.style.left = rect.left + 'px';
        highlight.style.width = rect.width + 'px';
        highlight.style.height = rect.height + 'px';
      }
    };
    const onClick = (e) => {
      e.preventDefault(); e.stopPropagation();
      if (lastTarget) createPortal(lastTarget, "Element Snippet");
      cleanup();
    };
    const onKeyDown = (e) => { if (e.key === 'Escape') cleanup(); };
    const cleanup = () => {
      document.removeEventListener('mousemove', onMouseMove);
      overlay.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKeyDown);
      overlay.remove();
    };
    document.addEventListener('mousemove', onMouseMove);
    overlay.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeyDown);
  }
  function getSiteConfig() {
    const host = window.location.hostname;
    for (const key in SELECTORS) if (host.includes(key)) return SELECTORS[key];
    return null;
  }
  function injectPinButtons() {
    if (!settings.autoInject) return;
    const config = getSiteConfig();
    if (!config) return;
    document.querySelectorAll(config.message).forEach(msg => {
      if (msg.dataset.refPortalInjected || msg.closest('.ref-portal-container')) return;
      msg.dataset.refPortalInjected = 'true';
      const btn = document.createElement('button');
      btn.className = 'ai-ref-pin-btn';
      btn.innerHTML = PIN_ICON + ' <span>Pin to Portal</span>';
      btn.onclick = (e) => { e.stopPropagation(); createPortal(msg); };
      if (msg.firstChild) msg.insertBefore(btn, msg.firstChild); else msg.appendChild(btn);
    });
  }
  let selectionBtn = null;
  document.addEventListener('mouseup', (e) => {
    if (!settings.selectionMode) return;
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text.length > 0) {
      if (!selectionBtn) {
        selectionBtn = document.createElement('button');
        selectionBtn.className = 'ai-ref-pin-btn selection-float';
        selectionBtn.innerHTML = PIN_ICON + ' <span>Pin Selection</span>';
        document.body.appendChild(selectionBtn);
      }
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      selectionBtn.style.top = (window.scrollY + rect.top - 40) + 'px';
      selectionBtn.style.left = (window.scrollX + rect.left) + 'px';
      selectionBtn.style.display = 'flex';
      selectionBtn.onclick = (e) => {
        e.stopPropagation();
        const div = document.createElement('div');
        div.textContent = text;
        div.style.whiteSpace = 'pre-wrap';
        createPortal(div, "Selection");
        selection.removeAllRanges();
        selectionBtn.style.display = 'none';
      };
    } else if (selectionBtn) selectionBtn.style.display = 'none';
  });
  function createPortal(sourceNode, customTitle = null) {
    const portal = document.createElement('div');
    portal.className = 'ref-portal-container';
    if (settings.portalTheme === 'dark') portal.classList.add('dark-mode');
    const header = document.createElement('div');
    header.className = 'ref-portal-header';
    const title = document.createElement('div');
    title.className = 'ref-portal-title';
    title.textContent = 'RefPip: ' + (customTitle || (sourceNode.innerText ? sourceNode.innerText.substring(0, 30) + '...' : 'Pinned Content'));
    const closeBtn = document.createElement('button');
    closeBtn.className = 'ref-portal-btn close';
    closeBtn.innerHTML = '✕';
    closeBtn.onclick = () => portal.remove();
    header.appendChild(title);
    header.appendChild(closeBtn);
    const body = document.createElement('div');
    body.className = 'ref-portal-body';
    const clone = sourceNode.cloneNode(true);
    const nestedBtn = clone.querySelector('.ai-ref-pin-btn');
    if (nestedBtn) nestedBtn.remove();
    body.appendChild(clone);
    portal.appendChild(header);
    portal.appendChild(body);
    document.body.appendChild(portal);
    makeDraggable(portal, header);
  }
  function makeDraggable(element, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    handle.onmousedown = dragMouseDown;
    function dragMouseDown(e) {
      e = e || window.event;
      if (e.target.closest('.ref-portal-btn')) return;
      e.preventDefault();
      pos3 = e.clientX; pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
      const allPortals = document.querySelectorAll('.ref-portal-container');
      allPortals.forEach(p => p.style.zIndex = '2147483646');
      element.style.zIndex = '2147483647';
    }
    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY;
      pos3 = e.clientX; pos4 = e.clientY;
      element.style.top = (element.offsetTop - pos2) + "px";
      element.style.left = (element.offsetLeft - pos1) + "px";
    }
    function closeDragElement() {
      document.onmouseup = null; document.onmousemove = null;
    }
  }
  setInterval(injectPinButtons, 2000);
  injectPinButtons();
})();`;

      const popupHtml = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { width: 250px; padding: 16px; font-family: sans-serif; }
    h1 { font-size: 16px; margin-top: 0; }
    .settings { margin-top: 16px; display: flex; flex-direction: column; gap: 12px; }
    .setting-item { display: flex; align-items: center; justify-content: space-between; font-size: 13px; }
    .switch { position: relative; display: inline-block; width: 34px; height: 20px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 20px; }
    .slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
    input:checked + .slider { background-color: #4f46e5; }
    input:checked + .slider:before { transform: translateX(14px); }
  </style>
</head>
<body>
  <h1>RefPip</h1>
  <div class="settings">
    <div class="setting-item">
      <span>Enable Selection Mode</span>
      <label class="switch"><input type="checkbox" id="selectionMode"><span class="slider"></span></label>
    </div>
    <div class="setting-item">
      <span>Auto-inject Pin Buttons</span>
      <label class="switch"><input type="checkbox" id="autoInject" checked><span class="slider"></span></label>
    </div>
    <div class="setting-item">
      <span>Portal Theme</span>
      <select id="portalTheme" style="font-size: 12px; padding: 2px 4px; border-radius: 4px; border: 1px solid #d1d5db;">
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 12px;">
      <button id="pinVisibleBtn" style="padding: 10px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s;">
        Pin Current View (Mirror)
      </button>
      <button id="selectElementBtn" style="padding: 10px; background: #ffffff; color: #4f46e5; border: 2px solid #4f46e5; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
        Select Element to Pin
      </button>
    </div>
  </div>
  <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280; display: flex; justify-content: space-between;">
    <a href="https://github.com/refpip/refpip" target="_blank" style="color: #4f46e5; text-decoration: none;">GitHub</a>
    <a href="https://refpip.io/#contact" target="_blank" style="color: #4f46e5; text-decoration: none;">Feedback</a>
    <a href="https://refpip.io/privacy" target="_blank" style="color: #4f46e5; text-decoration: none;">Privacy</a>
  </div>
  <script src="popup.js"></script>
</body>
</html>`;

      const popupJs = `document.addEventListener('DOMContentLoaded', () => {
  const selectionMode = document.getElementById('selectionMode');
  const autoInject = document.getElementById('autoInject');
  const portalTheme = document.getElementById('portalTheme');
  const pinVisibleBtn = document.getElementById('pinVisibleBtn');
  const selectElementBtn = document.getElementById('selectElementBtn');
  chrome.storage.sync.get(['selectionMode', 'autoInject', 'portalTheme'], (result) => {
    selectionMode.checked = result.selectionMode || false;
    autoInject.checked = result.autoInject !== false;
    portalTheme.value = result.portalTheme || 'light';
  });
  selectionMode.addEventListener('change', () => chrome.storage.sync.set({ selectionMode: selectionMode.checked }));
  autoInject.addEventListener('change', () => chrome.storage.sync.set({ autoInject: autoInject.checked }));
  portalTheme.addEventListener('change', () => chrome.storage.sync.set({ portalTheme: portalTheme.value }));
  pinVisibleBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { action: 'pinVisible' }, (response) => {
        if (chrome.runtime.lastError) console.error(chrome.runtime.lastError);
        else window.close();
      });
    }
  });
  selectElementBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { action: 'startSelectElement' }, (response) => {
        if (chrome.runtime.lastError) console.error(chrome.runtime.lastError);
        else window.close();
      });
    }
  });
});`;

      const createIcon = (size: number) => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return '';
        ctx.fillStyle = '#4f46e5';
        ctx.beginPath();
        const r = size * 0.2;
        ctx.moveTo(r, 0);
        ctx.lineTo(size - r, 0);
        ctx.quadraticCurveTo(size, 0, size, r);
        ctx.lineTo(size, size - r);
        ctx.quadraticCurveTo(size, size, size - r, size);
        ctx.lineTo(r, size);
        ctx.quadraticCurveTo(0, size, 0, size - r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = `bold ${Math.floor(size * 0.6)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('R', size / 2, size / 2);
        return canvas.toDataURL('image/png').split(',')[1];
      };

      const license = `MIT License

Copyright (c) 2026 RefPip

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

      const privacy = `# RefPip Privacy Policy
RefPip does not collect, store, or transmit any of your personal data. All processing happens locally on your machine. We use chrome.storage.sync only for your preferences.`;

      const readme = `# RefPip - Reference Picture-in-Picture
Pin AI chat blocks and web content into draggable, floating portals.
Visit https://refpip.io for more info.`;

      zip.file("manifest.json", manifest);
      zip.file("styles.css", styles);
      zip.file("content.js", contentJs);
      zip.file("popup.html", popupHtml);
      zip.file("popup.js", popupJs);
      zip.file("icon16.png", createIcon(16), { base64: true });
      zip.file("icon48.png", createIcon(48), { base64: true });
      zip.file("icon128.png", createIcon(128), { base64: true });
      zip.file("LICENSE", license);
      zip.file("PRIVACY.md", privacy);
      zip.file("README.md", readme);
      
      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = "refpip-extension.zip";
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
              <Pin className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">RefPip</span>
          </div>
            <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600">Features</a>
            <a href="#roadmap" className="text-sm font-medium text-slate-600 hover:text-indigo-600">Roadmap</a>
            <a href="#contact" className="text-sm font-medium text-slate-600 hover:text-indigo-600">Contact</a>
            <a href="#privacy" className="text-sm font-medium text-slate-600 hover:text-indigo-600">Privacy</a>
            <a href="#install" className="text-sm font-medium text-slate-600 hover:text-indigo-600">Installation</a>
            <a href="https://github.com" className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-indigo-600">
              <Github className="h-4 w-4" />
              GitHub
            </a>
            <button 
              onClick={downloadExtension}
              disabled={isDownloading}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-95 disabled:opacity-50"
            >
              {isDownloading ? 'Preparing...' : 'Download Extension'}
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 pt-20 pb-32 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                  <Chrome className="h-4 w-4" />
                  <span>Chrome Extension MVP</span>
                </div>
                <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
                  RefPip: <br />
                  <span className="text-indigo-600">Reference PiP.</span>
                </h1>
                <p className="mt-6 text-lg leading-8 text-slate-600">
                  Pin AI chat blocks and any web content into draggable, resizable, and scrollable floating portals. The ultimate Picture-in-Picture for your productivity.
                </p>
                <div className="mt-10 flex flex-wrap gap-4">
                  <button 
                    onClick={downloadExtension}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300 active:scale-95"
                  >
                    Get the Extension
                    <Download className="h-5 w-5" />
                  </button>
                  <a 
                    href="#install"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-4 text-lg font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
                  >
                    How to Install
                  </a>
                </div>
                <div className="mt-8 flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Works on AI Studio
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Gemini
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ChatGPT
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="relative rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-slate-200">
                  <img 
                    src="https://picsum.photos/seed/ai-portal/1200/800" 
                    alt="App Preview" 
                    className="rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                  {/* Floating Portal Mockup */}
                  <motion.div 
                    drag
                    dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
                    className="absolute top-1/4 -right-8 w-64 rounded-xl border border-slate-200 bg-white p-0 shadow-2xl md:-right-12"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2 rounded-t-xl cursor-move">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pinned Reference</span>
                      <div className="flex gap-1">
                        <div className="h-2 w-2 rounded-full bg-slate-300" />
                        <div className="h-2 w-2 rounded-full bg-slate-300" />
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="h-2 w-3/4 rounded bg-slate-100" />
                      <div className="mt-2 h-2 w-full rounded bg-slate-100" />
                      <div className="mt-2 h-2 w-5/6 rounded bg-slate-100" />
                      <div className="mt-4 h-16 w-full rounded bg-indigo-50 border border-indigo-100" />
                    </div>
                  </motion.div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-6 -left-6 -z-10 h-24 w-24 rounded-full bg-indigo-100 blur-2xl" />
                <div className="absolute -bottom-10 -right-10 -z-10 h-40 w-40 rounded-full bg-blue-100 blur-3xl" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-base font-semibold leading-7 text-indigo-600 tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Everything you need for long-thread navigation.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {[
                  {
                    name: 'One-Click Pinning',
                    description: 'Every AI response gets a "Pin" button. Click it to create a floating portal instantly.',
                    icon: Pin,
                  },
                  {
                    name: 'Draggable & Resizable',
                    description: 'Move portals anywhere on your screen. Resize them to fit your workflow.',
                    icon: Move,
                  },
                  {
                    name: 'Independent Scrolling',
                    description: 'Portals scroll independently of the main chat, allowing you to keep key data in view.',
                    icon: Layout,
                  },
                  {
                    name: 'Multiple Portals',
                    description: 'Open as many portals as you need. Perfect for comparing different parts of a long thread.',
                    icon: Layers,
                  },
                  {
                    name: 'Markdown Support',
                    description: 'Maintains formatting, code blocks, and lists from the original AI response.',
                    icon: Maximize2,
                  },
                  {
                    name: 'Zero Config',
                    description: 'Works out of the box on AI Studio, Gemini, and ChatGPT. No setup required.',
                    icon: CheckCircle2,
                  },
                ].map((feature) => (
                  <div key={feature.name} className="flex flex-col">
                    <dt className="flex items-center gap-x-3 text-lg font-bold leading-7 text-slate-900">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
                        <feature.icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      {feature.name}
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                      <p className="flex-auto">{feature.description}</p>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* Roadmap Section */}
        <section id="roadmap" className="bg-slate-50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-base font-semibold leading-7 text-indigo-600 tracking-wide uppercase">Roadmap</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                The future of RefPip.
              </p>
              <p className="mt-4 text-lg text-slate-600">
                We're building the ultimate cross-platform reference tool.
              </p>
            </div>
            
            <div className="mx-auto mt-16 max-w-4xl">
              <div className="space-y-12">
                {[
                  {
                    phase: 'Phase 1: Extension Excellence',
                    status: 'Current',
                    items: [
                      { title: 'MVP Release', done: true },
                      { title: 'Selection Mode Pinning', done: true },
                      { title: 'Screen Mirroring Snapshot', done: true },
                      { title: 'Cloud Sync & Persistence', done: false },
                    ]
                  },
                  {
                    phase: 'Phase 2: Browser Expansion',
                    status: 'Q3 2026',
                    items: [
                      { title: 'Firefox & Safari Support', done: false },
                      { title: 'Edge Sidebar Optimization', done: false },
                      { title: 'Mobile Companion App', done: false },
                    ]
                  },
                  {
                    phase: 'Phase 3: Desktop Native',
                    status: 'Q4 2026',
                    items: [
                      { title: 'Standalone Desktop App', done: false },
                      { title: 'System-Wide OCR Pinning', done: false },
                      { title: 'Always-on-Top Global Overlays', done: false },
                    ]
                  },
                  {
                    phase: 'Phase 4: AI Intelligence',
                    status: '2027',
                    items: [
                      { title: 'Smart Summarization (Gemini)', done: false },
                      { title: 'Contextual Linking', done: false },
                      { title: 'Voice Interaction', done: false },
                    ]
                  }
                ].map((phase, idx) => (
                  <div key={idx} className="relative pl-8 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-px before:bg-slate-200 last:before:hidden">
                    <div className="absolute left-[-4px] top-2 h-2 w-2 rounded-full bg-indigo-600" />
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-bold text-slate-900">{phase.phase}</h3>
                      <span className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        phase.status === 'Current' ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                      )}>
                        {phase.status}
                      </span>
                    </div>
                    <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                      {phase.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-600">
                          {item.done ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-slate-200 flex-shrink-0" />
                          )}
                          <span className={item.done ? "line-through opacity-60" : ""}>{item.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Us Section */}
        <section id="contact" className="bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-base font-semibold leading-7 text-indigo-600 tracking-wide uppercase">Contact Us</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Get in touch.
              </p>
              <p className="mt-4 text-lg text-slate-600">
                Have questions or feedback? We'd love to hear from you.
              </p>
            </div>
            
            <div className="mx-auto mt-16 max-w-xl">
              <form name="contact" method="POST" data-netlify="true" className="grid grid-cols-1 gap-y-6">
                <input type="hidden" name="form-name" value="contact" />
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold leading-6 text-slate-900">Name</label>
                  <div className="mt-2.5">
                    <input type="text" name="name" id="name" autoComplete="name" required className="block w-full rounded-md border-0 px-3.5 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold leading-6 text-slate-900">Email</label>
                  <div className="mt-2.5">
                    <input type="email" name="email" id="email" autoComplete="email" required className="block w-full rounded-md border-0 px-3.5 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold leading-6 text-slate-900">Message</label>
                  <div className="mt-2.5">
                    <textarea name="message" id="message" rows={4} required className="block w-full rounded-md border-0 px-3.5 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" defaultValue={""} />
                  </div>
                </div>
                <div>
                  <button type="submit" className="block w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Privacy Section */}
        <section id="privacy" className="bg-slate-50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-base font-semibold leading-7 text-indigo-600 tracking-wide uppercase">Privacy First</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Your data stays with you.
              </p>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                RefPip was built with a privacy-first mindset. We don't have servers, we don't track your chats, and we don't sell your data. Everything happens locally in your browser.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <h3 className="font-bold text-slate-900">No Data Collection</h3>
                  <p className="mt-2 text-sm text-slate-500">We never see your chat content or browsing history.</p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <h3 className="font-bold text-slate-900">Local Processing</h3>
                  <p className="mt-2 text-sm text-slate-500">Portals are created and managed entirely on your machine.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Installation Section */}
        <section id="install" className="bg-slate-900 py-24 text-white sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How to Install</h2>
                <p className="mt-6 text-lg text-slate-300">
                  Since we are in early MVP, you can install the extension manually in Developer Mode.
                </p>
                
                <div className="mt-10 space-y-8">
                  {[
                    {
                      step: '1',
                      title: 'Download the Zip',
                      desc: 'Click the download button to get the extension source code.'
                    },
                    {
                      step: '2',
                      title: 'Unzip the Files',
                      desc: 'Extract the downloaded zip file to a folder on your computer.'
                    },
                    {
                      step: '3',
                      title: 'Open Chrome Extensions',
                      desc: 'Go to chrome://extensions in your browser.'
                    },
                    {
                      step: '4',
                      title: 'Enable Developer Mode',
                      desc: 'Toggle the "Developer mode" switch in the top right corner.'
                    },
                    {
                      step: '5',
                      title: 'Load Unpacked',
                      desc: 'Click "Load unpacked" and select the folder where you extracted the files.'
                    }
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold">
                        {item.step}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{item.title}</h3>
                        <p className="text-slate-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-center rounded-3xl bg-slate-800 p-8 ring-1 ring-slate-700">
                <div className="mb-6 flex items-center gap-3">
                  <Info className="h-6 w-6 text-indigo-400" />
                  <h3 className="text-xl font-bold">Developer Note</h3>
                </div>
                <p className="text-slate-300">
                  This extension is open source and built for the 24-hour sprint. It injects a small script into AI chat pages to enable the portal functionality.
                </p>
                <div className="mt-8 rounded-xl bg-slate-900 p-4 font-mono text-sm text-indigo-300">
                  <div className="flex justify-between">
                    <span>manifest_version</span>
                    <span className="text-slate-500">3</span>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <span>permissions</span>
                    <span className="text-slate-500">["activeTab", "scripting"]</span>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <span>version</span>
                    <span className="text-slate-500">"1.0.0"</span>
                  </div>
                </div>
                <button 
                  onClick={downloadExtension}
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-4 font-bold text-slate-900 transition-all hover:bg-slate-100 active:scale-95"
                >
                  Download Source Now
                  <Download className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <Pin className="h-5 w-5 text-indigo-600" />
              <span className="font-bold text-slate-900">RefPip</span>
            </div>
            <p className="text-sm text-slate-500">
              &copy; 2026 RefPip. Open source under MIT License.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-slate-400 hover:text-slate-600">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-600">
                <Chrome className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
