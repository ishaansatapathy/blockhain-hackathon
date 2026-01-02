/**
 * TrustVault SafePay - Settings Management
 * Handles whitelist, custom rules, statistics, and preferences
 */

const STORAGE_KEYS = {
  WHITELIST: 'trustvault-whitelist',
  CUSTOM_RULES: 'trustvault-custom-rules',
  STATISTICS: 'trustvault-statistics',
  LOGS: 'trustvault-logs',
  PREFERENCES: 'trustvault-preferences',
};

/**
 * Initialize settings page
 */
document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  loadWhitelist();
  loadCustomRules();
  loadStatistics();
  loadLogs();
  loadPreferences();
});

/**
 * TAB NAVIGATION
 */
function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.getAttribute('data-tab');
      
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      button.classList.add('active');
      document.getElementById(tabName).classList.add('active');
    });
  });
}

/**
 * WHITELIST MANAGEMENT
 */
function loadWhitelist() {
  chrome.storage.sync.get([STORAGE_KEYS.WHITELIST], (result) => {
    const whitelist = result[STORAGE_KEYS.WHITELIST] || [];
    displayWhitelist(whitelist);
  });
}

function addToWhitelist() {
  const input = document.getElementById('whitelistInput');
  const domain = input.value.trim().toLowerCase();
  
  if (!domain) {
    showMessage('whitelistMessage', 'Please enter a domain', 'error');
    return;
  }

  if (!isValidDomain(domain)) {
    showMessage('whitelistMessage', 'Invalid domain format', 'error');
    return;
  }

  chrome.storage.sync.get([STORAGE_KEYS.WHITELIST], (result) => {
    const whitelist = result[STORAGE_KEYS.WHITELIST] || [];
    
    if (whitelist.includes(domain)) {
      showMessage('whitelistMessage', 'Domain already in whitelist', 'error');
      return;
    }

    whitelist.push(domain);
    whitelist.sort();
    
    chrome.storage.sync.set({ [STORAGE_KEYS.WHITELIST]: whitelist }, () => {
      input.value = '';
      showMessage('whitelistMessage', `Added ${domain} to whitelist`, 'success');
      loadWhitelist();
    });
  });
}

function removeFromWhitelist(domain) {
  if (!confirm(`Remove ${domain} from whitelist?`)) return;

  chrome.storage.sync.get([STORAGE_KEYS.WHITELIST], (result) => {
    const whitelist = result[STORAGE_KEYS.WHITELIST] || [];
    const updated = whitelist.filter(d => d !== domain);
    
    chrome.storage.sync.set({ [STORAGE_KEYS.WHITELIST]: updated }, () => {
      showMessage('whitelistMessage', `Removed ${domain} from whitelist`, 'success');
      loadWhitelist();
    });
  });
}

function displayWhitelist(whitelist) {
  const container = document.getElementById('whitelistList');
  
  if (whitelist.length === 0) {
    container.innerHTML = '<div class="empty-state">No trusted sites yet. Add one to get started!</div>';
    return;
  }

  container.innerHTML = whitelist.map(domain => `
    <div class="list-item safe">
      <span class="domain">✓ ${domain}</span>
      <div class="actions">
        <button onclick="removeFromWhitelist('${domain}')" class="secondary">Remove</button>
      </div>
    </div>
  `).join('');
}

/**
 * CUSTOM RULES MANAGEMENT
 */
function loadCustomRules() {
  chrome.storage.sync.get([STORAGE_KEYS.CUSTOM_RULES], (result) => {
    const rules = result[STORAGE_KEYS.CUSTOM_RULES] || [];
    displayCustomRules(rules);
  });
}

function addRule() {
  const type = document.getElementById('ruleType').value;
  const value = document.getElementById('ruleValue').value.trim().toLowerCase();
  const penalty = parseInt(document.getElementById('rulePenalty').value);

  if (!value) {
    showMessage('rulesMessage', 'Please enter a rule value', 'error');
    return;
  }

  if (penalty < 5 || penalty > 30) {
    showMessage('rulesMessage', 'Penalty must be between 5-30', 'error');
    return;
  }

  chrome.storage.sync.get([STORAGE_KEYS.CUSTOM_RULES], (result) => {
    const rules = result[STORAGE_KEYS.CUSTOM_RULES] || [];
    
    const rule = { type, value, penalty, added: new Date().toISOString() };
    rules.push(rule);

    chrome.storage.sync.set({ [STORAGE_KEYS.CUSTOM_RULES]: rules }, () => {
      document.getElementById('ruleValue').value = '';
      showMessage('rulesMessage', 'Rule added successfully', 'success');
      loadCustomRules();
    });
  });
}

function removeRule(index) {
  chrome.storage.sync.get([STORAGE_KEYS.CUSTOM_RULES], (result) => {
    const rules = result[STORAGE_KEYS.CUSTOM_RULES] || [];
    rules.splice(index, 1);
    
    chrome.storage.sync.set({ [STORAGE_KEYS.CUSTOM_RULES]: rules }, () => {
      loadCustomRules();
    });
  });
}

function displayCustomRules(rules) {
  const container = document.getElementById('rulesList');
  
  if (rules.length === 0) {
    container.innerHTML = '<div class="empty-state">No custom rules yet</div>';
    return;
  }

  container.innerHTML = rules.map((rule, idx) => `
    <div class="list-item">
      <div>
        <div class="domain">${rule.type.toUpperCase()}: ${rule.value}</div>
        <div style="font-size: 12px; color: #6b7280;">Penalty: ${rule.penalty}pts</div>
      </div>
      <div class="actions">
        <button onclick="removeRule(${idx})" class="secondary">Remove</button>
      </div>
    </div>
  `).join('');
}

/**
 * STATISTICS MANAGEMENT
 */
function loadStatistics() {
  chrome.storage.local.get([STORAGE_KEYS.STATISTICS], (result) => {
    const stats = result[STORAGE_KEYS.STATISTICS] || {
      safe: 0,
      warning: 0,
      blocked: 0,
      total: 0
    };

    document.getElementById('statSafe').textContent = stats.safe;
    document.getElementById('statWarning').textContent = stats.warning;
    document.getElementById('statBlocked').textContent = stats.blocked;
    document.getElementById('statTotal').textContent = stats.total;
  });
}

function resetStats() {
  if (!confirm('Reset all statistics? This cannot be undone.')) return;

  chrome.storage.local.set({
    [STORAGE_KEYS.STATISTICS]: {
      safe: 0,
      warning: 0,
      blocked: 0,
      total: 0
    }
  }, () => {
    loadStatistics();
    showMessage('statsMessage', 'Statistics reset', 'success');
  });
}

/**
 * LOGS MANAGEMENT
 */
function loadLogs() {
  chrome.storage.local.get([STORAGE_KEYS.LOGS], (result) => {
    const logs = result[STORAGE_KEYS.LOGS] || [];
    displayLogs(logs);
  });
}

function displayLogs(logs) {
  const container = document.getElementById('logsList');
  
  if (logs.length === 0) {
    container.innerHTML = '<div class="empty-state">No analysis logs yet</div>';
    return;
  }

  const sorted = [...logs].reverse();
  container.innerHTML = sorted.map(log => {
    const date = new Date(log.timestamp).toLocaleString();
    const colors = {
      'secure': 'safe',
      'warning': 'warning',
      'unsafe': ''
    };
    return `
      <div class="list-item ${colors[log.verdict]}">
        <div>
          <div class="domain">${log.domain}</div>
          <div style="font-size: 12px; color: #6b7280;">
            Score: ${log.score}/100 | ${log.verdict.toUpperCase()} | ${date}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function exportLogs() {
  chrome.storage.local.get([STORAGE_KEYS.LOGS], (result) => {
    const logs = result[STORAGE_KEYS.LOGS] || [];
    const data = JSON.stringify(logs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trustvault-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

function clearLogs() {
  if (!confirm('Delete all logs? This cannot be undone.')) return;

  chrome.storage.local.set({ [STORAGE_KEYS.LOGS]: [] }, () => {
    loadLogs();
    showMessage('logsMessage', 'Logs cleared', 'success');
  });
}

/**
 * PREFERENCES MANAGEMENT
 */
function loadPreferences() {
  chrome.storage.sync.get([STORAGE_KEYS.PREFERENCES], (result) => {
    const prefs = result[STORAGE_KEYS.PREFERENCES] || {
      darkMode: false,
      notifications: true,
      autoLock: true,
      vaultIntegration: false,
      cacheDuration: 24
    };

    document.getElementById('darkMode').checked = prefs.darkMode;
    document.getElementById('notifications').checked = prefs.notifications;
    document.getElementById('autoLock').checked = prefs.autoLock;
    document.getElementById('vaultIntegration').checked = prefs.vaultIntegration;
    document.getElementById('cacheDuration').value = prefs.cacheDuration;

    // Apply dark mode
    if (prefs.darkMode) {
      document.body.style.background = '#1f2937';
      document.body.style.color = '#f9fafb';
    }
  });

  // Save preferences on change
  const inputs = document.querySelectorAll('#darkMode, #notifications, #autoLock, #vaultIntegration, #cacheDuration');
  inputs.forEach(input => {
    input.addEventListener('change', savePreferences);
  });
}

function savePreferences() {
  const prefs = {
    darkMode: document.getElementById('darkMode').checked,
    notifications: document.getElementById('notifications').checked,
    autoLock: document.getElementById('autoLock').checked,
    vaultIntegration: document.getElementById('vaultIntegration').checked,
    cacheDuration: parseInt(document.getElementById('cacheDuration').value)
  };

  chrome.storage.sync.set({ [STORAGE_KEYS.PREFERENCES]: prefs });
  
  // Apply dark mode immediately
  if (prefs.darkMode) {
    document.body.style.background = '#1f2937';
    document.body.style.color = '#f9fafb';
  } else {
    document.body.style.background = '';
    document.body.style.color = '';
  }
}

/**
 * UTILITY FUNCTIONS
 */
function isValidDomain(domain) {
  const domainRegex = /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)*[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i;
  return domainRegex.test(domain);
}

function showMessage(elementId, message, type) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.className = `message ${type}`;
  setTimeout(() => {
    element.className = 'message';
  }, 4000);
}

/**
 * Track statistics from background script
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'recordAnalysis') {
    const { verdict, domain, score } = request;
    
    chrome.storage.local.get([STORAGE_KEYS.STATISTICS, STORAGE_KEYS.LOGS], (result) => {
      const stats = result[STORAGE_KEYS.STATISTICS] || { safe: 0, warning: 0, blocked: 0, total: 0 };
      const logs = result[STORAGE_KEYS.LOGS] || [];

      // Update stats
      stats.total++;
      if (verdict === 'secure') stats.safe++;
      else if (verdict === 'warning') stats.warning++;
      else if (verdict === 'unsafe') stats.blocked++;

      // Add log entry
      logs.push({
        domain,
        verdict,
        score,
        timestamp: new Date().toISOString()
      });

      // Keep only last 7 days (168 hours)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentLogs = logs.filter(log => new Date(log.timestamp) > sevenDaysAgo);

      chrome.storage.local.set({
        [STORAGE_KEYS.STATISTICS]: stats,
        [STORAGE_KEYS.LOGS]: recentLogs
      });
    });
  }
});
