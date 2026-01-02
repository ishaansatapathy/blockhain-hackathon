# TrustVault SafePay Browser Extension

Advanced browser extension providing real-time protection against phishing, fraud, and malicious payment pages.

## 🚀 Features

### Core Security
- **Real-time Page Analysis** - Automatically scans every page you visit
- **Safety Score (0-100)** - Detailed risk assessment with color-coded alerts
- **Payment Button Blocking** - Prevents transactions on unsafe sites
- **Multiple Detection Methods** - 8+ fraud detection techniques
- **Whitelisting** - Mark safe sites for faster loading
- **Statistics** - Track security events and patterns

### Detection Capabilities
- ✅ HTTPS/SSL verification
- ✅ Suspicious keyword detection
- ✅ Risky TLD identification
- ✅ IP address detection
- ✅ Homograph attack prevention (Cyrillic lookalikes)
- ✅ Phishing pattern recognition
- ✅ Domain structure analysis
- ✅ Typosquatting detection

## 📦 Installation

### Manual Installation (Development)
1. Open `chrome://extensions` in Chrome/Edge
2. Toggle **Developer mode** (top-right corner)
3. Click **Load unpacked**
4. Select the `browser-extension/` folder
5. Pin the extension for quick access

### Chrome Web Store (Production)
Coming soon...

## 🎯 How It Works

### Safety Score Breakdown
- **70-100 (Green)** - Safe to use
- **40-69 (Yellow)** - Proceed carefully
- **0-39 (Red)** - High risk, transaction blocked

### What Gets Analyzed
1. **HTTPS Status** - Secure connection required (−30 pts if missing)
2. **Domain Type** - IP address or normal domain (−25 pts if IP)
3. **Keywords** - Suspicious payment-related keywords (−20 pts)
4. **TLD** - Known risky extensions like .xyz, .top (−20 pts)
5. **Subdomain Depth** - Multiple levels suggest phishing (−10 pts)
6. **Domain Length** - Too long domains are suspicious (−5 pts)
7. **Homographs** - Look-alike domains using Cyrillic (−15 pts)
8. **Patterns** - Known phishing patterns like "PayPaI" (−10 pts)

## 🎮 Usage

### Popup Interface
- **Safety Score** - Visual display of page safety (top)
- **Risk Factors** - Specific issues detected
- **Scan Now** - Re-analyze current page
- **Disable/Enable** - Toggle protection on/off

### Settings
1. Click extension icon
2. Click **Settings** (gear icon)
3. Manage:
   - Trusted sites
   - Blocked keywords
   - Custom rules
   - Statistics
   - Dark mode

### Actions on Unsafe Sites

**UNSAFE (Red 🚨)**
- Banner appears with details
- Payment buttons are BLOCKED
- Clear warning message

**WARNING (Yellow ⚠️)**
- Banner appears with issues
- Confirmation required before payment
- Can proceed if you're certain

**SAFE (Green ✅)**
- Brief confirmation banner
- Normal browsing allowed
- No restrictions

## ⚙️ Configuration

### Customize Detection Rules

Edit `config.js` to modify:
```javascript
CONFIG.SUSPICIOUS_KEYWORDS = [...]
CONFIG.RISKY_TLDS = [...]
CONFIG.TRUSTED_DOMAINS = [...]
CONFIG.SCORE_THRESHOLDS = {...}
```

### Add Trusted Sites
1. Open extension popup
2. Go to Settings > Whitelist
3. Add domain (e.g., `amazon.com`)
4. Domain automatically gets score 100

### Create Custom Rules
1. Open extension popup
2. Go to Settings > Custom Rules
3. Add keyword, pattern, or TLD
4. Choose penalty (5-30 points)

## 📊 Statistics

Track your security:
- Total pages analyzed
- Sites flagged as unsafe
- Transactions blocked
- Safe sites visited
- Top risky TLDs detected

Access via Settings > Statistics

## 🔒 Privacy

**What We Store:**
- Your whitelist
- Custom rules you create
- Anonymous statistics
- Last 7 days of analysis logs

**What We Don't Store:**
- Personal information
- Form data
- Passwords
- Browsing history
- Sites visited

**Data Storage:**
- All data stored locally in Chrome
- No external servers
- No tracking
- No ads

## 🛠️ Advanced Features

### Vault Integration
Connect with TrustVault main app:
1. Settings > Vault Integration
2. Enable sync
3. Dangerous sites auto-flag in vault

### Analysis Logs
View detailed analysis:
1. Settings > Logs
2. Search by domain, date, or verdict
3. Export data as JSON
4. Clear logs (last 7 days by default)

### Performance Optimization
- Caches analysis results (24 hours)
- Skips re-analysis of same pages
- Lazy loads popup data
- Minimal memory footprint

## 🐛 Troubleshooting

### Extension Not Working
1. Refresh the page
2. Click extension icon > "Scan Now"
3. Check if protection is enabled
4. Restart browser if issues persist

### False Positives
If a safe site is flagged:
1. Review the risk factors
2. Add to whitelist (Settings > Whitelist)
3. Report to us (link in popup)

### Performance Issues
1. Clear logs: Settings > Logs > Clear All
2. Disable on heavy sites: Settings > Performance
3. Check Chrome memory: chrome://system

## 📝 Keyboard Shortcuts

- `Ctrl+Shift+Y` - Toggle protection
- `Ctrl+Shift+I` - Open extension popup
- `Ctrl+Shift+L` - View logs

(Customizable in Settings)

## 🤝 Contributing

Found a phishing site? Report it:
1. Open extension popup
2. Click "Report Phishing"
3. Include details
4. Helps improve detection

## 📚 Resources

- [Main TrustVault App](https://trustvault-bharat.com)
- [GitHub Repository](https://github.com/ishaansatapathy/blockhain-hackathon)
- [Report Issues](https://github.com/ishaansatapathy/blockhain-hackathon/issues)
- [Security Tips](https://trustvault-bharat.com/security-tips)

## ⚖️ License

MIT License - See LICENSE file for details

## 👥 Support

Questions or issues?
- Check Settings > Help
- View FAQ section
- Contact: support@trustvault-bharat.com

---

**Version:** 1.0.1  
**Last Updated:** January 2, 2026  
**Status:** Active Development

Stay safe! 🛡️
