import { motion } from 'framer-motion';
import { Shield, Users, Zap, Globe, Heart, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="container max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About IncidentHub</h1>
          <p className="text-xl text-muted-foreground">Empowering communities through real-time emergency coordination</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            IncidentHub bridges the gap between citizens and emergency responders. By enabling real-time incident reporting and verification, we reduce response times and save lives. Built during a hackathon with the vision to transform how communities handle emergencies.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Zap, title: 'Fast Response', desc: 'Average 4-minute response time through instant alerts' },
            { icon: Users, title: 'Community Driven', desc: 'Crowdsourced verification ensures accuracy' },
            { icon: Shield, title: 'Always Ready', desc: '24/7 monitoring and coordination' },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="bg-card border border-border rounded-xl p-6 text-center">
              <item.icon className="w-10 h-10 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
          <Award className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-bold mb-2">Hackathon Project</h2>
          <p className="text-muted-foreground">Built with passion to make communities safer. Join us in our mission to save lives faster.</p>
        </motion.div>
      </div>
    </div>
  );
}
