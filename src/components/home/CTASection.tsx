import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, User } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl hero-gradient p-8 lg:p-16"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-leaf-light/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-forest-dark/20 rounded-full blur-3xl" />

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-display font-bold text-primary-foreground mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg lg:text-xl text-primary-foreground/80 mb-10 leading-relaxed">
              Join thousands of Ontario businesses and individuals who have already completed their EPR training and are audit-ready.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 max-w-xl mx-auto">
              <Link to="/auth?mode=register&type=individual" className="block">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-2xl p-6 text-left hover:bg-primary-foreground/20 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center mb-4">
                    <User className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary-foreground mb-2">
                    Individual Learner
                  </h3>
                  <p className="text-sm text-primary-foreground/70 mb-4">
                    Personal training and certification for career development.
                  </p>
                  <div className="flex items-center text-sm font-medium text-leaf-light">
                    Get Started <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </motion.div>
              </Link>

              <Link to="/auth?mode=register&type=sme" className="block">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-2xl p-6 text-left hover:bg-primary-foreground/20 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center mb-4">
                    <Building2 className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary-foreground mb-2">
                    SME / Business
                  </h3>
                  <p className="text-sm text-primary-foreground/70 mb-4">
                    Train your team and generate audit-ready compliance reports.
                  </p>
                  <div className="flex items-center text-sm font-medium text-leaf-light">
                    Register Business <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </motion.div>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
