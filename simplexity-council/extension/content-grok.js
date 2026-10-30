// Content script for Grok (https://grok.com and https://x.com/i/grok)

(function() {
  console.log('[Simplexity Bridge] Grok sovereign listener ready');

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'INJECT_AND_EXECUTE' && request.platformId === 'grok') {
      handleGrokTurn(request.prompt, request.autoSubmit, request.turnId);
      sendResponse({ status: 'started' });
    }
  });

  async function handleGrokTurn(prompt, autoSubmit, turnId) {
    try {
      const input = document.querySelector('textarea[placeholder*="Ask"]') ||
                    document.querySelector('textarea') ||
                    document.querySelector('div[contenteditable="true"]');
      if (!input) {
        throw new Error('Grok prompt input not found.');
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
        const sendBtn = document.querySelector('button[aria-label*="Grok"]') ||
                        document.querySelector('button[type="submit"]') ||
                        document.querySelector('button[aria-label*="Send"]');
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
        platformId: 'grok',
        turnId,
        error: err.message
      });
    }
  }

  function monitorResponse(turnId) {
    let lastText = '';
    let settledCount = 0;
    const checkInterval = setInterval(() => {
      // Find message bubbles
      const bubbles = document.querySelectorAll('.message-bubble, div[data-testid*="grok_response"], div.response-content');
      const lastBubble = bubbles[bubbles.length - 1];
      if (!lastBubble) return;

      const currentText = lastBubble.innerText.trim();
      if (currentText && currentText !== lastText) {
        lastText = currentText;
        settledCount = 0;
        chrome.runtime.sendMessage({
          type: 'SOVEREIGN_CHUNK',
          platformId: 'grok',
          turnId,
          text: currentText
        });
      } else if (currentText && currentText === lastText) {
        settledCount++;
        const isGenerating = document.querySelector('.animate-pulse, button[aria-label*="Stop"]');
        if (!isGenerating && settledCount >= 3) {
          clearInterval(checkInterval);
          chrome.runtime.sendMessage({
            type: 'SOVEREIGN_COMPLETE',
            platformId: 'grok',
            turnId,
            finalText: currentText
          });
        }
      }
    }, 800);
  }
})();
