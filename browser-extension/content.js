const SUSPICIOUS_KEYWORDS = ['login', 'verify', 'wallet', 'bank', 'secure', 'update', 'invoice', 'auth', 'account'];
const RISKY_TLDS = ['.xyz', '.top', '.work', '.support', '.click', '.gq', '.ml', '.cf', '.tk'];
const TRUSTED_DOMAINS = ['upi', 'phonepe.com', 'paytm.com', 'amazon.in', 'onlinesbi.com', 'axisbank.com', 'localhost', 'trustvault-bharat'];
const PAYMENT_BUTTON_TEXT = ['pay', 'checkout', 'upi', 'proceed to pay', 'confirm', 'submit', 'wallet'];

const STORAGE_KEY = 'trustvault-safepay-enabled';
let extensionEnabled = true;
let currentVerdict = 'secure';

const ensureBannerStyles = () => {
  if (document.getElementById('trustvault-safepay-style')) return;
  const style = document.createElement('style');
  style.id = 'trustvault-safepay-style';
  style.textContent = `
    .trustvault-banner {
      position: fixed;
      left: 20px;
      bottom: 20px;
      z-index: 2147483647;
      max-width: 360px;
      border-radius: 12px;
      padding: 16px 18px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
      background: linear-gradient(135deg, #ff9933, #e85d04);
      color: #fff;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .trustvault-banner.safe {
      background: linear-gradient(135deg, #138808, #1b9c57);
    }
    .trustvault-banner__header {
      display: flex;
      gap: 10px;
      align-items: center;
      font-weight: 600;
    }
    .trustvault-banner button {
      align-self: flex-start;
      border: none;
      background: rgba(0,0,0,0.18);
      color: #fff;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 12px;
      cursor: pointer;
    }
    .trustvault-banner__actions {
      display: flex;
      gap: 8px;
    }
  `;
  document.head.appendChild(style);
};

const createBanner = () => {
  ensureBannerStyles();
  let banner = document.querySelector('.trustvault-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.className = 'trustvault-banner';

    banner.innerHTML = `
      <div class="trustvault-banner__header">
        <span id="trustvault-banner-icon">⚠️</span>
        <span id="trustvault-banner-title">TrustVault Alert</span>
      </div>
      <div id="trustvault-banner-message">Stay alert while entering payment details.</div>
      <div class="trustvault-banner__actions">
        <button id="trustvault-dismiss">Dismiss</button>
        <button id="trustvault-proceed">Proceed Anyway</button>
      </div>
    `;

    document.body.appendChild(banner);

    banner.querySelector('#trustvault-dismiss').addEventListener('click', () => {
      banner.remove();
    });
    banner.querySelector('#trustvault-proceed').addEventListener('click', () => {
      banner.remove();
      currentVerdict = 'secure';
    });
  }
  return banner;
};

const hideBanner = () => {
  const banner = document.querySelector('.trustvault-banner');
  if (banner) banner.remove();
};

const analyseLocation = () => {
  const url = window.location;
  let score = 90;
  const host = url.hostname.toLowerCase();
  const path = url.pathname.toLowerCase();
  let suspicious = false;

  if (host.includes('trustvault') || host === 'localhost' || host === '127.0.0.1' || host.endsWith('.localhost')) {
    return { verdict: 'secure', suspicious: false };
  }

  if (!url.protocol.startsWith('https')) {
    score -= 30;
    suspicious = true;
  }

  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    score -= 25;
    suspicious = true;
  }

  if (SUSPICIOUS_KEYWORDS.some((k) => host.includes(k) || path.includes(k))) {
    score -= 20;
    suspicious = true;
  }

  if (RISKY_TLDS.some((tld) => host.endsWith(tld))) {
    score -= 20;
    suspicious = true;
  }

  if (host.split('.').length > 3) {
    score -= 10;
    suspicious = true;
  }

  if (host.length > 22) {
    score -= 5;
  }

  const safe = TRUSTED_DOMAINS.some((safeDomain) => host.endsWith(safeDomain));
  if (safe) {
    score += 10;
  }

  if (score >= 75) return { verdict: 'secure', suspicious: false };
  if (score >= 60) return { verdict: 'warning', suspicious };
  return { verdict: 'unsafe', suspicious };
};

const showVerdictBanner = (verdict) => {
  if (!extensionEnabled) return;
  const banner = createBanner();
  const icon = banner.querySelector('#trustvault-banner-icon');
  const title = banner.querySelector('#trustvault-banner-title');
  const message = banner.querySelector('#trustvault-banner-message');

  banner.classList.remove('safe');

  if (verdict === 'unsafe') {
    icon.textContent = '🚨';
    title.textContent = 'High Risk Payment Page';
    message.textContent = 'TrustVault detected multiple phishing indicators. Do not enter card/UPI details unless you absolutely trust this site.';
  } else if (verdict === 'warning') {
    icon.textContent = '⚠️';
    title.textContent = 'Proceed with Caution';
    message.textContent = 'This domain looks unusual for payments. Double-check the URL and ensure it is the official merchant site.';
  } else {
    icon.textContent = '✅';
    title.textContent = 'Looks Fine';
    message.textContent = 'No obvious phishing indicators detected. Stay alert while approving payments.';
    banner.classList.add('safe');
    setTimeout(() => banner.remove(), 4000);
  }
};

const handlePaymentClick = (event) => {
  if (!extensionEnabled) return;
  const target = event.target.closest('button, a, input[type="submit"], input[type="button"]');
  if (!target) return;
  const label = (target.innerText || target.value || '').toLowerCase();
  if (!PAYMENT_BUTTON_TEXT.some((key) => label.includes(key))) return;

  if (currentVerdict === 'unsafe') {
    event.preventDefault();
    event.stopPropagation();
    alert('TrustVault blocked this action because the site appears unsafe. Use an official payment portal.');
  } else if (currentVerdict === 'warning') {
    const proceed = confirm('TrustVault Alert: This site looks suspicious. Only continue if you are certain it is legitimate. Proceed?');
    if (!proceed) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
};

const init = () => {
  if (!extensionEnabled) {
    hideBanner();
    return;
  }
  const { verdict } = analyseLocation();
  currentVerdict = verdict;
  if (verdict !== 'secure') {
    showVerdictBanner(verdict);
  } else {
    hideBanner();
  }
};

const readEnabledFlag = () => {
  try {
    chrome.storage.sync.get([STORAGE_KEY], (data) => {
      extensionEnabled = data[STORAGE_KEY] !== false;
      init();
    });
  } catch (error) {
    extensionEnabled = true;
    init();
  }
};

try {
  chrome.storage.onChanged.addListener((changes) => {
    if (changes[STORAGE_KEY]) {
      extensionEnabled = changes[STORAGE_KEY].newValue !== false;
      init();
    }
  });
} catch (error) {
  // storage not available (e.g., running outside extension context)
}

readEnabledFlag();

window.addEventListener('load', () => {
  init();
});

document.addEventListener('click', handlePaymentClick, true);
