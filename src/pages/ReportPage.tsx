import { MapComponent } from '@/components/MapComponent';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { IncidentType, incidentTypes } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Building,
  Camera,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Flame,
  Heart,
  Loader2,
  MapPin,
  Shield,
  Upload,
  X
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const typeIcons: Record<IncidentType, React.ReactNode> = {
  medical: <Heart className="w-6 h-6" />,
  accident: <Car className="w-6 h-6" />,
  fire: <Flame className="w-6 h-6" />,
  infrastructure: <Building className="w-6 h-6" />,
  'public-safety': <Shield className="w-6 h-6" />,
};

const steps = [
  { id: 1, title: 'Type', description: 'Select incident type' },
  { id: 2, title: 'Details', description: 'Describe the incident' },
  { id: 3, title: 'Submit', description: 'Review and submit' },
];

export default function ReportPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  // Form state
  const [selectedType, setSelectedType] = useState<IncidentType | null>(
    (searchParams.get('type') as IncidentType) || null
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'critical' | 'high' | 'medium' | 'low'>('medium');
  const [location, setLocation] = useState('');
  const [locationCoords, setLocationCoords] = useState<[number, number]>([77.5946, 12.9716]); // Default: Bangalore
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedType !== null;
      case 2:
        return title.trim().length > 5 && description.trim().length > 10 && location.trim().length > 0;
      default:
        return true;
    }
  };

  const handleAutoDetect = () => {
    setIsLocating(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocationCoords([longitude, latitude]);
          
          // Reverse geocoding using OpenStreetMap Nominatim
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            setLocation(data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          } catch (error) {
            setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
          
          setIsLocating(false);
          toast({
            title: 'Location detected',
            description: 'Your current location has been set.',
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsLocating(false);
          toast({
            title: 'Location Error',
            description: 'Unable to detect your location. Please enter manually.',
            variant: 'destructive',
          });
        }
      );
    } else {
      setIsLocating(false);
      toast({
        title: 'Not Supported',
        description: 'Geolocation is not supported by your browser.',
        variant: 'destructive',
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file));
      setUploadedImages((prev) => [...prev, ...newImages].slice(0, 4));
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to report an incident.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const incidentData = {
        title,
        description,
        type: selectedType,
        severity,
        location: {
          address: location,
          lat: locationCoords[1],
          lng: locationCoords[0],
        },
        media: uploadedImages,
      };

      await api.post('/incidents', incidentData);
      
      toast({
        title: 'Incident Reported Successfully',
        description: 'Emergency services have been notified. Thank you for your report.',
      });
      
      navigate('/feed');
    } catch (error: any) {
      console.error('Submit error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="container max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-emergency mb-4">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Report an Incident</h1>
          <p className="text-muted-foreground">Help us respond faster with accurate information</p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-colors',
                  currentStep === step.id
                    ? 'gradient-primary text-white'
                    : currentStep > step.id
                    ? 'bg-success text-success-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-12 h-1 mx-2 rounded-full transition-colors',
                    currentStep > step.id ? 'bg-success' : 'bg-muted'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg"
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Type Selection */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-semibold mb-2">What type of incident?</h2>
                  <p className="text-sm text-muted-foreground">Select the category that best describes the emergency</p>
                </div>

                <div className="grid gap-3">
                  {incidentTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setSelectedType(type.value)}
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all',
                        selectedType === type.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 hover:bg-accent/50'
                      )}
                    >
                      <div
                        className={cn(
                          'p-3 rounded-lg',
                          selectedType === type.value
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {typeIcons[type.value]}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{type.label}</p>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                      {selectedType === type.value && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-semibold mb-2">Incident Details</h2>
                  <p className="text-sm text-muted-foreground">Provide as much detail as possible</p>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief title for the incident (e.g., 'Fire at Main Street')"
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                  />
                  <p className="text-xs text-muted-foreground">
                    {title.length} characters (minimum 5)
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description *</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what happened, how many people are involved, current situation..."
                    className="min-h-[120px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    {description.length} characters (minimum 10)
                  </p>
                </div>

                {/* Severity */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Severity Level *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['critical', 'high', 'medium', 'low'] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setSeverity(level)}
                        className={cn(
                          'p-3 rounded-lg border-2 text-center capitalize transition-all',
                          severity === level
                            ? level === 'critical'
                              ? 'border-red-500 bg-red-500/10 text-red-500'
                              : level === 'high'
                              ? 'border-orange-500 bg-orange-500/10 text-orange-500'
                              : level === 'medium'
                              ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500'
                              : 'border-blue-500 bg-blue-500/10 text-blue-500'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter address or landmark"
                      className="flex-1 px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                    />
                    <Button
                      variant="outline"
                      onClick={handleAutoDetect}
                      disabled={isLocating}
                    >
                      {isLocating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <MapPin className="w-4 h-4 mr-2" />
                          Detect
                        </>
                      )}
                    </Button>
                  </div>
                  <MapComponent
                    className="mt-3"
                    height="300px"
                    center={locationCoords}
                    zoom={15}
                    showMarker={!!location}
                    markerPosition={locationCoords}
                    onMapClick={(coords) => {
                      setLocationCoords(coords);
                      setLocation(`${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`);
                    }}
                  />
                </div>

                {/* Media Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Photos (Optional)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {uploadedImages.map((img, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {uploadedImages.length < 4 && (
                      <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <Camera className="w-6 h-6" />
                        <span className="text-xs">Add Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-semibold mb-2">Review & Submit</h2>
                  <p className="text-sm text-muted-foreground">Please verify the information before submitting</p>
                </div>

                <div className="space-y-4 p-4 rounded-xl bg-muted/50">
                  {/* Type & Severity */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {selectedType && typeIcons[selectedType]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Incident Type</p>
                      <p className="font-medium">
                        {incidentTypes.find((t) => t.value === selectedType)?.label}
                      </p>
                    </div>
                    <div className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium capitalize',
                      severity === 'critical' ? 'bg-red-500/10 text-red-500' :
                      severity === 'high' ? 'bg-orange-500/10 text-orange-500' :
                      severity === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-blue-500/10 text-blue-500'
                    )}>
                      {severity}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Title</p>
                    <p className="font-medium">{title}</p>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{description}</p>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{location}</p>
                    </div>
                  </div>

                  {/* Photos */}
                  {uploadedImages.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Attached Photos</p>
                      <div className="flex gap-2">
                        {uploadedImages.map((img, index) => (
                          <div key={index} className="w-16 h-16 rounded-lg overflow-hidden">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
                  <p className="text-sm text-warning font-medium">
                    ⚠️ Important: False reports may be subject to legal action. Please ensure all information is accurate.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep < 3 ? (
              <Button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                disabled={!canProceed()}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gradient-emergency"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Submit Report
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
