import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Wallet, Shield, Globe, Download } from 'lucide-react';

export default function Settings() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-semibold text-foreground mb-2">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account and preferences • अपनी सेटिंग्स प्रबंधित करें
          </p>
        </div>

        <div className="space-y-6">
          {/* Wallet Information */}
          <Card className="p-6 border border-border bg-card">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-heading font-semibold text-foreground">
                Wallet Information
              </h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Connected Address</p>
                <p className="font-mono text-sm text-foreground">
                  0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Network</p>
                <p className="text-sm text-foreground">Polygon Mumbai Testnet</p>
              </div>
            </div>
          </Card>

          {/* ZKP Settings */}
          <Card className="p-6 border border-border bg-card">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-heading font-semibold text-foreground">
                Privacy Settings
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="zkp-mode" className="text-sm font-medium">
                    ZKP Mode (Semaphore)
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Uses Semaphore protocol for zero-knowledge proofs
                  </p>
                </div>
                <Switch id="zkp-mode" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="2fa" className="text-sm font-medium">
                    Enable 2FA
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Additional security layer for transactions
                  </p>
                </div>
                <Switch id="2fa" />
              </div>
            </div>
          </Card>

          {/* Language & Accessibility */}
          <Card className="p-6 border border-border bg-card">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-heading font-semibold text-foreground">
                Language & Accessibility
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Language</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current: English / हिन्दी
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Change
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="high-contrast" className="text-sm font-medium">
                    High Contrast Mode
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enhanced visibility for better readability
                  </p>
                </div>
                <Switch id="high-contrast" />
              </div>
            </div>
          </Card>

          {/* Data Export */}
          <Card className="p-6 border border-border bg-card">
            <div className="flex items-center gap-3 mb-4">
              <Download className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-heading font-semibold text-foreground">
                Data Management
              </h2>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Export your document vault and transaction history
              </p>
              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export Vault Data
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
