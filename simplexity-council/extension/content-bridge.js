// Simplexity Theory — Content Script Bridge
// Runs on the Simplexity Theory applet domain to connect page JavaScript with the extension

(function() {
  // Let the web application know the extension is active
  window.postMessage({
    source: 'SIMPLEXITY_EXTENSION_BRIDGE',
    type: 'EXTENSION_DETECTED',
    version: '1.0.0'
  }, '*');

  // Listen for messages from web application
  window.addEventListener('message', (event) => {
    if (event.source !== window || !event.data || event.data.source !== 'SIMPLEXITY_APP') {
      return;
    }

    const { type, payload } = event.data;

    if (type === 'PING_EXTENSION') {
      chrome.runtime.sendMessage({ type: 'GET_TABS_STATUS' }, (res) => {
        if (chrome.runtime.lastError) {
          window.postMessage({
            source: 'SIMPLEXITY_EXTENSION_BRIDGE',
            type: 'PONG_ERROR',
            error: chrome.runtime.lastError.message
          }, '*');
          return;
        }
        window.postMessage({
          source: 'SIMPLEXITY_EXTENSION_BRIDGE',
          type: 'PONG',
          tabsStatus: res ? res.status : {}
        }, '*');
      });
    }

    if (type === 'OPEN_PLATFORM_TAB') {
      chrome.runtime.sendMessage({
        type: 'OPEN_PLATFORM_TAB',
        platformId: payload.platformId
      }, (res) => {
        window.postMessage({
          source: 'SIMPLEXITY_EXTENSION_BRIDGE',
          type: 'TAB_OPENED',
          result: res
        }, '*');
      });
    }

    if (type === 'DISPATCH_SOVEREIGN_TURN') {
      chrome.runtime.sendMessage({
        type: 'DISPATCH_TO_PLATFORM',
        platformId: payload.platformId,
        prompt: payload.prompt,
        autoSubmit: payload.autoSubmit !== false,
        turnId: payload.turnId
      }, (res) => {
        window.postMessage({
          source: 'SIMPLEXITY_EXTENSION_BRIDGE',
          type: 'DISPATCH_ACK',
          result: res
        }, '*');
      });
    }
  });

  // Listen for relayed messages from background (chunks, completed turns)
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'SOVEREIGN_CHUNK' || message.type === 'SOVEREIGN_COMPLETE' || message.type === 'SOVEREIGN_ERROR') {
      window.postMessage({
        source: 'SIMPLEXITY_EXTENSION_BRIDGE',
        type: message.type,
        payload: message
      }, '*');
    }
  });
})();
