import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Recycle, 
  RefreshCw, 
  Shield, 
  ArrowRight,
  Leaf,
  Factory,
  TrendingUp
} from "lucide-react";

const features = [
  {
    icon: Recycle,
    title: "Ontario Waste Overview",
    description: "Understand what waste is generated in Ontario, from IC&I to residential sectors, and why proper waste handling matters for your business.",
    href: "/learn/waste-overview",
    color: "leaf",
  },
  {
    icon: RefreshCw,
    title: "What Has Changed",
    description: "Learn about Ontario's Extended Producer Responsibility (EPR) shift and what it means for SMEs, producers, and municipalities.",
    href: "/learn/whats-changed",
    color: "sky",
  },
  {
    icon: Shield,
    title: "How We Help",
    description: "Discover how Corecycle helps you train staff, maintain audit-ready records, and reduce contamination risks through evidence-based training.",
    href: "/learn/how-we-help",
    color: "forest",
  },
];

const benefits = [
  {
    icon: Leaf,
    title: "Environmental Impact",
    description: "Reduce contamination and improve recycling rates across Ontario.",
  },
  {
    icon: Factory,
    title: "Operational Excellence",
    description: "Streamline waste management with trained, knowledgeable staff.",
  },
  {
    icon: TrendingUp,
    title: "Compliance Assurance",
    description: "Stay audit-ready with comprehensive training records and certificates.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-4">
            Education Hub
          </span>
          <h2 className="text-3xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Understanding Ontario's
            <span className="text-leaf"> Recycling Landscape</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Before diving into training, understand why proper waste management matters and how regulations have evolved in Ontario.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card variant="feature" className="h-full group">
                <CardContent className="p-8">
                  <div className={`w-14 h-14 rounded-2xl bg-${feature.color}/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`h-7 w-7 text-${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  <Link to={feature.href}>
                    <Button variant="ghost" className="group/btn p-0 h-auto">
                      Learn More
                      <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-secondary/50 rounded-3xl p-8 lg:p-12"
        >
          <div className="grid lg:grid-cols-4 gap-8 items-center">
            <div className="lg:col-span-1">
              <h3 className="text-2xl font-display font-bold text-foreground mb-4">
                Why Choose Corecycle?
              </h3>
              <p className="text-muted-foreground">
                Ontario's trusted platform for EPR training and compliance.
              </p>
            </div>
            <div className="lg:col-span-3 grid sm:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex flex-col items-start"
                >
                  <div className="w-12 h-12 rounded-xl bg-leaf/10 flex items-center justify-center mb-4">
                    <benefit.icon className="h-6 w-6 text-leaf" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">{benefit.title}</h4>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
