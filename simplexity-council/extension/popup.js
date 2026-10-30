document.addEventListener('DOMContentLoaded', () => {
  const launchBtn = document.getElementById('launchConjoinedBtn');
  const cockpitBtn = document.getElementById('openCockpitBtn');

  function updateTabs() {
    chrome.runtime.sendMessage({ type: 'GET_TABS_STATUS' }, (res) => {
      if (!res || !res.status) return;
      for (const [key, isActive] of Object.entries(res.status)) {
        const dot = document.getElementById(`dot-${key}`);
        if (dot) {
          if (isActive) {
            dot.classList.add('active');
          } else {
            dot.classList.remove('active');
          }
        }
      }
    });
  }

  updateTabs();
  setInterval(updateTabs, 2000);

  launchBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({
      type: 'LAUNCH_CONJOINED_WINDOW',
      appUrl: 'https://ais-dev-spflrvi65qt72mjztsxbwd-26305069216.us-west1.run.app'
    });
    window.close();
  });

  cockpitBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://ais-dev-spflrvi65qt72mjztsxbwd-26305069216.us-west1.run.app' });
    window.close();
  });
});
