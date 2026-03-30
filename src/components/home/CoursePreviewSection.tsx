import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  BookOpen, 
  Award, 
  ArrowRight,
  CheckCircle,
  Users
} from "lucide-react";

const featuredCourse = {
  title: "Waste Generation, Recycling, and New Recycling Rules in Ontario",
  description: "The complete guide to understanding Ontario's waste management landscape, EPR requirements, and practical actions for SMEs.",
  modules: [
    "Waste Generation in Ontario",
    "Recycling Basics for SMEs",
    "What Has Changed – Ontario's New Recycling Rules",
    "Practical Actions for SMEs",
    "Knowledge Check & Certification",
  ],
  duration: "2-3 hours",
  enrolled: "1,200+",
  certification: true,
};

export function CoursePreviewSection() {
  return (
    <section className="py-20 lg:py-32 nature-gradient">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-leaf/10 text-leaf text-sm font-medium mb-4">
            Featured Course
          </span>
          <h2 className="text-3xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Start Your Journey Today
          </h2>
          <p className="text-lg text-muted-foreground">
            Our flagship Ontario recycling course covers everything your business needs to know about waste management and EPR compliance.
          </p>
        </motion.div>

        {/* Course Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-5xl mx-auto"
        >
          <Card variant="elevated" className="overflow-hidden">
            <div className="grid lg:grid-cols-2">
              {/* Left - Course Info */}
              <CardContent className="p-8 lg:p-12">
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge className="bg-leaf/10 text-leaf hover:bg-leaf/20">
                    Required Training
                  </Badge>
                  <Badge variant="outline">Ontario Certified</Badge>
                </div>
                
                <h3 className="text-2xl lg:text-3xl font-display font-bold text-foreground mb-4">
                  {featuredCourse.title}
                </h3>
                
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  {featuredCourse.description}
                </p>

                <div className="flex flex-wrap gap-6 mb-8">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-5 w-5 text-leaf" />
                    <span className="text-muted-foreground">{featuredCourse.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-5 w-5 text-leaf" />
                    <span className="text-muted-foreground">{featuredCourse.enrolled} enrolled</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-5 w-5 text-leaf" />
                    <span className="text-muted-foreground">Certificate included</span>
                  </div>
                </div>

                <Link to="/courses/ontario-recycling-fundamentals">
                  <Button variant="forest" size="lg">
                    Start This Course
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </CardContent>

              {/* Right - Module List */}
              <div className="bg-secondary/50 p-8 lg:p-12">
                <div className="flex items-center gap-2 mb-6">
                  <BookOpen className="h-5 w-5 text-leaf" />
                  <h4 className="font-semibold text-foreground">Course Modules</h4>
                </div>
                
                <div className="space-y-4">
                  {featuredCourse.modules.map((module, index) => (
                    <motion.div
                      key={module}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-leaf/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-leaf">{index + 1}</span>
                      </div>
                      <span className="text-foreground">{module}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Completion certificate included</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Audit-ready training records</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
