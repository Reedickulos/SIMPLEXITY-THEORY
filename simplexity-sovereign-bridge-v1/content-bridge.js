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