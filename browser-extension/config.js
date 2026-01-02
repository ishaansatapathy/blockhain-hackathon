/**
 * TrustVault SafePay Configuration
 * Customize risk analysis parameters here
 */

const CONFIG = {
  // Keywords that appear in suspicious payment/login pages
  SUSPICIOUS_KEYWORDS: [
    'login', 'verify', 'wallet', 'bank', 'secure', 'update', 'invoice',
    'auth', 'account', 'password', 'confirm', 'validate', 'authenticate',
    'paypal', 'amazon', 'apple', 'google', 'microsoft', 'stripe'
  ],

  // High-risk top-level domains commonly used in phishing
  RISKY_TLDS: [
    '.xyz', '.top', '.work', '.support', '.click', '.gq', '.ml', '.cf', '.tk',
    '.win', '.download', '.stream', '.science', '.men', '.racing', '.review'
  ],

  // Completely trusted domains (whitelisted - score 100)
  TRUSTED_DOMAINS: [
    'upi',
    'phonepe.com',
    'paytm.com',
    'amazon.in',
    'amazon.com',
    'onlinesbi.com',
    'axisbank.com',
    'icicibank.com',
    'hdfc.com',
    'kotak.com',
    'localhost',
    'trustvault-bharat',
    'google.com',
    'paypal.com',
    'stripe.com',
    'razorpay.com',
    'airtel.com'
  ],

  // Partially trusted keywords (get score bonus)
  PARTIAL_TRUST_KEYWORDS: [
    'official',
    'secure',
    'verified',
    'trusted',
    'ssl',
    'bank',
    'govt'
  ],

  // Payment-related button text to monitor
  PAYMENT_BUTTON_TEXT: [
    'pay', 'checkout', 'upi', 'proceed to pay', 'confirm', 'submit',
    'wallet', 'complete purchase', 'place order', 'buy now', 'continue',
    'authorize', 'approve', 'process payment', 'pay now', 'make payment'
  ],

  // Risk scoring thresholds
  SCORE_THRESHOLDS: {
    SAFE: 70,      // 70+ = Safe
    WARNING: 40,   // 40-69 = Warning
    UNSAFE: 0      // 0-39 = Unsafe
  },

  // Banner display settings
  BANNER: {
    SAFE_BANNER_DURATION: 3500,  // milliseconds
    BANNER_Z_INDEX: 2147483647,
    BANNER_POSITION: 'bottom-left'
  },

  // Analysis settings
  ANALYSIS: {
    HTTPS_PENALTY: 30,
    IP_ADDRESS_PENALTY: 25,
    SUSPICIOUS_KEYWORD_PENALTY: 20,
    RISKY_TLD_PENALTY: 20,
    SUBDOMAIN_PENALTY: 10,
    LONG_DOMAIN_PENALTY: 5,
    HOMOGRAPH_PENALTY: 15,
    PHISHING_PATTERN_PENALTY: 10,
    TRUSTED_DOMAIN_BONUS: 15,
    MAX_DOMAIN_LENGTH: 25
  }
};
