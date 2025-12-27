import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { incidentTypes } from '@/types/incident';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    ArrowRight,
    Building,
    Car,
    CheckCircle,
    ChevronRight,
    Clock,
    Flame,
    Heart,
    Radio,
    Shield,
    Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

const typeIcons: Record<string, React.ReactNode> = {
  medical: <Heart className="w-8 h-8" />,
  accident: <Car className="w-8 h-8" />,
  fire: <Flame className="w-8 h-8" />,
  infrastructure: <Building className="w-8 h-8" />,
  'public-safety': <Shield className="w-8 h-8" />,
};

const typeGradients: Record<string, string> = {
  medical: 'from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30',
  accident: 'from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30',
  fire: 'from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30',
  infrastructure: 'from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30',
  'public-safety': 'from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30',
};

const typeTextColors: Record<string, string> = {
  medical: 'text-red-500',
  accident: 'text-amber-500',
  fire: 'text-orange-500',
  infrastructure: 'text-blue-500',
  'public-safety': 'text-indigo-500',
};

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-72 h-72 bg-destructive/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
              </span>
              Real-Time Emergency Response Platform
            </motion.div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
              Report Emergencies in Real Time.{' '}
              <span className="text-gradient-emergency">Save Lives Faster.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Connect citizens with emergency responders instantly. Report incidents, track responses, 
              and coordinate resources in real-time.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link to="/report">
                    <Button size="lg" className="gradient-emergency text-primary-foreground shadow-lg shadow-destructive/25 hover:shadow-destructive/40 transition-all group">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Report an Incident
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/feed">
                    <Button size="lg" variant="outline" className="group">
                      <Radio className="w-5 h-5 mr-2" />
                      View Live Feed
                      <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/signup">
                    <Button size="lg" className="gradient-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all group">
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline" className="group">
                      Sign In
                      <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto"
          >
            {[
              { icon: Zap, label: 'Fast Response', value: '< 5 min', color: 'text-warning' },
              { icon: Radio, label: 'Active Now', value: 'Live', color: 'text-destructive' },
              { icon: CheckCircle, label: 'Verified', value: '99.5%', color: 'text-success' },
              { icon: Clock, label: '24/7 Ready', value: 'Always', color: 'text-info' },
            ].map((stat, index) => (
              <div
                key={index}
                className="glass-light p-6 rounded-2xl text-center hover:shadow-lg transition-all group"
              >
                <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Incident Categories */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Report by Category</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Quick access to report different types of incidents. Each category is handled by specialized response teams.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {incidentTypes.map((type, index) => (
              <motion.div
                key={type.value}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/report?type=${type.value}`}>
                  <div
                    className={`group relative p-6 rounded-2xl bg-gradient-to-br ${typeGradients[type.value]} border border-border/50 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1`}
                  >
                    <div className={`${typeTextColors[type.value]} mb-4`}>
                      {typeIcons[type.value]}
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{type.label}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{type.description}</p>
                    <ChevronRight className="absolute top-4 right-4 w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl gradient-emergency p-8 md:p-12 text-center"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '24px 24px'
              }} />
            </div>

            <div className="relative">
              <AlertTriangle className="w-16 h-16 mx-auto mb-6 text-white/90" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                See Something? Report It.
              </h2>
              <p className="text-white/80 max-w-xl mx-auto mb-8">
                Every second counts in an emergency. Your report could save lives. 
                Join thousands of citizens making their community safer.
              </p>
              {isAuthenticated ? (
                <Link to="/report">
                  <Button size="lg" variant="secondary" className="shadow-xl group">
                    Report Now
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <Link to="/signup">
                  <Button size="lg" variant="secondary" className="shadow-xl group">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
