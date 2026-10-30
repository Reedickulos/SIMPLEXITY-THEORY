// Content script for DeepSeek (https://chat.deepseek.com)

(function() {
  console.log('[Simplexity Bridge] DeepSeek sovereign listener ready');

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'INJECT_AND_EXECUTE' && request.platformId === 'deepseek') {
      handleDeepSeekTurn(request.prompt, request.autoSubmit, request.turnId);
      sendResponse({ status: 'started' });
    }
  });

  async function handleDeepSeekTurn(prompt, autoSubmit, turnId) {
    try {
      const input = document.querySelector('#chat-input') ||
                    document.querySelector('textarea') ||
                    document.querySelector('div[contenteditable="true"]');
      if (!input) {
        throw new Error('DeepSeek chat input not found.');
      }

      input.focus();
      if (input.tagName.toLowerCase() === 'textarea') {
        input.value = prompt;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, prompt);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }

      await new Promise(r => setTimeout(r, 400));

      if (autoSubmit) {
        const sendBtn = document.querySelector('div[role="button"][aria-disabled="false"]') ||
                        document.querySelector('button[type="submit"]') ||
                        document.querySelector('.ds-icon-button');
        if (sendBtn) {
          sendBtn.click();
        } else {
          input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
        }
      }

      monitorResponse(turnId);
    } catch (err) {
      chrome.runtime.sendMessage({
        type: 'SOVEREIGN_ERROR',
        platformId: 'deepseek',
        turnId,
        error: err.message
      });
    }
  }

  function monitorResponse(turnId) {
    let lastText = '';
    let settledCount = 0;
    const checkInterval = setInterval(() => {
      const responses = document.querySelectorAll('.ds-markdown, .chat-message-assistant');
      const lastResp = responses[responses.length - 1];
      if (!lastResp) return;

      const currentText = lastResp.innerText.trim();
      if (currentText && currentText !== lastText) {
        lastText = currentText;
        settledCount = 0;
        chrome.runtime.sendMessage({
          type: 'SOVEREIGN_CHUNK',
          platformId: 'deepseek',
          turnId,
          text: currentText
        });
      } else if (currentText && currentText === lastText) {
        settledCount++;
        const stopBtn = document.querySelector('.ds-stop-button, button[aria-label*="Stop"]');
        if (!stopBtn && settledCount >= 3) {
          clearInterval(checkInterval);
          chrome.runtime.sendMessage({
            type: 'SOVEREIGN_COMPLETE',
            platformId: 'deepseek',
            turnId,
            finalText: currentText
          });
        }
      }
    }, 800);
  }
})();
