import { cn } from '@/lib/utils';
import { MapPin, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface MapPlaceholderProps {
  className?: string;
  showPin?: boolean;
  loading?: boolean;
  address?: string;
}

export function MapPlaceholder({ className, showPin = true, loading = false, address }: MapPlaceholderProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border border-border bg-muted/50',
        className
      )}
    >
      {/* Map Grid Pattern */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-info/5" />

      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Pin Marker */}
      {showPin && !loading && (
        <motion.div
          initial={{ scale: 0, y: -20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full"
        >
          <div className="relative">
            <MapPin className="w-10 h-10 text-destructive drop-shadow-lg" fill="currentColor" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-4 h-1 bg-foreground/20 rounded-full blur-sm" />
          </div>
        </motion.div>
      )}

      {/* Address Label */}
      {address && (
        <div className="absolute bottom-3 left-3 right-3">
          <div className="glass px-3 py-2 rounded-md text-sm text-muted-foreground truncate">
            {address}
          </div>
        </div>
      )}

      {/* Map Placeholder Text */}
      {!address && !loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Interactive map view</p>
        </div>
      )}
    </div>
  );
}
