import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, CheckCircle, AlertTriangle, XCircle, Search, AlertCircle, Globe } from 'lucide-react';
import { SiteCheck } from '@/types';
import { Badge } from '@/components/ui/badge';

const suspiciousKeywords = ['login', 'verify', 'wallet', 'bank', 'secure', 'update', 'invoice'];
const riskyTlds = ['.xyz', '.top', '.work', '.support', '.click', '.gq', '.ml', '.cf'];
const knownSafeDomains = ['upi', 'paytm.com', 'phonepe.com', 'incometax.gov.in', 'onlinesbi.com'];

const calculateScore = (url: URL) => {
  let score = 90;
  const reasons: string[] = [];

  if (url.protocol !== 'https:') {
    score -= 30;
    reasons.push('Connection is not using HTTPS. Avoid entering sensitive data.');
  }

  const host = url.hostname.toLowerCase();

  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    score -= 25;
    reasons.push('Website is served directly from an IP address; phishing kits often do this.');
  }

  const matchesKeyword = suspiciousKeywords.some((keyword) => host.includes(keyword) || url.pathname.toLowerCase().includes(keyword));
  if (matchesKeyword) {
    score -= 15;
    reasons.push('URL contains high-risk keywords (login/verify/update etc.).');
  }

  const hasSafeKeyword = knownSafeDomains.some((safe) => host.endsWith(safe));
  if (!hasSafeKeyword && host.split('.').length > 3) {
    score -= 10;
    reasons.push('Domain contains multiple subdomains. Attackers may imitate bank portals this way.');
  }

  if (riskyTlds.some((tld) => host.endsWith(tld))) {
    score -= 20;
    reasons.push('Domain uses a low-reputation TLD associated with scams.');
  }

  const hyphenCount = (host.match(/-/g) || []).length;
  if (hyphenCount >= 2) {
    score -= 10;
    reasons.push('Domain contains repeated hyphens, common in spoofed websites.');
  }

  if (host.length > 22) {
    score -= 5;
    reasons.push('Domain name is unusually long.');
  }

  if (hasSafeKeyword) {
    score += 10;
    reasons.push('Matches trusted merchant domain.');
  }

  const verdict: SiteCheck['verdict'] = score >= 75 ? 'secure' : score >= 55 ? 'warning' : 'unsafe';
  const normalisedScore = Math.max(10, Math.min(100, score));

  return { verdict, reasons, score: normalisedScore };
};

export default function Checker() {
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<SiteCheck | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = () => {
    if (!url) {
      setError('Please paste a payment page URL first.');
      return;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      setError('The URL you entered is not valid.');
      return;
    }

    setError(null);
    setScanning(true);
    setResult(null);

    setTimeout(() => {
      const { verdict, reasons, score } = calculateScore(parsedUrl);
      const finalReasons = [...reasons];
      if (verdict !== 'secure') {
        finalReasons.push('Double-check the address bar. Only continue if you initiated this payment.');
      } else {
        finalReasons.push('Looks safe, but always confirm the site before entering card or UPI PIN.');
      }

      setResult({ url: parsedUrl.href, verdict, score, reasons: finalReasons });
      setScanning(false);
    }, 1100);
  };

  const getVerdictConfig = (verdict: SiteCheck['verdict']) => {
    switch (verdict) {
      case 'secure':
        return {
          icon: CheckCircle,
          text: 'Secure',
          textHi: 'सुरक्षित',
          color: 'text-success',
          bg: 'bg-success/10',
          border: 'border-success/20',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          text: 'Caution',
          textHi: 'सावधानी',
          color: 'text-warning',
          bg: 'bg-warning/10',
          border: 'border-warning/20',
        };
      case 'unsafe':
      default:
        return {
          icon: XCircle,
          text: 'Unsafe',
          textHi: 'असुरक्षित',
          color: 'text-destructive',
          bg: 'bg-destructive/10',
          border: 'border-destructive/20',
        };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading font-semibold text-foreground">Payment Page Security Checker</h1>
          <p className="text-muted-foreground">
            Verify payment website safety before entering details • भुगतान करने से पहले वेबसाइट की जांच करें
          </p>
        </div>

        <Card className="p-6 border border-border bg-card">
          <div className="space-y-6">
            {/* Input Section */}
            <div>
              <div className="flex gap-3">
                <Input
                  type="url"
                  placeholder="Enter website URL (e.g., https://example.com)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                  className="flex-1"
                />
                <Button
                  onClick={handleScan}
                  disabled={scanning}
                  className="gap-2"
                >
                  {scanning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Scan Now
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                वेबसाइट URL दर्ज करें और स्कैन करें • Enter the payment page URL to check
              </p>
              {error && (
                <div className="mt-3 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>

            {result && (
              <div className="space-y-4 pt-6 border-t border-border">
                {(() => {
                  const config = getVerdictConfig(result.verdict);
                  const Icon = config.icon;

                  return (
                    <>
                      <div className={`p-6 rounded-lg border ${config.bg} ${config.border}`}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <Icon className={`w-8 h-8 ${config.color}`} />
                            <div>
                              <p className={`text-2xl font-heading font-semibold ${config.color}`}>
                                {config.text}
                              </p>
                              <p className="text-sm text-muted-foreground">{config.textHi}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Globe className="w-4 h-4" />
                            <span className="font-mono truncate max-w-xs">{result.url}</span>
                          </div>
                        </div>
                        <div className="mt-5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground">Risk score (higher is safer)</span>
                            <span className={`text-sm font-semibold ${config.color}`}>
                              {result.score}/100
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                result.verdict === 'secure'
                                  ? 'bg-success'
                                  : result.verdict === 'warning'
                                  ? 'bg-warning'
                                  : 'bg-destructive'
                              }`}
                              style={{ width: `${result.score}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-foreground mb-3">
                          Why we flagged this URL:
                        </p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {result.reasons.map((reason, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {result.verdict !== 'secure' ? (
                        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                          <p className="text-sm font-medium text-destructive mb-1">
                            ⚠️ Proceed only if you trust this merchant
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Avoid logging in or entering OTP/UPI PIN unless you initiated the payment. Consider using the TrustVault browser extension for real-time warnings.
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 bg-success/10 border border-success/20 rounded-md">
                          <p className="text-sm font-medium text-success mb-1">
                            ✓ No obvious phishing indicators detected
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Always confirm the merchant URL and payment amount before approving the transaction.
                          </p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            {!result && !scanning && !error && (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">
                  Enter a URL to check
                </p>
                <p className="text-sm text-muted-foreground">
                  We'll analyze the website for security risks
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 border border-border bg-card">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-heading font-semibold text-foreground">TrustVault Browser Extension</h2>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Install our extension to block suspicious login and payment prompts in real time. It scans each page you open and alerts you if the domain is malicious or the page tries to steal card/UPI credentials.
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">Coming Soon</Badge>
              <Button variant="outline" size="sm" onClick={() => window.alert('Keep an eye out! Extension binaries will be available after security review.')}>Notify me</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
