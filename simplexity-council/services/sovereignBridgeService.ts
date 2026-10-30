import JSZip from 'jszip';

export interface SovereignPlatformStatus {
  id: string;
  name: string;
  url: string;
  tier: string;
  isOpen: boolean;
  color: string;
}

export const SOVEREIGN_PLATFORMS: SovereignPlatformStatus[] = [
  { id: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com/', tier: 'Plus / Pro', isOpen: false, color: '#10a37f' },
  { id: 'claude', name: 'Claude', url: 'https://claude.ai/', tier: 'Pro / Team', isOpen: false, color: '#d97706' },
  { id: 'grok', name: 'Grok', url: 'https://grok.com/', tier: 'SuperGrok', isOpen: false, color: '#00f3ff' },
  { id: 'gemini', name: 'Gemini', url: 'https://gemini.google.com/', tier: 'Advanced', isOpen: false, color: '#3b82f6' },
  { id: 'deepseek', name: 'DeepSeek', url: 'https://chat.deepseek.com/', tier: 'V3 / R1', isOpen: false, color: '#4f46e5' },
  { id: 'kimi', name: 'Kimi', url: 'https://kimi.moonshot.cn/', tier: 'K1.5 Pro', isOpen: false, color: '#a855f7' }
];

class SovereignBridgeService {
  private isConnected = false;
  private tabStatuses: Record<string, boolean> = {};
  private listeners: Array<(connected: boolean, statuses: Record<string, boolean>) => void> = [];
  private chunkListeners: Array<(platformId: string, text: string) => void> = [];
  private completeListeners: Array<(platformId: string, finalText: string) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initListeners();
      this.ping();
      setInterval(() => this.ping(), 3000);
    }
  }

  private initListeners() {
    window.addEventListener('message', (event) => {
      if (!event.data || event.data.source !== 'SIMPLEXITY_EXTENSION_BRIDGE') return;

      if (event.data.type === 'EXTENSION_DETECTED' || event.data.type === 'PONG') {
        this.isConnected = true;
        if (event.data.tabsStatus) {
          this.tabStatuses = event.data.tabsStatus;
        }
        this.notifyListeners();
      }

      if (event.data.type === 'SOVEREIGN_CHUNK' && event.data.payload) {
        const { platformId, text } = event.data.payload;
        this.chunkListeners.forEach(fn => fn(platformId, text));
      }

      if (event.data.type === 'SOVEREIGN_COMPLETE' && event.data.payload) {
        const { platformId, finalText } = event.data.payload;
        this.completeListeners.forEach(fn => fn(platformId, finalText));
      }
    });
  }

  public ping() {
    if (typeof window === 'undefined') return;
    window.postMessage({
      source: 'SIMPLEXITY_APP',
      type: 'PING_EXTENSION'
    }, '*');
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }

  public getTabStatuses(): Record<string, boolean> {
    return this.tabStatuses;
  }

  public subscribe(fn: (connected: boolean, statuses: Record<string, boolean>) => void) {
    this.listeners.push(fn);
    fn(this.isConnected, this.tabStatuses);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  public onChunk(fn: (platformId: string, text: string) => void) {
    this.chunkListeners.push(fn);
    return () => {
      this.chunkListeners = this.chunkListeners.filter(l => l !== fn);
    };
  }

  public onComplete(fn: (platformId: string, finalText: string) => void) {
    this.completeListeners.push(fn);
    return () => {
      this.completeListeners = this.completeListeners.filter(l => l !== fn);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(fn => fn(this.isConnected, this.tabStatuses));
  }

  // Open single tab
  public openPlatformTab(platformId: string) {
    const plat = SOVEREIGN_PLATFORMS.find(p => p.id === platformId);
    if (!plat) return;

    if (this.isConnected) {
      window.postMessage({
        source: 'SIMPLEXITY_APP',
        type: 'OPEN_PLATFORM_TAB',
        payload: { platformId }
      }, '*');
    } else {
      window.open(plat.url, '_blank');
    }
  }

  // Launch the conjoined browser window with all 6 sovereign platforms + NotebookLM
  public launchConjoinedWindow() {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    if (this.isConnected) {
      window.postMessage({
        source: 'SIMPLEXITY_APP',
        type: 'DISPATCH_SOVEREIGN_TURN',
        payload: {
          action: 'LAUNCH_CONJOINED_WINDOW',
          appUrl: currentUrl
        }
      }, '*');
    } else {
      // Fallback: Open all platforms sequentially
      SOVEREIGN_PLATFORMS.forEach(p => {
        window.open(p.url, '_blank');
      });
      window.open('https://notebooklm.google.com/', '_blank');
    }
  }

  // Dispatch turn prompt to sovereign tab
  public dispatchTurnToPlatform(platformId: string, prompt: string, autoSubmit = true, turnId = Date.now().toString()) {
    if (this.isConnected) {
      window.postMessage({
        source: 'SIMPLEXITY_APP',
        type: 'DISPATCH_SOVEREIGN_TURN',
        payload: {
          platformId,
          prompt,
          autoSubmit,
          turnId
        }
      }, '*');
      return true;
    }
    return false;
  }

  // Generate and download the complete ready-to-load browser extension .zip
  public async downloadExtensionZip() {
    const zip = new JSZip();

    // Extension manifest
    const manifest = {
      manifest_version: 3,
      name: "Simplexity Theory — Sovereign AI Council Bridge",
      version: "1.0.0",
      description: "Zero-API-cost conjoined workspace & sovereign bridge connecting Simplexity Theory with ChatGPT, Claude, Grok, Gemini, DeepSeek, and Kimi.",
      permissions: ["tabs", "scripting", "storage", "tabGroups", "sidePanel", "declarativeNetRequest"],
      host_permissions: [
        "https://chatgpt.com/*",
        "https://claude.ai/*",
        "https://x.com/*",
        "https://grok.com/*",
        "https://gemini.google.com/*",
        "https://chat.deepseek.com/*",
        "https://kimi.moonshot.cn/*",
        "https://notebooklm.google.com/*",
        "https://*.run.app/*",
        "http://localhost/*",
        "http://localhost:*/*"
      ],
      background: { service_worker: "background.js" },
      action: { default_popup: "popup.html", default_title: "Simplexity Theory Sovereign Bridge" },
      side_panel: { default_path: "sidepanel.html" },
      declarative_net_request: {
        rule_resources: [{ id: "ruleset_1", enabled: true, path: "rules.json" }]
      },
      content_scripts: [
        {
          matches: ["https://*.run.app/*", "http://localhost/*", "http://localhost:*/*"],
          js: ["content-bridge.js"],
          run_at: "document_end"
        },
        { matches: ["https://chatgpt.com/*"], js: ["content-chatgpt.js"], run_at: "document_end" },
        { matches: ["https://claude.ai/*"], js: ["content-claude.js"], run_at: "document_end" },
        { matches: ["https://x.com/*", "https://grok.com/*"], js: ["content-grok.js"], run_at: "document_end" },
        { matches: ["https://gemini.google.com/*"], js: ["content-gemini.js"], run_at: "document_end" },
        { matches: ["https://chat.deepseek.com/*"], js: ["content-deepseek.js"], run_at: "document_end" },
        { matches: ["https://kimi.moonshot.cn/*"], js: ["content-kimi.js"], run_at: "document_end" }
      ]
    };

    zip.file("manifest.json", JSON.stringify(manifest, null, 2));

    // Rules for declarativeNetRequest
    const rules = [
      {
        id: 1,
        priority: 1,
        action: {
          type: "modifyHeaders",
          responseHeaders: [
            { header: "x-frame-options", operation: "remove" },
            { header: "content-security-policy", operation: "remove" }
          ]
        },
        condition: {
          urlFilter: "*",
          initiatorDomains: ["localhost", "run.app"],
          resourceTypes: ["sub_frame"]
        }
      }
    ];
    zip.file("rules.json", JSON.stringify(rules, null, 2));

    // background.js
    const bgJs = `
const PLATFORM_URLS = {
  chatgpt: 'https://chatgpt.com/',
  claude: 'https://claude.ai/',
  grok: 'https://grok.com/',
  gemini: 'https://gemini.google.com/',
  deepseek: 'https://chat.deepseek.com/',
  kimi: 'https://kimi.moonshot.cn/',
  notebooklm: 'https://notebooklm.google.com/'
};

const PLATFORM_MATCHERS = {
  chatgpt: url => url && url.includes('chatgpt.com'),
  claude: url => url && url.includes('claude.ai'),
  grok: url => url && (url.includes('grok.com') || (url.includes('x.com') && url.includes('grok'))),
  gemini: url => url && url.includes('gemini.google.com'),
  deepseek: url => url && url.includes('chat.deepseek.com'),
  kimi: url => url && url.includes('kimi.moonshot.cn'),
  notebooklm: url => url && url.includes('notebooklm.google.com')
};

if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
}

async function findPlatformTab(platformId) {
  const matcher = PLATFORM_MATCHERS[platformId];
  if (!matcher) return null;
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (tab.url && matcher(tab.url)) return tab;
  }
  return null;
}

async function getSovereignTabsStatus() {
  const tabs = await chrome.tabs.query({});
  const status = { chatgpt: false, claude: false, grok: false, gemini: false, deepseek: false, kimi: false, notebooklm: false };
  for (const tab of tabs) {
    if (!tab.url) continue;
    for (const [id, matcher] of Object.entries(PLATFORM_MATCHERS)) {
      if (matcher(tab.url)) status[id] = true;
    }
  }
  return status;
}

async function broadcastToAppTabs(message) {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (tab.url && (tab.url.includes('run.app') || tab.url.includes('localhost'))) {
      try { chrome.tabs.sendMessage(tab.id, message).catch(() => {}); } catch (e) {}
    }
  }
}

async function launchConjoinedWindow(appUrl) {
  const urls = [
    appUrl || 'https://ais-dev-spflrvi65qt72mjztsxbwd-26305069216.us-west1.run.app',
    PLATFORM_URLS.chatgpt,
    PLATFORM_URLS.claude,
    PLATFORM_URLS.grok,
    PLATFORM_URLS.gemini,
    PLATFORM_URLS.deepseek,
    PLATFORM_URLS.kimi,
    PLATFORM_URLS.notebooklm
  ];
  const win = await chrome.windows.create({ url: urls, focused: true, state: 'maximized' });
  if (chrome.tabs && chrome.tabs.group && win.tabs && win.tabs.length > 0) {
    try {
      const tabIds = win.tabs.map(t => t.id).filter(Boolean);
      const gid = await chrome.tabs.group({ tabIds });
      await chrome.tabGroups.update(gid, { title: 'SIMPLEXITY COUNCIL', color: 'cyan' });
    } catch (e) {}
  }
  return win;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_TABS_STATUS') {
    getSovereignTabsStatus().then(status => sendResponse({ status }));
    return true;
  }
  if (request.type === 'LAUNCH_CONJOINED_WINDOW') {
    launchConjoinedWindow(request.appUrl).then(win => sendResponse({ success: true, windowId: win.id })).catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }
  if (request.type === 'OPEN_PLATFORM_TAB') {
    const url = PLATFORM_URLS[request.platformId];
    if (url) chrome.tabs.create({ url, active: true }).then(t => sendResponse({ success: true, tabId: t.id }));
    else sendResponse({ success: false });
    return true;
  }
  if (request.type === 'DISPATCH_TO_PLATFORM') {
    const { platformId, prompt, autoSubmit = true, turnId } = request;
    findPlatformTab(platformId).then(tab => {
      if (!tab) {
        sendResponse({ success: false, error: 'No open tab for ' + platformId });
        return;
      }
      chrome.tabs.sendMessage(tab.id, { type: 'INJECT_AND_EXECUTE', platformId, prompt, autoSubmit, turnId })
        .then(res => sendResponse({ success: true }))
        .catch(err => sendResponse({ success: false, error: err.message }));
    });
    return true;
  }
  if (request.type === 'SOVEREIGN_CHUNK' || request.type === 'SOVEREIGN_COMPLETE' || request.type === 'SOVEREIGN_ERROR') {
    broadcastToAppTabs(request);
    sendResponse({ received: true });
    return true;
  }
});
`;
    zip.file("background.js", bgJs.trim());

    // content-bridge.js
    const contentBridgeJs = `
(function() {
  window.postMessage({ source: 'SIMPLEXITY_EXTENSION_BRIDGE', type: 'EXTENSION_DETECTED', version: '1.0.0' }, '*');
  window.addEventListener('message', (event) => {
    if (event.source !== window || !event.data || event.data.source !== 'SIMPLEXITY_APP') return;
    const { type, payload } = event.data;
    if (type === 'PING_EXTENSION') {
      chrome.runtime.sendMessage({ type: 'GET_TABS_STATUS' }, (res) => {
        window.postMessage({ source: 'SIMPLEXITY_EXTENSION_BRIDGE', type: 'PONG', tabsStatus: res ? res.status : {} }, '*');
      });
    }
    if (type === 'OPEN_PLATFORM_TAB') {
      chrome.runtime.sendMessage({ type: 'OPEN_PLATFORM_TAB', platformId: payload.platformId });
    }
    if (type === 'DISPATCH_SOVEREIGN_TURN') {
      if (payload.action === 'LAUNCH_CONJOINED_WINDOW') {
        chrome.runtime.sendMessage({ type: 'LAUNCH_CONJOINED_WINDOW', appUrl: payload.appUrl });
      } else {
        chrome.runtime.sendMessage({
          type: 'DISPATCH_TO_PLATFORM',
          platformId: payload.platformId,
          prompt: payload.prompt,
          autoSubmit: payload.autoSubmit !== false,
          turnId: payload.turnId
        });
      }
    }
  });
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'SOVEREIGN_CHUNK' || message.type === 'SOVEREIGN_COMPLETE' || message.type === 'SOVEREIGN_ERROR') {
      window.postMessage({ source: 'SIMPLEXITY_EXTENSION_BRIDGE', type: message.type, payload: message }, '*');
    }
  });
})();
`;
    zip.file("content-bridge.js", contentBridgeJs.trim());

    // Inject scripts for sovereign platforms
    const chatGptScript = `
(function() {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'INJECT_AND_EXECUTE' && request.platformId === 'chatgpt') {
      const input = document.querySelector('#prompt-textarea') || document.querySelector('div[contenteditable="true"]');
      if (input) {
        input.focus();
        if (input.tagName.toLowerCase() === 'textarea') { input.value = request.prompt; input.dispatchEvent(new Event('input', { bubbles: true })); }
        else { input.innerText = request.prompt; input.dispatchEvent(new Event('input', { bubbles: true })); }
        setTimeout(() => {
          if (request.autoSubmit) {
            const btn = document.querySelector('button[data-testid="send-button"]') || document.querySelector('button[aria-label*="Send"]');
            if (btn && !btn.disabled) btn.click();
            else input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
          }
        }, 400);
      }
      sendResponse({ status: 'injected' });
    }
  });
})();
`;
    zip.file("content-chatgpt.js", chatGptScript.trim());

    const claudeScript = `
(function() {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'INJECT_AND_EXECUTE' && request.platformId === 'claude') {
      const input = document.querySelector('div[contenteditable="true"]');
      if (input) {
        input.focus();
        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, request.prompt);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        setTimeout(() => {
          if (request.autoSubmit) {
            const btn = document.querySelector('button[aria-label*="Send"]');
            if (btn && !btn.disabled) btn.click();
            else input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
          }
        }, 400);
      }
      sendResponse({ status: 'injected' });
    }
  });
})();
`;
    zip.file("content-claude.js", claudeScript.trim());

    const grokScript = `
(function() {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'INJECT_AND_EXECUTE' && request.platformId === 'grok') {
      const input = document.querySelector('textarea') || document.querySelector('div[contenteditable="true"]');
      if (input) {
        input.focus();
        if (input.tagName.toLowerCase() === 'textarea') { input.value = request.prompt; input.dispatchEvent(new Event('input', { bubbles: true })); }
        else { document.execCommand('insertText', false, request.prompt); }
        setTimeout(() => {
          if (request.autoSubmit) {
            const btn = document.querySelector('button[type="submit"]') || document.querySelector('button[aria-label*="Grok"]');
            if (btn) btn.click();
          }
        }, 400);
      }
      sendResponse({ status: 'injected' });
    }
  });
})();
`;
    zip.file("content-grok.js", grokScript.trim());

    const geminiScript = `
(function() {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'INJECT_AND_EXECUTE' && request.platformId === 'gemini') {
      const input = document.querySelector('rich-textarea div[contenteditable="true"]') || document.querySelector('div[contenteditable="true"]');
      if (input) {
        input.focus();
        document.execCommand('insertText', false, request.prompt);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        setTimeout(() => {
          if (request.autoSubmit) {
            const btn = document.querySelector('button[aria-label*="Send"]');
            if (btn && !btn.disabled) btn.click();
          }
        }, 400);
      }
      sendResponse({ status: 'injected' });
    }
  });
})();
`;
    zip.file("content-gemini.js", geminiScript.trim());

    const deepseekScript = `
(function() {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'INJECT_AND_EXECUTE' && request.platformId === 'deepseek') {
      const input = document.querySelector('#chat-input') || document.querySelector('textarea');
      if (input) {
        input.focus();
        input.value = request.prompt;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        setTimeout(() => {
          if (request.autoSubmit) {
            const btn = document.querySelector('.ds-icon-button') || document.querySelector('button[type="submit"]');
            if (btn) btn.click();
          }
        }, 400);
      }
      sendResponse({ status: 'injected' });
    }
  });
})();
`;
    zip.file("content-deepseek.js", deepseekScript.trim());

    const kimiScript = `
(function() {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'INJECT_AND_EXECUTE' && request.platformId === 'kimi') {
      const input = document.querySelector('div[contenteditable="true"]') || document.querySelector('textarea');
      if (input) {
        input.focus();
        document.execCommand('insertText', false, request.prompt);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        setTimeout(() => {
          if (request.autoSubmit) {
            const btn = document.querySelector('button[aria-label*="发送"]') || document.querySelector('button.send-btn');
            if (btn && !btn.disabled) btn.click();
          }
        }, 400);
      }
      sendResponse({ status: 'injected' });
    }
  });
})();
`;
    zip.file("content-kimi.js", kimiScript.trim());

    // popup.html, popup.js, sidepanel.html
    const popupHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Simplexity Bridge</title><style>body{width:320px;padding:16px;background:#04060a;color:#f1f5f9;font-family:sans-serif;font-size:13px;}.btn{display:block;width:100%;padding:10px;margin-bottom:8px;background:rgba(230,200,117,0.15);border:1px solid #e6c875;color:#e6c875;border-radius:6px;cursor:pointer;font-weight:600;}.btn-cyan{background:rgba(0,243,255,0.15);border-color:#00f3ff;color:#00f3ff;}</style></head><body><div style="font-weight:bold;color:#e6c875;margin-bottom:12px;">SIMPLEXITY SOVEREIGN BRIDGE</div><button class="btn btn-cyan" id="lBtn">🚀 Launch Conjoined Window</button><button class="btn" id="cBtn">🏛️ Open Cockpit</button><script src="popup.js"></script></body></html>`;
    const popupJs = `document.getElementById('lBtn').onclick=()=>{chrome.runtime.sendMessage({type:'LAUNCH_CONJOINED_WINDOW'});window.close();};document.getElementById('cBtn').onclick=()=>{chrome.tabs.create({url:'https://ais-dev-spflrvi65qt72mjztsxbwd-26305069216.us-west1.run.app'});window.close();};`;
    const sidepanelHtml = `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#04060a;"><iframe src="https://ais-dev-spflrvi65qt72mjztsxbwd-26305069216.us-west1.run.app" style="width:100vw;height:100vh;border:none;"></iframe></body></html>`;

    zip.file("popup.html", popupHtml);
    zip.file("popup.js", popupJs);
    zip.file("sidepanel.html", sidepanelHtml);

    // README instructions
    const readme = `========================================================================
SIMPLEXITY THEORY — SOVEREIGN AI COUNCIL CHROME EXTENSION
========================================================================

HOW TO INSTALL IN 3 STEPS:

1. Unzip this folder to a known location on your computer.
2. In Google Chrome, Brave, or Edge:
   - Navigate to: chrome://extensions
   - Toggle "Developer mode" ON (in the upper-right corner)
   - Click "Load unpacked" (top-left)
   - Select the unzipped folder containing manifest.json
3. Click "Launch Conjoined Window" in the Simplexity Cockpit, or open:
   - ChatGPT (chatgpt.com)
   - Claude (claude.ai)
   - Grok (grok.com)
   - Gemini (gemini.google.com)
   - DeepSeek (chat.deepseek.com)
   - Kimi (kimi.moonshot.cn)
   - NotebookLM (notebooklm.google.com)

The bridge automatically detects each active tab and allows you to dispatch
deliberation rounds directly to your sovereign Pro accounts with zero API fees!
========================================================================`;
    zip.file("README.txt", readme);

    // Generate blob and trigger download
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'simplexity-sovereign-bridge-v1.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const sovereignBridge = new SovereignBridgeService();
