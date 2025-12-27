import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check, Loader2, MapPin, Phone, X } from 'lucide-react';
import { useState } from 'react';

interface SOSButtonProps {
  className?: string;
}

export function SOSButton({ className }: SOSButtonProps) {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const detectLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            setLocation({
              lat: latitude,
              lng: longitude,
              address: data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            });
          } catch {
            setLocation({
              lat: latitude,
              lng: longitude,
              address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            });
          }
          setIsLocating(false);
        },
        () => {
          toast({
            title: 'Location Error',
            description: 'Unable to detect your location.',
            variant: 'destructive',
          });
          setIsLocating(false);
        }
      );
    }
  };

  const handleOpenSOS = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to use SOS feature.',
        variant: 'destructive',
      });
      return;
    }
    setIsOpen(true);
    detectLocation();
  };

  const handleTriggerSOS = async () => {
    if (!location) {
      toast({
        title: 'Location Required',
        description: 'Please wait for location detection.',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    try {
      const response = await api.post('/sos/trigger', {
        location: {
          lat: location.lat,
          lng: location.lng,
          address: location.address
        },
        alertType: 'sos'
      });

      setIsSuccess(true);
      toast({
        title: '🚨 SOS Alert Sent!',
        description: `Emergency services and ${response.data.contactsNotified} contacts have been notified.`,
      });

      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
      }, 3000);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send SOS alert.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Floating SOS Button */}
      <motion.button
        onClick={handleOpenSOS}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full',
          'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/50',
          'flex items-center justify-center transition-all',
          'hover:scale-110 active:scale-95',
          className
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ boxShadow: ['0 0 0 0 rgba(239, 68, 68, 0.7)', '0 0 0 20px rgba(239, 68, 68, 0)'] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <span className="text-xl font-bold">SOS</span>
      </motion.button>

      {/* SOS Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-card rounded-2xl p-6 shadow-2xl border border-border"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {isSuccess ? (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-4"
                  >
                    <Check className="w-10 h-10 text-green-500" />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-2">SOS Alert Sent!</h2>
                  <p className="text-muted-foreground">Help is on the way.</p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center mb-4 animate-pulse">
                      <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Emergency SOS</h2>
                    <p className="text-muted-foreground">
                      This will alert emergency services and your emergency contacts.
                    </p>
                  </div>

                  {/* Location Info */}
                  <div className="bg-muted/50 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Your Location</p>
                        {isLocating ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Detecting location...
                          </div>
                        ) : location ? (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {location.address}
                          </p>
                        ) : (
                          <p className="text-sm text-red-500">Location not available</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={handleTriggerSOS}
                      disabled={isSending || isLocating || !location}
                      className="w-full h-14 text-lg bg-red-600 hover:bg-red-700"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Sending SOS...
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-5 h-5 mr-2" />
                          SEND SOS ALERT
                        </>
                      )}
                    </Button>

                    <a
                      href="tel:112"
                      className="flex items-center justify-center gap-2 w-full h-12 rounded-lg border border-border hover:bg-muted transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      Call 112 (Emergency)
                    </a>
                  </div>

                  <p className="text-xs text-center text-muted-foreground mt-4">
                    ⚠️ False alerts may be subject to legal action
                  </p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
