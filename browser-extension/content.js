/**
 * TrustVault SafePay - Content Script
 * Analyzes pages in real-time and blocks fraudulent transactions
 */

// Configuration is loaded from config.js
const STORAGE_KEY = 'trustvault-safepay-enabled';
let extensionEnabled = true;
let currentVerdict = 'secure';
let currentAnalysis = null;

// Analysis cache for performance optimization
const analysisCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get cached analysis result if available and fresh
 */
const getCachedAnalysis = (host) => {
  const cached = analysisCache.get(host);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.analysis;
  }
  analysisCache.delete(host);
  return null;
};

/**
 * Store analysis result in cache
 */
const setCachedAnalysis = (host, analysis) => {
  analysisCache.set(host, {
    analysis,
    timestamp: Date.now()
  });
  // Limit cache size to 100 entries
  if (analysisCache.size > 100) {
    const firstKey = analysisCache.keys().next().value;
    analysisCache.delete(firstKey);
  }
};

/**
 * Create and style the warning banner
 */
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
      max-width: 380px;
      border-radius: 12px;
      padding: 16px 18px;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
      background: linear-gradient(135deg, #ff9933, #e85d04);
      color: #fff;
      font-family: 'Segoe UI', 'Inter', sans-serif;
      font-size: 14px;
      line-height: 1.5;
      display: flex;
      flex-direction: column;
      gap: 12px;
      animation: slideIn 0.3s ease-out;
    }
    @keyframes slideIn {
      from {
        transform: translateX(-400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .trustvault-banner.safe {
      background: linear-gradient(135deg, #10b981, #059669);
    }
    .trustvault-banner__header {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      font-weight: 700;
      font-size: 16px;
    }
    .trustvault-banner__score {
      font-size: 12px;
      font-weight: 600;
      background: rgba(0,0,0,0.15);
      padding: 2px 8px;
      border-radius: 4px;
      display: inline-block;
      margin-top: 4px;
    }
    .trustvault-banner button {
      align-self: flex-start;
      border: none;
      bacdiv>
          <div id="trustvault-banner-title">TrustVault Alert</div>
          <div class="trustvault-banner__score" id="trustvault-banner-score">Score: --/100</div>
        </div>
      </div>
      <div id="trustvault-banner-message">Analyzing page...</div>
      <div class="trustvault-banner__actions">
        <button id="trustvault-dismiss">Dismiss</button>
        <button id="trustvault-proceed">Continue Anyway</button>
      </div>
    `;

    document.body.appendChild(banner);

    banner.querySelector('#trustvault-dismiss').addEventListener('click', () => {
      banner.remove();
    });
    banner.querySelector('#trustvault-proceed').addEventListener('click', () => {
      banner.remove()
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

/**
 * Analyze the current page for fraud indicators
 */
const analyseLocation = () => {
  const url = window.location;
  const host = url.hostname.toLowerCase();
  
  // Check cache first for performance
  const cached = getCachedAnalysis(host);
  if (cached) {
    return cached;
  }

  let score = 100;  // Start with perfect score
  const path = url.pathname.toLowerCase();
  const riskItems = [];

  // Check if whitelisted
  if (isWhitelistedDomain(host)) {
    const result = { 
      verdict: 'secure', 
      score: 100, 
      domain: host,
      riskItems: [],
      suspicious: false 
    };
    setCachedAnalysis(host, result);
    return result;
  }

  // 1. HTTPS Check (30 points)
  if (!url.protocol.startsWith('https')) {
    score -= CONFIG.ANALYSIS.HTTPS_PENALTY;
    riskItems.push('⚠️ Not using HTTPS encryption');
  }

  // 2. IP Address Check (25 points)
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    score -= CONFIG.ANALYSIS.IP_ADDRESS_PENALTY;
    riskItems.push('⚠️ Using numeric IP address instead of domain name');
  }

  // 3. Suspicious Keywords Check (20 points)
  const foundKeywords = CONFIG.SUSPICIOUS_KEYWORDS.filter(k => 
    host.includes(k) || path.includes(k)
  );
  if (foundKeywords.length > 0) {
    score -= CONFIG.ANALYSIS.SUSPICIOUS_KEYWORD_PENALTY;
    riskItems.push(`⚠️ Suspicious keywords: ${foundKeywords.slice(0, 2).join(', ')}`);
  }

  // 4. Risky TLDs Check (20 points)
  const hasRiskyTld = CONFIG.RISKY_TLDS.some(tld => host.endsWith(tld));
  if (hasRiskyTld) {
    score -= CONFIG.ANALYSIS.RISKY_TLD_PENALTY;
    riskItems.push('⚠️ Using high-risk domain extension');
  }

  // 5. Subdomain Check (10 points)
  const domainParts = host.split('.');
  if (domainParts.length > 3) {
    score -= CONFIG.ANALYSIS.SUBDOMAIN_PENALTY;
    riskItems.push(`⚠️ Unusual subdomain structure (${domainParts.length} levels)`);
  }

  // 6. Domain Length Check (5 points)
  if (host.length > CONFIG.ANALYSIS.MAX_DOMAIN_LENGTH) {
    score -= CONFIG.ANALYSIS.LONG_DOMAIN_PENALTY;
    riskItems.push('⚠️ Unusually long domain name');
  }

  // 7. Homograph Check (15 points)
  if (containsHomographAttack(host)) {
    score -= CONFIG.ANALYSIS.HOMOGRAPH_PENALTY;
    riskItems.push('⚠️ Domain contains confusing characters');
  }

  // 8. Check for common phishing patterns (10 points)
  if (detectPhishingPatterns(host, path)) {
    score -= CONFIG.ANALYSIS.PHISHING_PATTERN_PENALTY;
    riskItems.push('⚠️ Phishing patterns detected in domain');
  }

  // Trusted domain bonus (up to 15 points)
  if (isPartiallyTrusted(host)) {
    score = Math.min(score + CONFIG.ANALYSIS.TRUSTED_DOMAIN_BONUS, 100);
  }

  // Ensure score is between 0-100
  score = Math.max(0, Math.min(100, Math.round(score)));

  // Determine verdict based on score thresholds
  let verdict = 'secure';
  if (score < CONFIG.SCORE_THRESHOLDS.WARNING) verdict = 'unsafe';
  else if (score < CONFIG.SCORE_THRESHOLDS.SAFE) verdict = 'warning';

  const result = { 
    verdict, 
    score, 
    domain: host,
    riskItems,
    suspicious: verdict !== 'secure'
  };
  
  // Cache the result
  setCachedAnalysis(host, result);
  return result;
};

const isWhitelistedDomain = (host) => {
  return CONFIG.TRUSTED_DOMAINS.some(domain => 
    host === domain || host.endsWith('.' + domain)
  );
};

const isPartiallyTrusted = (host) => {
  return CONFIG.PARTIAL_TRUST_KEYWORDS.some(keyword => 
    host.includes(keyword)
  );
};

const containsHomographAttack = (host) => {
  // Check for Cyrillic characters that look like Latin
  const cyrillicPatterns = /[а-яеёА-ЯЕЁ]/g;
  const mixedCase = /[a-z]{3,}[A-Z]|[A-Z][a-z]{2,}[A-Z]/;
  
  return cyrillicPatterns.test(host) || mixedCase.test(host);
};

const detectPhishingPatterns = (host, path) => {
  const phishingPatterns = [
    // Common typosquatting patterns
    /secure[\w-]*bank/i,
    /update[\w-]*account/i,
    /verify[\w-]*payment/i,
    /confirm[\w-]*identity/i,
    /authorize[\w-]*access/i,
    /validate[\w-]*card/i,
    /urgent[\w-]*action/i,
    /claim[\w-]*reward/i,
    /immediate[\w-]*action/i,
    
    // Number substitutions (1 for i, 0 for o, 3 for e, 4 for a, 5 for s, 7 for t)
    /\d{1,}[a-z]*\.com/i,
    /^(g00gle|paypa1|amaz0n|micr0soft)/i,
    
    // Common misspellings
    /^(gogle|paypa|amazn|micrsofts|aple|twiter)/i,
    
    // Dashes in place of valid domains
    /^([a-z]+-[a-z]+-){3,}/i,
    
    // Suspicious patterns
    /bit[\w-]*coin/i,
    /crypt[\w-]*wallet/i,
    /nft[\w-]*market/i,
    /token[\w-]*swap/i,
    
    // Lookalike domains
    /^(bitcoin|bnance|coinbase|kraken|gemini)/i
  ];
  
  const fullUrl = host + path;
  return phishingPatterns.some(pattern => pattern.test(fullUrl));
};
    /verify[\w-]*payment/i,
    /confirm[\w-]*identity/i,
    /re[\w-]*enter[\w-]*password/i,
    /paypa[l1]/i,  // Common typo: Paypal → PaypaI
    /amaz0n/i,     // Common typo: Amazon → Amaz0n
    /face?book/i,
    /instag?ram/i
  ];
  
  const fullUrl = host + path;
  return phishingPatterns.some(pattern => pattern.test(fullUrl));
};

/**
 * Display verdict banner with analysis details
 */
const showVerdictBanner = (analysis) => {
  if (!extensionEnabled) return;
  const { verdict, score, domain, riskItems } = analysis;
  
  const banner = createBanner();
  const icon = banner.querySelector('#trustvault-banner-icon');
  const title = banner.querySelector('#trustvault-banner-title');
  const message = banner.querySelector('#trustvault-banner-message');
  const scoreDisplay = banner.querySelector('#trustvault-banner-score');

  banner.classList.remove('safe');
  scoreDisplay.textContent = `Score: ${score}/100`;

  if (verdict === 'unsafe') {
    icon.textContent = '🚨';
    title.textContent = 'BLOCKED: High Risk Page';
    const riskSummary = riskItems.slice(0, 2).join(' ');
    message.innerHTML = `<strong>CRITICAL WARNING:</strong><br>This page has multiple fraud indicators. ${riskSummary}. <br><br>Do NOT enter payment or personal information unless you trust this site.`;
    banner.style.background = 'linear-gradient(135deg, #dc2626, #991b1b)';
  } else if (verdict === 'warning') {
    icon.textContent = '⚠️';
    title.textContent = 'Proceed Carefully';
    const riskSummary = riskItems.length > 0 ? riskItems[0] : 'Unusual site characteristics';
    message.innerHTML = `<strong>Security Warning:</strong><br>${riskSummary}. Verify this is the official website.`;
    banner.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
  } else {
    icon.textContent = '✅';
    title.textContent = 'Page Looks Safe';
    message.textContent = 'No phishing indicators detected. Still be cautious with payment details.';
    banner.classList.add('safe');
    setTimeout(() => banner.remove(), CONFIG.BANNER.SAFE_BANNER_DURATION);
  }
};

const handlePaymentClick = (event) => {
  if (!extensionEnabled) return;
  const target = event.target.closest('button, a, input[type="submit"], input[type="button"]');
  if (!target) return;
  
  const label = (target.innerText || target.value || target.textContent || '').toLowerCase();
  const isPaymentButton = CONFIG.PAYMENT_BUTTON_TEXT.some((key) => label.includes(key));
  
  if (!isPaymentButton) return;

  if (currentVerdict === 'unsafe') {
    event.preventDefault();
    event.stopPropagation();
    
    const riskDetails = currentAnalysis?.riskItems?.slice(0, 3).map(r => r.replace(/^⚠️\s*/, '')).join('\\n') || 'Multiple fraud indicators';
    const message = `🚨 TRANSACTION BLOCKED\\n\\nTrustVault has blocked this payment. This site appears UNSAFE.\\n\\nRisks Detected:\\n${riskDetails}\\n\\nVisit the official website or contact the merchant directly.`;
    alert(message);
  } else if (currentVerdict === 'warning') {
    event.preventDefault();
    event.stopPropagation();
    
    const scoreDisplay = currentAnalysis?.score ? `(Score: ${currentAnalysis.score}/100)` : '';
    const riskDetails = currentAnalysis?.riskItems?.slice(0, 2).map(r => r.replace(/^⚠️\s*/, '')).join('\\n') || 'Unusual site characteristics';
    const proceed = confirm(
      `⚠️ PAYMENT WARNING ${scoreDisplay}\\n\\nThis site has security concerns:\\n${riskDetails}\\n\\n✓ Continue ONLY if you're absolutely sure this is the real website\\n✗ Otherwise, click Cancel\\n\\nContinue?`
    );
    
    if (proceed) {
      // Re-trigger the original click
      target.click();
    }
  }
};

/**
 * Initialize page analysis
 */
const init = () => {
  if (!extensionEnabled) {
    hideBanner();
    return;
  }
  
  const analysis = analyseLocation();
  currentAnalysis = analysis;
  currentVerdict = analysis.verdict;
  
  console.log(`[TrustVault] ${analysis.verdict.toUpperCase()} (${analysis.score}/100) - ${analysis.domain}`);
  
  // Show banner only if not secure
  if (analysis.verdict !== 'secure') {
    showVerdictBanner(analysis);
  } else {
    hideBanner();
  }
  
  // Notify popup of the analysis
  try {
    chrome.runtime.sendMessage({
      action: 'updateAnalysis',
      analysis: analysis
    }).catch(() => {
      // Popup not open, that's fine
    });
  } catch (error) {
    // Silently fail if extension context is invalid
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

// Listen for storage changes
try {
  chrome.storage.onChanged.addListener((changes) => {
    if (changes[STORAGE_KEY]) {
      extensionEnabled = changes[STORAGE_KEY].newValue !== false;
      init();
    }
  });
} catch (error) {
  // storage not available
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getAnalysis') {
    sendResponse({ analysis: currentAnalysis });
  } else if (request.action === 'reanalyze') {
    init();
    sendResponse({ analysis: currentAnalysis });
  }
});

// Start extension
readEnabledFlag();

// Initial analysis on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Re-analyze on page full load
window.addEventListener('load', () => {
  setTimeout(init, 500);
});

// Monitor DOM changes for dynamic content
const observer = new MutationObserver(() => {
  // Could re-check for payment buttons on dynamic changes
});

if (document.body) {
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Intercept payment button clicks with high priority
document.addEventListener('click', handlePaymentClick, true);
