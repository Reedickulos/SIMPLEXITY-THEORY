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