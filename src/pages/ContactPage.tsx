import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, AlertTriangle, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    toast({ title: 'Message Sent', description: 'We\'ll get back to you soon.' });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="container max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contact & Support</h1>
          <p className="text-muted-foreground">Get help or send us feedback</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-destructive mb-1">Emergency Disclaimer</h3>
              <p className="text-sm text-muted-foreground">For life-threatening emergencies, always call 911 first. This platform supplements but does not replace emergency services.</p>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
            <h2 className="text-xl font-semibold">Contact Information</h2>
            {[
              { icon: Phone, label: 'Emergency', value: '911' },
              { icon: Mail, label: 'Email', value: 'support@incidenthub.app' },
              { icon: MapPin, label: 'Location', value: 'San Francisco, CA' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl">
                <item.icon className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold">Send Feedback</h2>
            <input type="text" placeholder="Your Name" required className="w-full px-4 py-2 rounded-lg border border-input bg-background" />
            <input type="email" placeholder="Email Address" required className="w-full px-4 py-2 rounded-lg border border-input bg-background" />
            <Textarea placeholder="Your message..." required className="min-h-[120px]" />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Send Message
            </Button>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
