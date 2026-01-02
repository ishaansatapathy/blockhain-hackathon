const STORAGE_KEY = 'trustvault-safepay-enabled';

const statusPill = document.getElementById('status');
const toggleButton = document.getElementById('toggle');
const scanButton = document.getElementById('scan');

const updateUI = (enabled) => {
  if (enabled) {
    statusPill.textContent = 'Enabled';
    statusPill.classList.remove('disabled');
    toggleButton.textContent = 'Disable protection';
  } else {
    statusPill.textContent = 'Disabled';
    statusPill.classList.add('disabled');
    toggleButton.textContent = 'Enable protection';
  }
};

const readFlag = () => {
  chrome.storage.sync.get([STORAGE_KEY], (data) => {
    updateUI(data[STORAGE_KEY] !== false);
  });
};

toggleButton.addEventListener('click', () => {
  chrome.storage.sync.get([STORAGE_KEY], (data) => {
    const enabled = data[STORAGE_KEY] !== false;
    chrome.storage.sync.set({ [STORAGE_KEY]: !enabled }, () => {
      updateUI(!enabled);
    });
  });
});

scanButton.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0]?.id;
    if (!tabId) return;
    chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        if (typeof init === 'function') {
          init();
        } else {
          window.location.reload();
        }
      },
    });
  });
});

readFlag();
