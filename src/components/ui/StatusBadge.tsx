import { IncidentStatus, statusColors } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface StatusBadgeProps {
  status: IncidentStatus;
  className?: string;
}

const statusLabels: Record<IncidentStatus, string> = {
  unverified: 'Unverified',
  verified: 'Verified',
  'in-progress': 'In Progress',
  resolved: 'Resolved',
};

const statusIcons: Record<IncidentStatus, React.ReactNode> = {
  unverified: <AlertCircle className="w-3 h-3" />,
  verified: <CheckCircle2 className="w-3 h-3" />,
  'in-progress': <Loader2 className="w-3 h-3 animate-spin" />,
  resolved: <CheckCircle2 className="w-3 h-3" />,
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colors = statusColors[status];

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
      {statusIcons[status]}
      {statusLabels[status]}
    </span>
  );
}
