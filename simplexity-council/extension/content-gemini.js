// Content script for Gemini (https://gemini.google.com)

(function() {
  console.log('[Simplexity Bridge] Gemini sovereign listener ready');

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'INJECT_AND_EXECUTE' && request.platformId === 'gemini') {
      handleGeminiTurn(request.prompt, request.autoSubmit, request.turnId);
      sendResponse({ status: 'started' });
    }
  });

  async function handleGeminiTurn(prompt, autoSubmit, turnId) {
    try {
      const input = document.querySelector('rich-textarea div[contenteditable="true"]') ||
                    document.querySelector('div[contenteditable="true"]');
      if (!input) {
        throw new Error('Gemini prompt box not found.');
      }

      input.focus();
      document.execCommand('selectAll', false, null);
      document.execCommand('insertText', false, prompt);
      input.dispatchEvent(new Event('input', { bubbles: true }));

      await new Promise(r => setTimeout(r, 400));

      if (autoSubmit) {
        const sendBtn = document.querySelector('button[aria-label*="Send message"]') ||
                        document.querySelector('button.send-button');
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
        platformId: 'gemini',
        turnId,
        error: err.message
      });
    }
  }

  function monitorResponse(turnId) {
    let lastText = '';
    let settledCount = 0;
    const checkInterval = setInterval(() => {
      const responses = document.querySelectorAll('message-content, .model-response-text');
      const lastResp = responses[responses.length - 1];
      if (!lastResp) return;

      const currentText = lastResp.innerText.trim();
      if (currentText && currentText !== lastText) {
        lastText = currentText;
        settledCount = 0;
        chrome.runtime.sendMessage({
          type: 'SOVEREIGN_CHUNK',
          platformId: 'gemini',
          turnId,
          text: currentText
        });
      } else if (currentText && currentText === lastText) {
        settledCount++;
        const stopBtn = document.querySelector('button[aria-label*="Stop"]');
        if (!stopBtn && settledCount >= 3) {
          clearInterval(checkInterval);
          chrome.runtime.sendMessage({
            type: 'SOVEREIGN_COMPLETE',
            platformId: 'gemini',
            turnId,
            finalText: currentText
          });
        }
      }
    }, 800);
  }
})();
