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