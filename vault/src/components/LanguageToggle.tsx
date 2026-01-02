import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

// This component is no longer used - language feature has been removed
export default function LanguageToggle() {
  return (
    <div className="flex items-center gap-2 border border-border rounded-lg p-1 bg-card">
      <Button
        variant="default"
        size="sm"
        disabled
        className="text-xs font-medium gap-1"
      >
        <Globe className="w-3 h-3" />
        EN
      </Button>
    </div>
  );
}
