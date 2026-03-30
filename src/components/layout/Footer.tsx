import { Link } from "react-router-dom";
import { Recycle, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-forest text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-primary-foreground/20">
                <Recycle className="h-6 w-6" />
              </div>
              <span className="text-xl font-display font-bold">Corecycle</span>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-4">
              Corecycle - Training Ontario businesses and individuals for a sustainable future.
            </p>
            <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
              <MapPin className="h-4 w-4" />
              <span>Ontario, Canada</span>
            </div>
          </div>

          {/* Learn */}
          <div>
            <h4 className="font-display font-semibold mb-4">Learn</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/learn/waste-overview" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Ontario Waste Overview
                </Link>
              </li>
              <li>
                <Link to="/learn/whats-changed" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  What Has Changed
                </Link>
              </li>
              <li>
                <Link to="/learn/how-we-help" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  How We Help
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Browse Courses
                </Link>
              </li>
            </ul>
          </div>

          {/* For Business */}
          <div>
            <h4 className="font-display font-semibold mb-4">For Business</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/for-smes" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  SME Solutions
                </Link>
              </li>
              <li>
                <Link to="/auth?mode=register&type=sme" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Register Your Business
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  About Corecycle
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Mail className="h-4 w-4" />
                <a href="mailto:info@corecycle.ca" className="hover:text-primary-foreground transition-colors">
                  info@corecycle.ca
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Phone className="h-4 w-4" />
                <span>1-800-CORECYCLE</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-primary-foreground/60">
              © {currentYear} Corecycle. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
