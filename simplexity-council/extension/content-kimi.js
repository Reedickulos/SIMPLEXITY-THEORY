// Content script for Kimi (https://kimi.moonshot.cn)

(function() {
  console.log('[Simplexity Bridge] Kimi sovereign listener ready');

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'INJECT_AND_EXECUTE' && request.platformId === 'kimi') {
      handleKimiTurn(request.prompt, request.autoSubmit, request.turnId);
      sendResponse({ status: 'started' });
    }
  });

  async function handleKimiTurn(prompt, autoSubmit, turnId) {
    try {
      const input = document.querySelector('div[contenteditable="true"]') ||
                    document.querySelector('textarea') ||
                    document.querySelector('.editor');
      if (!input) {
        throw new Error('Kimi prompt box not found.');
      }

      input.focus();
      document.execCommand('selectAll', false, null);
      document.execCommand('insertText', false, prompt);
      input.dispatchEvent(new Event('input', { bubbles: true }));

      await new Promise(r => setTimeout(r, 400));

      if (autoSubmit) {
        const sendBtn = document.querySelector('button[aria-label*="发送"]') ||
                        document.querySelector('button.send-btn') ||
                        document.querySelector('button[type="submit"]');
        if (sendBtn && !sendBtn.disabled) {
          sendBtn.click();
        } else {
          input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
        }
      }

      monitorResponse(turnId);
    } catch (err) {
      chrome.runtime.sendMessage({
        type: 'SOVEREIGN_ERROR',
        platformId: 'kimi',
        turnId,
        error: err.message
      });
    }
  }

  function monitorResponse(turnId) {
    let lastText = '';
    let settledCount = 0;
    const checkInterval = setInterval(() => {
      const responses = document.querySelectorAll('.chat-message-response, .markdown');
      const lastResp = responses[responses.length - 1];
      if (!lastResp) return;

      const currentText = lastResp.innerText.trim();
      if (currentText && currentText !== lastText) {
        lastText = currentText;
        settledCount = 0;
        chrome.runtime.sendMessage({
          type: 'SOVEREIGN_CHUNK',
          platformId: 'kimi',
          turnId,
          text: currentText
        });
      } else if (currentText && currentText === lastText) {
        settledCount++;
        const stopBtn = document.querySelector('button[aria-label*="停止"], .stop-btn');
        if (!stopBtn && settledCount >= 3) {
          clearInterval(checkInterval);
          chrome.runtime.sendMessage({
            type: 'SOVEREIGN_COMPLETE',
            platformId: 'kimi',
            turnId,
            finalText: currentText
          });
        }
      }
    }, 800);
  }
})();
