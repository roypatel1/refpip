/* RefPip v1.0 
 * Created by RefPip Team 
 * License: MIT 
 * Repository: https://github.com/roypatel1/refpip
 */

(function() {
  const PIN_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>`;
  
  console.log('RefPip active');
  
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

  let settings = {
    selectionMode: false,
    autoInject: true,
    portalTheme: 'light'
  };

  // Load settings
  chrome.storage.sync.get(['selectionMode', 'autoInject', 'portalTheme'], (result) => {
    settings.selectionMode = result.selectionMode || false;
    settings.autoInject = result.autoInject !== false;
    settings.portalTheme = result.portalTheme || 'light';
    injectPinButtons();
  });

  // Listen for setting changes
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
    } else {
      injectPinButtons();
    }
  });

  // Listen for messages from popup
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
    // Create a container that captures what's currently visible
    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.overflow = 'hidden';

    // Clone the body
    const clone = document.body.cloneNode(true);
    clone.querySelectorAll('.ref-portal-container, .ai-ref-pin-btn, .refpip-selection-overlay').forEach(el => el.remove());
    
    // Position the clone to show the current viewport
    clone.style.position = 'absolute';
    clone.style.top = `-${window.scrollY}px`;
    clone.style.left = `-${window.scrollX}px`;
    clone.style.width = document.documentElement.scrollWidth + 'px';
    clone.style.height = document.documentElement.scrollHeight + 'px';
    clone.style.pointerEvents = 'none'; // Prevent interaction inside the mirror
    
    container.appendChild(clone);
    createPortal(container, "Screen Mirror");
  }

  function startElementSelection() {
    if (document.querySelector('.refpip-selection-overlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'refpip-selection-overlay';
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(79, 70, 229, 0.1); z-index: 2147483647;
      cursor: crosshair; pointer-events: auto;
    `;

    const highlight = document.createElement('div');
    highlight.style.cssText = `
      position: absolute; border: 2px solid #4f46e5;
      background: rgba(79, 70, 229, 0.2); pointer-events: none;
      transition: all 0.1s ease; display: none;
    `;
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
      e.preventDefault();
      e.stopPropagation();
      if (lastTarget) {
        createPortal(lastTarget, "Element Snippet");
      }
      cleanup();
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') cleanup();
    };

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
    for (const key in SELECTORS) {
      if (host.includes(key)) return SELECTORS[key];
    }
    return null;
  }

  function injectPinButtons() {
    if (!settings.autoInject) return;
    const config = getSiteConfig();
    if (!config) return;

    const messages = document.querySelectorAll(config.message);
    messages.forEach(msg => {
      if (msg.dataset.refPortalInjected) return;
      
      // Avoid injecting into portals themselves
      if (msg.closest('.ref-portal-container')) return;

      msg.dataset.refPortalInjected = 'true';

      const btn = document.createElement('button');
      btn.className = 'ai-ref-pin-btn';
      btn.innerHTML = `${PIN_ICON} <span>Pin to Portal</span>`;
      btn.onclick = (e) => {
        e.stopPropagation();
        createPortal(msg);
      };

      // Try to find a good place to insert
      if (msg.firstChild) {
        msg.insertBefore(btn, msg.firstChild);
      } else {
        msg.appendChild(btn);
      }
    });
  }

  // Selection Mode Logic
  let selectionBtn = null;

  document.addEventListener('mouseup', (e) => {
    if (!settings.selectionMode) return;
    
    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (text.length > 0) {
      if (!selectionBtn) {
        selectionBtn = document.createElement('button');
        selectionBtn.className = 'ai-ref-pin-btn selection-float';
        selectionBtn.style.position = 'absolute';
        selectionBtn.style.zIndex = '2147483647';
        selectionBtn.innerHTML = `${PIN_ICON} <span>Pin Selection</span>`;
        document.body.appendChild(selectionBtn);
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      selectionBtn.style.top = `${window.scrollY + rect.top - 40}px`;
      selectionBtn.style.left = `${window.scrollX + rect.left}px`;
      selectionBtn.style.display = 'flex';

      selectionBtn.onclick = (e) => {
        e.stopPropagation();
        createPortalFromText(text);
        selection.removeAllRanges();
        selectionBtn.style.display = 'none';
      };
    } else if (selectionBtn) {
      selectionBtn.style.display = 'none';
    }
  });

  function createPortalFromText(text) {
    const div = document.createElement('div');
    div.textContent = text;
    div.style.whiteSpace = 'pre-wrap';
    createPortal(div, "Selection");
  }

  function createPortal(sourceNode, customTitle = null) {
    const portal = document.createElement('div');
    portal.className = 'ref-portal-container';
    if (settings.portalTheme === 'dark') portal.classList.add('dark-mode');
    
    // Header
    const header = document.createElement('div');
    header.className = 'ref-portal-header';
    
    const title = document.createElement('div');
    title.className = 'ref-portal-title';
    const displayTitle = customTitle || (sourceNode.innerText ? sourceNode.innerText.substring(0, 30) + '...' : 'Pinned Content');
    title.textContent = 'AI Reference: ' + displayTitle;
    
    const controls = document.createElement('div');
    controls.className = 'ref-portal-controls';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'ref-portal-btn close';
    closeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    closeBtn.onclick = () => portal.remove();
    
    controls.appendChild(closeBtn);
    header.appendChild(title);
    header.appendChild(controls);
    
    // Body
    const body = document.createElement('div');
    body.className = 'ref-portal-body';
    
    // Clone content and remove our own pin button if it was cloned
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
      // Don't drag if clicking buttons
      if (e.target.closest('.ref-portal-btn')) return;
      
      e.preventDefault();
      // Get the mouse cursor position at startup
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // Call a function whenever the cursor moves
      document.onmousemove = elementDrag;
      
      element.style.zIndex = '2147483647';
      // Bring to front among other portals
      const allPortals = document.querySelectorAll('.ref-portal-container');
      allPortals.forEach(p => p.style.zIndex = '2147483646');
      element.style.zIndex = '2147483647';
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      // Calculate the new cursor position
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // Set the element's new position
      element.style.top = (element.offsetTop - pos2) + "px";
      element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
      // Stop moving when mouse button is released
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  // Observe for new messages
  const observer = new MutationObserver((mutations) => {
    injectPinButtons();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Initial injection
  injectPinButtons();
  
  console.log('RefPip active');
})();
