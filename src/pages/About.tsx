import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Recycle, 
  Target, 
  Users,
  Award,
  Leaf
} from "lucide-react";

const team = [
  { name: "Sarah Chen", role: "Founder & CEO", description: "15+ years in environmental policy and sustainability." },
  { name: "Michael Torres", role: "Head of Training", description: "Former waste management consultant for Ontario municipalities." },
  { name: "Emily Patel", role: "Technology Lead", description: "Building accessible learning platforms for environmental education." },
];

const About = () => {
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
              className="max-w-3xl mx-auto text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-leaf/10 flex items-center justify-center mx-auto mb-6">
                <Recycle className="h-8 w-8 text-leaf" />
              </div>
              <h1 className="text-4xl lg:text-6xl font-display font-bold text-foreground mb-6">
                About Corecycle
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
                We're on a mission to make Ontario's transition to Extended Producer Responsibility a success by training the people who make it work every day.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission */}
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
                  Our Mission
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                  Corecycle—Recycling Learning Program Ontario—was founded with a simple belief: the success of Ontario's new recycling system depends on people, not just policy.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Extended Producer Responsibility shifts financial responsibility to producers, but the day-to-day work of separating recyclables, reducing contamination, and maintaining clean streams still happens at businesses across the province.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We provide the training, tools, and evidence-collection systems that help SMEs succeed in this new landscape—protecting both the environment and their operations.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="grid grid-cols-2 gap-6"
              >
                {[
                  { icon: Target, label: "Training Ontario businesses for EPR success" },
                  { icon: Users, label: "5,000+ professionals trained" },
                  { icon: Award, label: "100% audit compliance rate" },
                  { icon: Leaf, label: "Measurable environmental impact" },
                ].map((item, index) => (
                  <Card key={item.label} variant="nature">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 rounded-xl bg-leaf/10 flex items-center justify-center mx-auto mb-4">
                        <item.icon className="h-6 w-6 text-leaf" />
                      </div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 lg:py-24 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
                Our Team
              </h2>
              <p className="text-muted-foreground text-lg">
                Environmental experts and technologists working together to build Ontario's leading EPR training platform.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {team.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card variant="default" className="text-center">
                    <CardContent className="p-6">
                      <div className="w-20 h-20 rounded-full bg-leaf/10 flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-display font-bold text-leaf">
                          {member.name.split(" ").map(n => n[0]).join("")}
                        </span>
                      </div>
                      <h3 className="font-display font-semibold text-foreground mb-1">{member.name}</h3>
                      <p className="text-sm text-leaf mb-3">{member.role}</p>
                      <p className="text-sm text-muted-foreground">{member.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
