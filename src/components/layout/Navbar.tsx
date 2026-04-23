import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useSimulatedUser } from "@/components/admin/UserProfileSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Recycle,
  Menu,
  X,
  ChevronDown,
  BookOpen,
  Shield,
  User,
  LogOut,
  Settings,
  GraduationCap,
  ArrowLeftCircle,
  Eye
} from "lucide-react";

const navItems = [
  {
    label: "Learn",
    children: [
      { label: "Ontario Waste Overview", href: "/learn/waste-overview", icon: Recycle },
      { label: "What Has Changed", href: "/learn/whats-changed", icon: BookOpen },
      { label: "How We Help", href: "/learn/how-we-help", icon: Shield },
    ]
  },
  { label: "Courses", href: "/courses" },
  { label: "For SMEs", href: "/for-smes" },
  { label: "About", href: "/about" },
];

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  producer_admin: "Producer Admin",
  municipality_admin: "Municipality Admin",
  sme_admin: "SME Admin",
  learner: "Learner",
};

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, loading } = useAuth();
  const { simulatedRole, setSimulatedRole, userRole } = useUserRole();
  const { simulatedUser, setSimulatedUser, isSimulating } = useSimulatedUser();

  const actualIsSuperAdmin = userRole?.role === 'super_admin';
  const isRoleSimulating = actualIsSuperAdmin && !!simulatedRole;
  const isAnySimulation = isRoleSimulating || isSimulating;

  const handleExitSimulation = () => {
    setSimulatedRole(null);
    setSimulatedUser(null);
    navigate('/dashboard');
  };

  const isHomePage = location.pathname === "/";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getInitials = () => {
    if (profile?.full_name) {
      const names = profile.full_name.split(' ');
      return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isHomePage ? "bg-transparent" : "bg-background/95 backdrop-blur-md border-b border-border"
    }`}>
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className={`p-2 rounded-xl transition-colors ${
              isHomePage ? "bg-primary-foreground/20" : "bg-primary"
            }`}>
              <Recycle className={`h-6 w-6 ${
                isHomePage ? "text-primary-foreground" : "text-primary-foreground"
              }`} />
            </div>
            <span className={`text-xl font-display font-bold ${
              isHomePage ? "text-primary-foreground" : "text-foreground"
            }`}>
              OntreCycle
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div key={item.label} className="relative">
                {item.children ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(item.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button
                      className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isHomePage 
                          ? "text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10"
                          : "text-foreground/70 hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {item.label}
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <AnimatePresence>
                      {openDropdown === item.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 mt-2 w-64 bg-card rounded-xl shadow-xl border border-border overflow-hidden"
                        >
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              to={child.href}
                              className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                            >
                              <child.icon className="h-5 w-5 text-leaf" />
                              {child.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    to={item.href!}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isHomePage 
                        ? "text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10"
                        : "text-foreground/70 hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* CTA Buttons / User Menu */}
          <div className="hidden lg:flex items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isHomePage 
                      ? "hover:bg-primary-foreground/10"
                      : "hover:bg-muted"
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isHomePage 
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-primary text-primary-foreground"
                    }`}>
                      {getInitials()}
                    </div>
                    <ChevronDown className={`h-4 w-4 ${
                      isHomePage ? "text-primary-foreground" : "text-foreground"
                    }`} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-foreground">
                      {profile?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/my-courses" className="flex items-center gap-2 cursor-pointer">
                      <GraduationCap className="h-4 w-4" />
                      My Courses
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/auth?mode=login">
                  <Button variant={isHomePage ? "hero-outline" : "ghost"} size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth?mode=register">
                  <Button variant={isHomePage ? "hero" : "default"} size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className={`h-6 w-6 ${isHomePage ? "text-primary-foreground" : "text-foreground"}`} />
            ) : (
              <Menu className={`h-6 w-6 ${isHomePage ? "text-primary-foreground" : "text-foreground"}`} />
            )}
          </button>
        </div>
      </nav>

      {/* Simulation Banner */}
      <AnimatePresence>
        {isAnySimulation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-warning/15 border-b border-warning/40"
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-warning-foreground">
                <Eye className="h-4 w-4 text-warning shrink-0" />
                <span className="font-medium text-foreground">Simulation active:</span>
                {isSimulating && simulatedUser ? (
                  <span className="text-muted-foreground">
                    viewing as{' '}
                    <span className="font-semibold text-foreground">
                      {simulatedUser.profile.full_name || simulatedUser.profile.email || 'Unknown User'}
                    </span>
                    <Badge variant="outline" className="ml-2 text-xs py-0 h-5 border-warning/50 text-warning">
                      {roleLabels[simulatedUser.role] || simulatedUser.role}
                    </Badge>
                  </span>
                ) : isRoleSimulating ? (
                  <span className="text-muted-foreground">
                    role set to{' '}
                    <Badge variant="outline" className="ml-1 text-xs py-0 h-5 border-warning/50 text-warning">
                      {roleLabels[simulatedRole!] || simulatedRole}
                    </Badge>
                  </span>
                ) : null}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleExitSimulation}
                className="h-7 text-xs border-warning/50 text-warning hover:bg-warning/10 hover:text-warning shrink-0"
              >
                <ArrowLeftCircle className="h-3.5 w-3.5 mr-1" />
                Back to Super Admin
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-card border-b border-border"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <div key={item.label}>
                  {item.children ? (
                    <div className="space-y-1">
                      <div className="px-4 py-2 text-sm font-semibold text-muted-foreground">
                        {item.label}
                      </div>
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 rounded-lg text-foreground hover:bg-muted"
                        >
                          <child.icon className="h-5 w-5 text-leaf" />
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      to={item.href!}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 rounded-lg text-foreground hover:bg-muted"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
              <div className="pt-4 border-t border-border space-y-2">
                {user ? (
                  <>
                    <div className="px-4 py-2">
                      <p className="text-sm font-medium text-foreground">
                        {profile?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link to="/my-courses" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <GraduationCap className="h-4 w-4" />
                        My Courses
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2 text-destructive"
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth?mode=login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">Sign In</Button>
                    </Link>
                    <Link to="/auth?mode=register" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="default" className="w-full">Get Started</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
