import { useEffect, useState } from 'react';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Lock,
  Upload,
  Vote,
  Flag,
  Shield,
  BarChart3,
  Settings,
  Menu,
  X,
  Wallet,
  Globe,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Language } from '@/types';
import { ZkpAssistant } from '@/components/assistant/ZkpAssistant';

const LANGUAGE_STORAGE_KEY = 'trustvault-language';

const navItems = [
  { to: '/', label: 'Dashboard', labelHi: 'डैशबोर्ड', icon: LayoutDashboard },
  { to: '/vault', label: 'Vault', labelHi: 'तिजोरी', icon: Lock },
  { to: '/upload', label: 'Upload', labelHi: 'अपलोड', icon: Upload },
  { to: '/voting', label: 'Voting', labelHi: 'मतदान', icon: Vote },
  { to: '/flagged', label: 'Flagged', labelHi: 'चिन्हित', icon: Flag },
  { to: '/checker', label: 'Page Checker', labelHi: 'पेज जांच', icon: Shield },
  { to: '/analytics', label: 'Analytics', labelHi: 'विश्लेषण', icon: BarChart3 },
  { to: '/settings', label: 'Settings', labelHi: 'सेटिंग्स', icon: Settings },
];

const getStoredLanguage = (): Language => {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
  return stored === 'hi' ? 'hi' : 'en';
};

export const TopNav = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<Language>(getStoredLanguage);
  const [walletConnected] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    window.dispatchEvent(new CustomEvent('trustvault-language-change', { detail: language }));
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };

  const handleLanguageSelect = (value: string) => {
    if (value === 'hi' || value === 'en') {
      setLanguage(value);
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Lock className="w-6 h-6 text-primary" />
              <span className="text-xl font-heading font-semibold text-foreground">
                TrustVault
              </span>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md"
                  activeClassName="text-primary border-b-2 border-primary"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{language === 'en' ? item.label : item.labelHi}</span>
                </NavLink>
              ))}
            </div>

            {/* Right Section */}
            <div className="hidden lg:flex items-center gap-3">
              <ZkpAssistant />

              {/* Wallet Status */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-accent rounded-md">
                <Wallet className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono text-foreground">
                  {walletConnected ? '0x7f83...9069' : 'Connect'}
                </span>
              </div>

              {/* Language Toggle */}
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <Select value={language} onValueChange={handleLanguageSelect}>
                  <SelectTrigger className="h-8 w-28 text-sm">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिन्दी</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-40 bg-card border-t border-border overflow-y-auto">
          <div className="px-4 py-6 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-accent rounded-md transition-colors"
                activeClassName="bg-accent text-primary"
              >
                <item.icon className="w-5 h-5" />
                <span>{language === 'en' ? item.label : item.labelHi}</span>
              </NavLink>
            ))}

            <div className="pt-4 mt-4 border-t border-border space-y-3">
              <ZkpAssistant />
              <div className="flex items-center gap-2 px-4 py-2 bg-accent rounded-md">
                <Wallet className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono">
                  {walletConnected ? '0x7f83...9069' : 'Connect Wallet'}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={toggleLanguage}
                className="w-full gap-2"
              >
                <Globe className="w-4 h-4" />
                {language === 'en' ? 'Switch to हिन्दी' : 'Switch to English'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
