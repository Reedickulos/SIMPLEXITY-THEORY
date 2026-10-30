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