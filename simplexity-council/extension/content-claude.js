// Content script for Claude (https://claude.ai)

(function() {
  console.log('[Simplexity Bridge] Claude sovereign listener ready');

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'INJECT_AND_EXECUTE' && request.platformId === 'claude') {
      handleClaudeTurn(request.prompt, request.autoSubmit, request.turnId);
      sendResponse({ status: 'started' });
    }
  });

  async function handleClaudeTurn(prompt, autoSubmit, turnId) {
    try {
      // Find prompt input for Claude
      const input = document.querySelector('div[contenteditable="true"]') ||
                    document.querySelector('fieldset div[contenteditable="true"]') ||
                    document.querySelector('div[aria-label*="Write your prompt"]');
      if (!input) {
        throw new Error('Claude prompt box not found. Make sure chat is open.');
      }

      input.focus();
      // Insert text into contenteditable
      document.execCommand('selectAll', false, null);
      document.execCommand('insertText', false, prompt);
      input.dispatchEvent(new Event('input', { bubbles: true }));

      await new Promise(r => setTimeout(r, 400));

      if (autoSubmit) {
        const sendBtn = document.querySelector('button[aria-label="Send Message"]') ||
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
        platformId: 'claude',
        turnId,
        error: err.message
      });
    }
  }

  function monitorResponse(turnId) {
    let lastText = '';
    let settledCount = 0;
    const checkInterval = setInterval(() => {
      // Claude messages container
      const messages = document.querySelectorAll('div.font-claude-message, [data-is-streaming], div[data-testid="user-message"] ~ div');
      const lastMsg = messages[messages.length - 1];
      if (!lastMsg) return;

      const currentText = lastMsg.innerText.trim();

      if (currentText && currentText !== lastText) {
        lastText = currentText;
        settledCount = 0;
        chrome.runtime.sendMessage({
          type: 'SOVEREIGN_CHUNK',
          platformId: 'claude',
          turnId,
          text: currentText
        });
      } else if (currentText && currentText === lastText) {
        settledCount++;
        // Check if streaming indicator is absent
        const isStreaming = document.querySelector('[data-is-streaming="true"]') ||
                            document.querySelector('button[aria-label*="Stop"]');
        if (!isStreaming && settledCount >= 3) {
          clearInterval(checkInterval);
          chrome.runtime.sendMessage({
            type: 'SOVEREIGN_COMPLETE',
            platformId: 'claude',
            turnId,
            finalText: currentText
          });
        }
      }
    }, 800);
  }
})();
