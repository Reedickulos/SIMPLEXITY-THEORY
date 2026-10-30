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