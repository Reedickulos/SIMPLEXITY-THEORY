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