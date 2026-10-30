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