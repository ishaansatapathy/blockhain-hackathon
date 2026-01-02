import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, XCircle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: 'verified' | 'unverified' | 'flagged' | 'pending';
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const variants = {
    verified: {
      icon: CheckCircle2,
      text: 'Verified',
      textHi: 'सत्यापित',
      className: 'bg-success/10 text-success border-success/20',
    },
    unverified: {
      icon: Clock,
      text: 'Unverified',
      textHi: 'असत्यापित',
      className: 'bg-muted text-muted-foreground border-border',
    },
    flagged: {
      icon: XCircle,
      text: 'Flagged',
      textHi: 'चिन्हित',
      className: 'bg-destructive/10 text-destructive border-destructive/20',
    },
    pending: {
      icon: AlertCircle,
      text: 'Pending',
      textHi: 'लंबित',
      className: 'bg-warning/10 text-warning border-warning/20',
    },
  };

  const variant = variants[status];
  const Icon = variant.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border',
        variant.className,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {variant.text}
    </span>
  );
};
