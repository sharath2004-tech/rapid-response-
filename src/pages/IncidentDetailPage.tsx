import { MapComponent } from '@/components/MapComponent';
import { Button } from '@/components/ui/button';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { Incident, IncidentType } from '@/types/incident';
import { format, formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    ArrowLeft,
    Building,
    Car,
    CheckCircle2,
    Clock,
    Flame,
    Heart,
    Image as ImageIcon,
    Loader2,
    MapPin,
    Share2,
    Shield,
    ThumbsUp,
    Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const typeIcons: Record<IncidentType, React.ReactNode> = {
  medical: <Heart className="w-6 h-6" />,
  accident: <Car className="w-6 h-6" />,
  fire: <Flame className="w-6 h-6" />,
  infrastructure: <Building className="w-6 h-6" />,
  'public-safety': <Shield className="w-6 h-6" />,
};

const typeLabels: Record<IncidentType, string> = {
  medical: 'Medical Emergency',
  accident: 'Accident',
  fire: 'Fire',
  infrastructure: 'Infrastructure',
  'public-safety': 'Public Safety',
};

export default function IncidentDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasVerified, setHasVerified] = useState(false);

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        const response = await api.get(`/incidents/${id}`);
        setIncident(response.data.incident);
        
        // Check if current user has verified
        if (user && response.data.incident.verifiedBy) {
          setHasVerified(response.data.incident.verifiedBy.includes(user.id));
        }
      } catch (error) {
        console.error('Fetch incident error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchIncident();
    }
  }, [id, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Incident Not Found</h1>
          <p className="text-muted-foreground mb-4">The incident you're looking for doesn't exist.</p>
          <Link to="/feed">
            <Button>View All Incidents</Button>
          </Link>
        </div>
      </div>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(incident.createdAt || Date.now()), { addSuffix: true });

  const handleVerify = async () => {
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
      const response = await api.post(`/incidents/${id}/verify`);
      const { verificationCount, hasVerified: newHasVerified, action, status } = response.data;
      
      setIncident(prev => prev ? {
        ...prev,
        verificationCount,
        status
      } : null);
      setHasVerified(newHasVerified);
      
      toast({
        title: action === 'added' ? 'Verified!' : 'Verification Removed',
        description: action === 'added' 
          ? 'Thank you for confirming this incident.' 
          : 'Your verification has been removed.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to verify incident.',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: 'Link Copied',
      description: 'Incident link copied to clipboard.',
    });
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      {/* Header */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/feed" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Feed</span>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button 
                size="sm" 
                onClick={handleVerify}
                disabled={isVerifying}
                variant={hasVerified ? "default" : "outline"}
                className={cn(
                  hasVerified && "bg-primary text-primary-foreground"
                )}
              >
                {isVerifying ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ThumbsUp className={cn("w-4 h-4 mr-2", hasVerified && "fill-current")} />
                )}
                {hasVerified ? 'Verified ✓' : 'Verify Incident'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              {/* Type & Severity */}
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  'p-3 rounded-xl',
                  incident.severity === 'critical' ? 'bg-destructive/10 text-destructive' :
                  incident.severity === 'high' ? 'bg-warning/10 text-warning' :
                  incident.severity === 'medium' ? 'bg-info/10 text-info' : 'bg-success/10 text-success'
                )}>
                  {typeIcons[incident.type]}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{typeLabels[incident.type]}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <SeverityBadge severity={incident.severity} />
                    <StatusBadge status={incident.status} />
                  </div>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold mb-4">{incident.title}</h1>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">{incident.description}</p>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Reported {timeAgo}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{incident.location.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{incident.verificationCount} verifications</span>
                </div>
              </div>
            </motion.div>

            {/* Media Gallery */}
            {incident.media && incident.media.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Media Gallery
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {incident.media.map((img, index) => (
                    <div key={index} className="aspect-video rounded-lg overflow-hidden bg-muted">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <h2 className="text-lg font-semibold mb-4">Status Timeline</h2>
              <div className="space-y-4">
                {incident.timeline && incident.timeline.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'w-3 h-3 rounded-full',
                        index === 0 ? 'bg-primary' : 'bg-muted-foreground/30'
                      )} />
                      {index < incident.timeline.length - 1 && (
                        <div className="w-0.5 flex-1 bg-border mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium text-sm">{event.event}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{format(new Date(event.time), 'MMM d, h:mm a')}</span>
                        {event.user && <span>• {event.user}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Location Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Location
                </h2>
              </div>
              <div className="h-64">
                <MapComponent
                  height="100%"
                  center={[incident.location.lng, incident.location.lat]}
                  zoom={15}
                  showMarker={true}
                  markerPosition={[incident.location.lng, incident.location.lat]}
                />
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground">{incident.location.address}</p>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${incident.location.lat},${incident.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 text-sm text-primary hover:underline"
                >
                  Get Directions
                </a>
              </div>
            </motion.div>

            {/* Reporter Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-2xl p-4"
            >
              <h2 className="font-semibold mb-3">Reported By</h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Users className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{incident.reportedByName || 'Anonymous'}</p>
                  <p className="text-xs text-muted-foreground">Community Reporter</p>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-2xl p-4"
            >
              <h2 className="font-semibold mb-3">Quick Actions</h2>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={handleVerify} disabled={isVerifying}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Verify This Incident
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Incident
                </Button>
                <a href="tel:112" className="block">
                  <Button variant="destructive" className="w-full justify-start">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Call Emergency (112)
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
