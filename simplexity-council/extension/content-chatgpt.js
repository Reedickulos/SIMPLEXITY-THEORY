// Content script for ChatGPT (https://chatgpt.com)

(function() {
  console.log('[Simplexity Bridge] ChatGPT sovereign listener ready');

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'INJECT_AND_EXECUTE' && request.platformId === 'chatgpt') {
      handleChatGptTurn(request.prompt, request.autoSubmit, request.turnId);
      sendResponse({ status: 'started' });
    }
  });

  async function handleChatGptTurn(prompt, autoSubmit, turnId) {
    try {
      // Find prompt input
      const input = document.querySelector('#prompt-textarea') || 
                    document.querySelector('div[contenteditable="true"]');
      if (!input) {
        throw new Error('ChatGPT prompt textarea not found. Make sure chat is loaded.');
      }

      // Focus and enter prompt
      input.focus();
      if (input.tagName.toLowerCase() === 'textarea') {
        input.value = prompt;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        input.innerText = prompt;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }

      await new Promise(r => setTimeout(r, 400));

      if (autoSubmit) {
        const sendBtn = document.querySelector('button[data-testid="send-button"]') ||
                        document.querySelector('button[aria-label*="Send"]');
        if (sendBtn && !sendBtn.disabled) {
          sendBtn.click();
        } else {
          // Fallback Enter key event
          input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
        }
      }

      // Monitor response
      monitorResponse(turnId);
    } catch (err) {
      chrome.runtime.sendMessage({
        type: 'SOVEREIGN_ERROR',
        platformId: 'chatgpt',
        turnId,
        error: err.message
      });
    }
  }

  function monitorResponse(turnId) {
    let lastText = '';
    let settledCount = 0;
    const checkInterval = setInterval(() => {
      // Find all response messages
      const articles = document.querySelectorAll('article[data-testid^="conversation-turn"]');
      const lastArticle = articles[articles.length - 1];
      if (!lastArticle) return;

      // Extract assistant response content
      const textContainer = lastArticle.querySelector('.markdown') || lastArticle;
      const currentText = textContainer ? textContainer.innerText.trim() : '';

      if (currentText && currentText !== lastText) {
        lastText = currentText;
        settledCount = 0;
        chrome.runtime.sendMessage({
          type: 'SOVEREIGN_CHUNK',
          platformId: 'chatgpt',
          turnId,
          text: currentText
        });
      } else if (currentText && currentText === lastText) {
        settledCount++;
        // Check if stop streaming button is gone and send button is back
        const stopBtn = document.querySelector('button[data-testid="stop-button"]') || 
                        document.querySelector('button[aria-label*="Stop"]');
        if (!stopBtn && settledCount >= 3) {
          clearInterval(checkInterval);
          chrome.runtime.sendMessage({
            type: 'SOVEREIGN_COMPLETE',
            platformId: 'chatgpt',
            turnId,
            finalText: currentText
          });
        }
      }
    }, 800);
  }
})();
