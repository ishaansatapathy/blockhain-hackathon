import { useSimpleLanguage } from '@/contexts/SimpleLanguageContext';
import { Button } from '@/components/ui/button';

export default function SimpleLanguageToggle() {
  const { language, setLanguage } = useSimpleLanguage();

  return (
    <div className="flex flex-col gap-1 border border-border rounded-lg p-1.5 bg-card">
      <Button
        variant={language === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('en')}
        className="text-xs font-medium justify-start"
      >
        EN
      </Button>
      <Button
        variant={language === 'hi' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('hi')}
        className="text-xs font-medium justify-start"
      >
        हि
      </Button>
    </div>
  );
}
