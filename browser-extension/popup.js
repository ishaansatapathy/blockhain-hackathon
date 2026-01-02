const STORAGE_KEY = 'trustvault-safepay-enabled';
const ANALYSIS_KEY = 'trustvault-last-analysis';

const statusPill = document.getElementById('status');
const toggleButton = document.getElementById('toggle');
const scanButton = document.getElementById('scan');
const scoreSection = document.getElementById('scoreSection');
const detailsSection = document.getElementById('detailsSection');
const scoreCircle = document.getElementById('scoreCircle');
const scoreTitle = document.getElementById('scoreTitle');
const scoreDescription = document.getElementById('scoreDescription');
const siteDetails = document.getElementById('siteDetails');
const riskFactors = document.getElementById('riskFactors');

const getVerdictEmoji = (verdict) => {
  const emojis = {
    'secure': '✅',
    'warning': '⚠️',
    'unsafe': '🚨'
  };
  return emojis[verdict] || '❓';
};

const updateScoreDisplay = (analysis) => {
  if (!analysis || analysis.score === undefined) return;

  const { score, verdict, domain, riskItems = [] } = analysis;
  
  scoreSection.style.display = 'block';
  detailsSection.style.display = 'block';
  
  // Update score circle
  scoreCircle.textContent = score;
  scoreCircle.className = `score-circle ${verdict}`;
  
  // Update title and description
  const titles = {
    'secure': 'Safe to Use',
    'warning': 'Proceed Carefully',
    'unsafe': 'High Risk Detected'
  };
  
  const descriptions = {
    'secure': 'This site appears legitimate',
    'warning': 'Some suspicious indicators found',
    'unsafe': 'Multiple fraud indicators detected'
  };
  
  scoreTitle.textContent = titles[verdict] || 'Unknown Status';
  scoreDescription.textContent = descriptions[verdict] || '';
  
  // Update site details
  siteDetails.innerHTML = `<strong>Domain:</strong> ${domain || 'Unknown'}`;
  
  // Update risk factors
  if (riskItems.length > 0) {
    riskFactors.innerHTML = '<strong>Issues Found:</strong><br>' + 
      riskItems.map(item => `<div class="risk-item">${item}</div>`).join('');
  } else {
    riskFactors.innerHTML = '<div class="risk-item safe">✓ No risk factors detected</div>';
  }
};

const updateUI = (enabled) => {
  if (enabled) {
    statusPill.textContent = 'Enabled';
    statusPill.classList.remove('disabled');
    statusPill.classList.remove('warning');
    toggleButton.textContent = 'Disable protection';
  } else {
    statusPill.textContent = 'Disabled';
    statusPill.classList.add('disabled');
    toggleButton.textContent = 'Enable protection';
    scoreSection.style.display = 'none';
    detailsSection.style.display = 'none';
  }
};

const loadAnalysis = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    
    // Request current analysis from content script
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: 'getAnalysis' },
      (response) => {
        if (response && response.analysis) {
          updateScoreDisplay(response.analysis);
        }
      }
    ).catch(() => {
      // Content script not loaded yet, that's okay
    });
  });
};

const readFlag = () => {
  chrome.storage.sync.get([STORAGE_KEY], (data) => {
    updateUI(data[STORAGE_KEY] !== false);
    loadAnalysis();
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
    if (!tabs[0]) return;
    
    // Force re-analysis
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: 'reanalyze' },
      (response) => {
        if (response && response.analysis) {
          updateScoreDisplay(response.analysis);
        }
      }
    ).catch(() => {
      alert('Unable to analyze this page. Some system pages cannot be scanned.');
    });
  });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateAnalysis') {
    updateScoreDisplay(request.analysis);
  }
});

readFlag();
