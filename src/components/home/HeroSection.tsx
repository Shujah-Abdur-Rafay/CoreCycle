import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, PlayCircle } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  "Ontario-specific training content",
  "Audit-ready documentation",
  "Certificate generation",
  "Track staff progress",
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient" />
      <div 
        className="absolute inset-0 opacity-20 mix-blend-overlay"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-leaf/20 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-forest-light/20 rounded-full blur-3xl animate-pulse-soft" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24 lg:pt-32">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 text-primary-foreground/90 text-sm font-medium mb-6 backdrop-blur-sm border border-primary-foreground/20">
              <span className="w-2 h-2 bg-leaf-light rounded-full animate-pulse" />
              Ontario's Leading EPR Training Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold text-primary-foreground leading-tight mb-6"
          >
            Master Ontario's
            <br />
            <span className="text-leaf-light">Recycling Standards</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            Comprehensive training for individuals and SMEs to meet Ontario's Extended Producer Responsibility requirements. Get audit-ready with our evidence-based learning platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Link to="/auth?mode=register">
              <Button variant="hero" size="xl">
                Start Learning Free
                <ArrowRight className="h-5 w-5 ml-1" />
              </Button>
            </Link>
            <Link to="/courses">
              <Button variant="hero-outline" size="xl">
                <PlayCircle className="h-5 w-5 mr-1" />
                Browse Courses
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
          >
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-primary-foreground/80">
                <CheckCircle className="h-5 w-5 text-leaf-light" />
                <span className="text-sm font-medium">{feature}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 lg:mt-24 max-w-4xl mx-auto"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            {[
              { value: "5,000+", label: "Trained Professionals" },
              { value: "500+", label: "SMEs Certified" },
              { value: "98%", label: "Completion Rate" },
              { value: "100%", label: "Audit Compliance" },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center p-4 lg:p-6 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20"
              >
                <div className="text-2xl lg:text-3xl font-display font-bold text-primary-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-primary-foreground/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center p-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-primary-foreground/60"
          />
        </div>
      </motion.div>
    </section>
  );
}
