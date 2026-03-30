import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  FileCheck, 
  ClipboardList, 
  Shield,
  ArrowRight,
  CheckCircle,
  Award,
  BarChart3,
  Users,
  Download
} from "lucide-react";

const coreFeatures = [
  {
    icon: GraduationCap,
    title: "Staff Training",
    description: "Ontario-specific training modules covering waste management, recycling best practices, and EPR requirements.",
    features: ["Interactive modules", "Video content", "Knowledge quizzes", "Progress tracking"],
  },
  {
    icon: FileCheck,
    title: "Proof of Training",
    description: "Generate audit-ready certificates and training records that document exactly who was trained, when, and on what topics.",
    features: ["Digital certificates", "QR verification", "Completion timestamps", "Version tracking"],
  },
  {
    icon: ClipboardList,
    title: "Audit Support",
    description: "Comprehensive reporting tools to demonstrate compliance during audits, inspections, and reviews.",
    features: ["Training summaries", "Compliance reports", "CSV exports", "API access"],
  },
  {
    icon: Shield,
    title: "Contamination Reduction",
    description: "Track behavior changes and gather evidence of improved recycling practices across your organization.",
    features: ["Self-reporting tools", "Photo evidence", "Trend analysis", "Site comparisons"],
  },
];

const benefits = [
  "Reduce risk during regulatory audits",
  "Demonstrate environmental commitment",
  "Train multiple locations consistently",
  "Track staff progress in real-time",
  "Generate compliance certificates instantly",
  "Export data for external reporting",
];

const HowWeHelp = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 lg:pt-32">
        {/* Hero */}
        <section className="py-16 lg:py-24 nature-gradient">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-forest/10 text-forest text-sm font-medium mb-4">
                Learn
              </span>
              <h1 className="text-4xl lg:text-6xl font-display font-bold text-foreground mb-6">
                How Corecycle Helps Your Business
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
                From training to certification, from evidence collection to audit reporting—Corecycle provides everything Ontario businesses need to succeed in the new EPR landscape.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Core Features */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-6">
                Complete Training & Compliance Platform
              </h2>
              <p className="text-muted-foreground text-lg">
                Four key pillars that work together to keep your business compliant and your staff well-trained.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {coreFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card variant="feature" className="h-full">
                    <CardContent className="p-8">
                      <div className="w-14 h-14 rounded-2xl bg-leaf/10 flex items-center justify-center mb-6">
                        <feature.icon className="h-7 w-7 text-leaf" />
                      </div>
                      <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {feature.description}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {feature.features.map((item) => (
                          <div key={item} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-leaf" />
                            <span className="text-foreground">{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 lg:py-24 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-6">
                How It Works
              </h2>
              <p className="text-muted-foreground text-lg">
                Get started in minutes and have your first staff members trained the same day.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: "1", title: "Register", description: "Create your business account and add your company details.", icon: Users },
                { step: "2", title: "Invite Staff", description: "Add team members by email with their roles and locations.", icon: Users },
                { step: "3", title: "Complete Training", description: "Staff complete Ontario-specific recycling training at their own pace.", icon: GraduationCap },
                { step: "4", title: "Get Certified", description: "Download certificates and generate audit-ready reports.", icon: Award },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-forest text-primary-foreground flex items-center justify-center mx-auto mb-4 text-2xl font-display font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-6">
                  Benefits for Your Business
                </h2>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  Corecycle isn't just about compliance—it's about building a culture of environmental responsibility that benefits your business, your community, and the planet.
                </p>
                
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  {benefits.map((benefit) => (
                    <div key={benefit} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-leaf flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>

                <Link to="/auth?mode=register&type=sme">
                  <Button variant="forest" size="lg">
                    Register Your Business
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card variant="elevated">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-display font-semibold text-foreground mb-6">
                      What You Get
                    </h3>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-leaf/10 flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="h-5 w-5 text-leaf" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">LMS Access</h4>
                          <p className="text-sm text-muted-foreground">Full access to all Ontario-specific training courses and modules.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-leaf/10 flex items-center justify-center flex-shrink-0">
                          <Award className="h-5 w-5 text-leaf" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">Certificates</h4>
                          <p className="text-sm text-muted-foreground">Printable PDF certificates with QR verification for each completion.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-leaf/10 flex items-center justify-center flex-shrink-0">
                          <BarChart3 className="h-5 w-5 text-leaf" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">Reports</h4>
                          <p className="text-sm text-muted-foreground">Comprehensive training reports and behavior change tracking.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-leaf/10 flex items-center justify-center flex-shrink-0">
                          <Download className="h-5 w-5 text-leaf" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">Data Export</h4>
                          <p className="text-sm text-muted-foreground">CSV exports and API access for integration with your systems.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HowWeHelp;
