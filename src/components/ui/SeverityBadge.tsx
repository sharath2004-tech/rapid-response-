import { cn } from '@/lib/utils';
import { SeverityLevel, severityColors } from '@/data/mockData';
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';

interface SeverityBadgeProps {
  severity: SeverityLevel;
  className?: string;
  showIcon?: boolean;
}

const severityLabels: Record<SeverityLevel, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const severityIcons: Record<SeverityLevel, React.ReactNode> = {
  critical: <AlertTriangle className="w-3 h-3" />,
  high: <AlertCircle className="w-3 h-3" />,
  medium: <Info className="w-3 h-3" />,
  low: <CheckCircle className="w-3 h-3" />,
};

export function SeverityBadge({ severity, className, showIcon = true }: SeverityBadgeProps) {
  const colors = severityColors[severity];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        colors.bg,
        colors.text,
        colors.border,
        className
      )}
    >
      {showIcon && severityIcons[severity]}
      {severityLabels[severity]}
    </span>
  );
}
