import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, MapPin, BarChart3, FileCheck, Award, ArrowRight, CheckCircle, Shield, Download } from "lucide-react";
const features = [{
  icon: Users,
  title: "Team Management",
  description: "Invite unlimited staff members, assign roles, and track their training progress from a central dashboard."
}, {
  icon: MapPin,
  title: "Multi-Location Support",
  description: "Manage multiple sites and locations. Generate compliance reports per location or across your entire organization."
}, {
  icon: FileCheck,
  title: "Audit-Ready Records",
  description: "Every training completion is logged with timestamps, versions, and certificate IDs—ready for any audit or inspection."
}, {
  icon: BarChart3,
  title: "Behavior Change Tracking",
  description: "Monthly self-reports capture recycling compliance, contamination incidents, and participation rates."
}, {
  icon: Award,
  title: "Certificates & Verification",
  description: "Generate printable PDF certificates with QR codes for instant verification of training completion."
}, {
  icon: Download,
  title: "Data Export & API",
  description: "Export all data via CSV or access through our REST API for integration with your existing systems."
}];
const benefits = ["Demonstrate compliance to regulators and auditors", "Reduce contamination and improve recycling rates", "Train staff consistently across all locations", "Generate location-specific compliance certificates", "Track behavior change over time with evidence", "Integrate with producer program reporting requirements"];
const ForSMEs = () => {
  return <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 lg:pt-32">
        {/* Hero */}
        <section className="py-16 lg:py-24 hero-gradient">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.6
            }}>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 text-primary-foreground/90 text-sm font-medium mb-6 backdrop-blur-sm border border-primary-foreground/20">
                  <Building2 className="h-4 w-4" />
                  For SMEs & Businesses
                </span>
                <h1 className="text-4xl lg:text-6xl font-display font-bold text-primary-foreground mb-6">
                  Train Your Team,
                  <br />Stay Audit-Ready
                </h1>
                <p className="text-lg lg:text-xl text-primary-foreground/80 mb-8 leading-relaxed">
                  The complete platform for Ontario SMEs to train staff, track compliance, and generate audit-ready evidence for recycling and waste management.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/auth?mode=register&type=sme">
                    <Button variant="hero" size="xl">
                      Register Your Business
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/courses">
                    <Button variant="hero-outline" size="lg">
                      View Courses
                    </Button>
                  </Link>
                </div>
              </motion.div>

              <motion.div initial={{
              opacity: 0,
              x: 20
            }} animate={{
              opacity: 1,
              x: 0
            }} transition={{
              duration: 0.6,
              delay: 0.2
            }} className="hidden lg:block">
                <Card className="bg-primary-foreground/10 backdrop-blur-md border-primary-foreground/20">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-display font-semibold text-primary-foreground mb-6">
                      What You'll Get
                    </h3>
                    <div className="space-y-4">
                      {["Unlimited staff training", "Multi-location management", "Certificate generation", "Behavior change tracking", "Audit-ready reports", "CSV & API data export"].map(item => <div key={item} className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-leaf-light" />
                          <span className="text-primary-foreground">{item}</span>
                        </div>)}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6
          }} className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
                Everything Your Business Needs
              </h2>
              <p className="text-muted-foreground text-lg">
                A complete platform built specifically for Ontario SMEs to manage training, compliance, and reporting.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => <motion.div key={feature.title} initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6,
              delay: index * 0.1
            }}>
                  <Card variant="feature" className="h-full">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-leaf/10 flex items-center justify-center mb-4">
                        <feature.icon className="h-6 w-6 text-leaf" />
                      </div>
                      <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>)}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 lg:py-24 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{
              opacity: 0,
              x: -20
            }} whileInView={{
              opacity: 1,
              x: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6
            }}>
                <span className="inline-block px-4 py-1.5 rounded-full bg-forest/10 text-forest text-sm font-medium mb-4">
                  Why Choose OntreCycle
                </span>
                <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-6">
                  Benefits for Your Business
                </h2>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  OntreCycle helps Ontario businesses stay compliant, reduce waste management costs, and demonstrate environmental leadership.
                </p>
                
                <div className="space-y-4">
                  {benefits.map(benefit => <div key={benefit} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-leaf flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{benefit}</span>
                    </div>)}
                </div>
              </motion.div>

              <motion.div initial={{
              opacity: 0,
              x: 20
            }} whileInView={{
              opacity: 1,
              x: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6,
              delay: 0.1
            }}>
                <Card variant="elevated">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-forest flex items-center justify-center">
                        <Shield className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-foreground">PRO and Producer Audit Ready</h3>
                        <p className="text-sm text-muted-foreground">Complete documentation at your fingertips</p>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      Every audit asks the same questions: Who was trained? When? On what topics? What version of the training did they complete? OntreCycle answers all of these automatically.
                    </p>

                    <div className="p-4 rounded-xl bg-secondary">
                      <h4 className="font-medium text-foreground mb-3">Tracked for every learner:</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {["Name & role", "Company & SME ID", "Location/site", "Course completed", "Module versions", "Time spent", "Quiz scores", "Certificate ID"].map(item => <div key={item} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-leaf" />
                            <span className="text-muted-foreground">{item}</span>
                          </div>)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6
          }} className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Join hundreds of Ontario businesses already using OntreCycle for their recycling training and compliance needs.
              </p>
              <Link to="/auth?mode=register&type=sme">
                <Button variant="forest" size="xl">
                  Register Your Business
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>;
};
export default ForSMEs;