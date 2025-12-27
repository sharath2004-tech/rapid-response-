import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { Incident, IncidentType } from '@/types/incident';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { Building, Car, CheckCircle2, ChevronRight, Clock, Flame, Heart, Loader2, MapPin, Shield, ThumbsUp } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { SeverityBadge } from './ui/SeverityBadge';
import { StatusBadge } from './ui/StatusBadge';

interface IncidentCardProps {
  incident: Incident;
  className?: string;
  index?: number;
  onVerify?: (incidentId: string, newCount: number, hasVerified: boolean) => void;
}

const typeIcons: Record<IncidentType, React.ReactNode> = {
  medical: <Heart className="w-5 h-5" />,
  accident: <Car className="w-5 h-5" />,
  fire: <Flame className="w-5 h-5" />,
  infrastructure: <Building className="w-5 h-5" />,
  'public-safety': <Shield className="w-5 h-5" />,
};

const typeColors: Record<IncidentType, string> = {
  medical: 'text-destructive bg-destructive/10',
  accident: 'text-warning bg-warning/10',
  fire: 'text-destructive bg-destructive/10',
  infrastructure: 'text-info bg-info/10',
  'public-safety': 'text-primary bg-primary/10',
};

export function IncidentCard({ incident, className, index = 0, onVerify }: IncidentCardProps) {
  const { user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const [localVerificationCount, setLocalVerificationCount] = useState(incident.verificationCount || 0);
  const [hasVerified, setHasVerified] = useState(
    user ? incident.verifiedBy?.includes(user.id) || false : false
  );
  
  const timeAgo = formatDistanceToNow(new Date(incident.createdAt || incident.reportedAt || Date.now()), { addSuffix: true });

  const handleVerify = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to verify incidents',
        variant: 'destructive',
      });
      return;
    }

    setIsVerifying(true);
    try {
      const response = await api.post(`/incidents/${incident._id}/verify`);
      const { verificationCount, hasVerified: newHasVerified, action } = response.data;
      
      setLocalVerificationCount(verificationCount);
      setHasVerified(newHasVerified);
      
      toast({
        title: action === 'added' ? 'Verified!' : 'Verification Removed',
        description: action === 'added' 
          ? 'Thank you for confirming this incident' 
          : 'Your verification has been removed',
      });
      
      if (onVerify) {
        onVerify(incident._id, verificationCount, newHasVerified);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to verify incident',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <div
        className={cn(
          'group relative overflow-hidden rounded-xl border border-border bg-card p-4 transition-all duration-300',
          'hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5',
          incident.severity === 'critical' && 'border-destructive/30 bg-destructive/5',
          className
        )}
      >
        {/* Verified Badge */}
        {incident.status === 'verified' && (
          <div className="absolute top-2 right-2 flex items-center gap-1 text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            <span>Verified</span>
          </div>
        )}
        
        {/* Critical Pulse Effect */}
        {incident.severity === 'critical' && incident.status !== 'verified' && (
          <div className="absolute top-2 right-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive" />
            </span>
          </div>
        )}

        <Link to={`/incident/${incident._id}`}>
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className={cn('p-2 rounded-lg', typeColors[incident.type])}>
              {typeIcons[incident.type]}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {incident.title}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{incident.location.address}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {incident.description}
          </p>
        </Link>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SeverityBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {/* Upvote/Verify Button */}
            <Button
              variant={hasVerified ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-7 px-2 gap-1 text-xs",
                hasVerified && "bg-primary text-primary-foreground"
              )}
              onClick={handleVerify}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <ThumbsUp className={cn("w-3 h-3", hasVerified && "fill-current")} />
              )}
              <span>{localVerificationCount}</span>
            </Button>
            
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{timeAgo}</span>
            </div>
            <Link to={`/incident/${incident._id}`}>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
