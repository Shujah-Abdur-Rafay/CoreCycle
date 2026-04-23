import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { 
  RefreshCw, 
  Building2, 
  Factory, 
  Users,
  ArrowRight,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

const timeline = [
  {
    year: "Before 2023",
    title: "Traditional Model",
    description: "Municipalities and businesses bore the cost of recycling collection and processing. SMEs paid directly for waste services.",
  },
  {
    year: "2023-2025",
    title: "Transition Period",
    description: "Ontario shifted to Extended Producer Responsibility (EPR), gradually transferring recycling costs from municipalities to producers.",
  },
  {
    year: "2026+",
    title: "Full EPR",
    description: "Producers are now fully responsible for the end-of-life management of their products and packaging.",
  },
];

const producerResponsibilities = [
  "Funding collection and recycling programs",
  "Meeting recycling targets set by the province",
  "Managing producer responsibility organizations (PROs)",
  "Reporting on materials put into the market",
  "Ensuring proper end-of-life handling of products",
];

const smeResponsibilities = [
  "Properly separating recyclables from garbage",
  "Reducing contamination in recycling streams",
  "Training staff on waste management practices",
  "Participating in available recycling programs",
  "Maintaining records of waste diversion efforts",
];

const WhatsChanged = () => {
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
              <span className="inline-block px-4 py-1.5 rounded-full bg-sky/10 text-sky text-sm font-medium mb-4">
                Learn
              </span>
              <h1 className="text-4xl lg:text-6xl font-display font-bold text-foreground mb-6">
                What Has Changed in Ontario
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
                Ontario has fundamentally changed how recycling is managed and funded. Here's what Extended Producer Responsibility means for your business.
              </p>
            </motion.div>
          </div>
        </section>

        {/* What is EPR */}
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
                  What is Extended Producer Responsibility?
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                  Extended Producer Responsibility (EPR) is a policy approach that makes producers (manufacturers, brand owners, and importers) responsible for the entire lifecycle of their products—including collection, recycling, and disposal.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  This represents a fundamental shift from the old model where municipalities and consumers bore most recycling costs. Under EPR, the companies that put products and packaging into the market must pay for and manage their end-of-life handling.
                </p>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-sky/10 border border-sky/20">
                  <RefreshCw className="h-6 w-6 text-sky flex-shrink-0" />
                  <p className="text-sm text-foreground">
                    <strong>The Goal:</strong> Create incentives for producers to design more recyclable products and reduce packaging waste.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card variant="elevated" className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-8 bg-forest text-primary-foreground">
                      <h3 className="text-xl font-display font-semibold mb-2">The Shift in a Nutshell</h3>
                      <p className="text-primary-foreground/80">
                        From taxpayer-funded recycling to producer-funded systems
                      </p>
                    </div>
                    <div className="p-8 space-y-6">
                      {timeline.map((item, index) => (
                        <div key={item.year} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-leaf/10 flex items-center justify-center text-sm font-bold text-leaf">
                              {index + 1}
                            </div>
                            {index < timeline.length - 1 && (
                              <div className="w-0.5 h-full bg-border mt-2" />
                            )}
                          </div>
                          <div className="pb-6">
                            <span className="text-sm font-medium text-leaf">{item.year}</span>
                            <h4 className="font-semibold text-foreground">{item.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Responsibilities */}
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
                Who Is Responsible for What?
              </h2>
              <p className="text-muted-foreground text-lg">
                While producers now bear the financial responsibility, SMEs still play a critical role in making recycling work.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Card variant="feature" className="h-full">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 rounded-2xl bg-forest/10 flex items-center justify-center mb-6">
                      <Factory className="h-7 w-7 text-forest" />
                    </div>
                    <h3 className="text-2xl font-display font-semibold text-foreground mb-6">
                      Producers Are Now Responsible For:
                    </h3>
                    <ul className="space-y-4">
                      {producerResponsibilities.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-leaf flex-shrink-0 mt-0.5" />
                          <span className="text-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card variant="feature" className="h-full">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 rounded-2xl bg-sky/10 flex items-center justify-center mb-6">
                      <Building2 className="h-7 w-7 text-sky" />
                    </div>
                    <h3 className="text-2xl font-display font-semibold text-foreground mb-6">
                      SMEs Are Still Expected To:
                    </h3>
                    <ul className="space-y-4">
                      {smeResponsibilities.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-sky flex-shrink-0 mt-0.5" />
                          <span className="text-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Why Behavior Still Matters */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-start gap-4 p-6 rounded-xl bg-warning/10 border border-warning/30 mb-12">
                <AlertTriangle className="h-6 w-6 text-warning flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Important Note</h3>
                  <p className="text-muted-foreground">
                    Even though producers now fund recycling, contamination and poor separation practices can still result in materials being sent to landfill. Your behavior matters.
                  </p>
                </div>
              </div>

              <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-6">
                Why Staff Behavior Still Affects Outcomes
              </h2>
              
              <div className="prose prose-lg max-w-none text-muted-foreground">
                <p className="leading-relaxed mb-6">
                  The shift to EPR doesn't mean SMEs can stop caring about waste management. In fact, operational behavior is more important than ever because:
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 not-prose mb-8">
                  <Card variant="outline">
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-foreground mb-2">Contamination Ruins Recycling</h4>
                      <p className="text-sm text-muted-foreground">
                        A single contaminated load can cause an entire batch of recyclables to be landfilled, wasting resources and effort.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card variant="outline">
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-foreground mb-2">Service Quality Depends on You</h4>
                      <p className="text-sm text-muted-foreground">
                        Haulers may refuse service or charge penalties for contaminated bins, affecting your operations and reputation.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card variant="outline">
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-foreground mb-2">Audits May Increase</h4>
                      <p className="text-sm text-muted-foreground">
                        With greater scrutiny on recycling outcomes, businesses may face more frequent audits and inspections.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card variant="outline">
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-foreground mb-2">Reputation Matters</h4>
                      <p className="text-sm text-muted-foreground">
                        Customers increasingly expect businesses to demonstrate environmental responsibility.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <p className="leading-relaxed">
                  This is why training, proper separation, and contamination reduction remain critical—and why OntreCycle exists to help Ontario SMEs succeed in this new landscape.
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default WhatsChanged;
