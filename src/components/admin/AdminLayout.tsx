import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";

import { useAuth } from "@/hooks/useAuth";
import { useUserRole, AppRole } from "@/hooks/useUserRole";
import { RoleSwitcher } from "@/components/admin/RoleSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Recycle,
  Users,
  FileText,
  Settings,
  Building2,
  GraduationCap,
  LogOut,
  ChevronDown,
  Shield,
  Eye,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Award,
  User,
  LayoutDashboard,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Full super-admin menu
const superAdminMenuItems = [
  { title: "Overview",          url: "/admin",              icon: LayoutDashboard },
  { title: "User Management",   url: "/admin/users",        icon: Users },
  { title: "SME Management",    url: "/admin/smes",         icon: Building2 },
  { title: "Courses",           url: "/admin/courses",      icon: GraduationCap },
  { title: "AI Quiz Generator", url: "/admin/ai-quizzes",      icon: Sparkles },
  { title: "Certificates",      url: "/admin/certificates",   icon: Award },
  { title: "Compliance",        url: "/admin/compliance",     icon: ShieldCheck },
  { title: "Reports",           url: "/admin/reports",        icon: FileText },
];

// Accessible nav items per simulated role (what that role would see)
const roleMenuItems: Record<AppRole, typeof superAdminMenuItems> = {
  super_admin: superAdminMenuItems,
  sme_admin: [
    { title: "User Management", url: "/admin/users",  icon: Users },
    { title: "SME Management",  url: "/admin/smes",   icon: Building2 },
  ],
  producer_admin: [
    { title: "Overview",   url: "/admin",          icon: LayoutDashboard },
    { title: "Reports",    url: "/admin/reports",   icon: FileText },
    { title: "Courses",    url: "/admin/courses",   icon: GraduationCap },
    { title: "Compliance", url: "/admin/compliance",icon: ShieldCheck },
  ],
  municipality_admin: [
    { title: "Overview",   url: "/admin",          icon: LayoutDashboard },
    { title: "Reports",    url: "/admin/reports",   icon: FileText },
    { title: "Compliance", url: "/admin/compliance",icon: ShieldCheck },
  ],
  learner: [
    { title: "Dashboard",    url: "/dashboard",     icon: LayoutDashboard },
    { title: "My Courses",   url: "/my-courses",    icon: BookOpen },
    { title: "Certificates", url: "/certificates",  icon: Award },
    { title: "Profile",      url: "/profile",       icon: User },
  ],
};

interface AdminSidebarProps {
  simulatedRole: AppRole | null;
}

function AdminSidebar({ simulatedRole }: AdminSidebarProps) {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const menuItems = simulatedRole
    ? roleMenuItems[simulatedRole] ?? superAdminMenuItems
    : superAdminMenuItems;

  const roleLabels: Record<AppRole, string> = {
    super_admin: "Super Admin",
    producer_admin: "Producer Admin",
    municipality_admin: "Municipality Admin",
    sme_admin: "SME Admin",
    learner: "Learner",
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <div className="p-4 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary shrink-0">
            <Recycle className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-display font-bold text-foreground">
                OntreCycle
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {simulatedRole ? roleLabels[simulatedRole] : "Super Admin"}
              </span>
            </div>
          )}
        </Link>
      </div>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {simulatedRole ? `${roleLabels[simulatedRole]} View` : "Administration"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = item.url === "/admin" 
                  ? location.pathname === "/admin"
                  : location.pathname.startsWith(item.url);
                  
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link 
                        to={item.url} 
                        className="flex items-center gap-3 px-3 py-2 transition-colors"
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, profile, signOut } = useAuth();
  const { simulatedRole, effectiveRole } = useUserRole();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getInitials = () => {
    if (profile?.full_name) {
      const names = profile.full_name.split(' ');
      return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || 'A';
  };

  const roleLabels: Record<string, string> = {
    super_admin: "Super Admin",
    producer_admin: "Producer Admin",
    municipality_admin: "Municipality Admin",
    sme_admin: "SME Admin",
    learner: "Learner",
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar simulatedRole={simulatedRole} />
        
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="h-16 border-b border-border bg-background/95 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="hidden sm:flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-medium text-foreground">
                  Super Admin Panel
                </h2>
                {simulatedRole && (
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    Viewing as {roleLabels[simulatedRole]}
                  </Badge>
                )}
              </div>

              {/* Role Switcher always visible in header */}
              <div className="hidden md:block">
                <RoleSwitcher compact />
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    {getInitials()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-foreground">
                      {profile?.full_name || 'Admin'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {user?.email}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
