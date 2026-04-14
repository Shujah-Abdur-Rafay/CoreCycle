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
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
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
  Building2,
  LogOut,
  ChevronDown,
  Shield,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUserRole } from "@/hooks/useUserRole";
import { useSimulatedUser } from "@/components/admin/UserProfileSwitcher";
import { RoleSwitcher } from "@/components/admin/RoleSwitcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// Only these two items are accessible to SME Admins
const smeMenuItems = [
  { title: "User Management",  url: "/sme-dashboard/users",    icon: Users },
  { title: "SME Management",   url: "/sme-dashboard/smes",     icon: Building2 },
];

function SMEAdminSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

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
                Corecycle
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Shield className="h-3 w-3" /> SME Admin
              </span>
            </div>
          )}
        </Link>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {smeMenuItems.map((item) => {
                const isActive = location.pathname.startsWith(item.url);
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

export function SMEAdminLayout({ children }: { children: ReactNode }) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { userRole, simulatedRole, setSimulatedRole } = useUserRole();
  const { simulatedUser, isSimulating } = useSimulatedUser();

  const actualIsSuperAdmin = userRole?.role === 'super_admin';

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getInitials = () => {
    if (profile?.full_name) {
      const names = profile.full_name.split(" ");
      return names.map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || "S";
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <SMEAdminSidebar />

        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="h-16 border-b border-border bg-background/95 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="hidden sm:flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-medium text-foreground">
                  SME Admin Panel
                </h2>
                <Badge
                  variant="outline"
                  className="bg-warning/10 text-warning border-warning text-xs"
                >
                  SME Admin
                </Badge>
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
                      {profile?.full_name || "SME Admin"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {user?.email}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
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
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 lg:p-8">
            {actualIsSuperAdmin && simulatedRole && (
              <div className="mb-6 sticky top-16 z-30 -mx-4 lg:-mx-8 px-4 lg:px-8 py-3 bg-warning/10 border-b border-warning/30 backdrop-blur-sm shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Eye className="h-4 w-4 text-warning shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-warning leading-none">
                        Previewing as SME Admin
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Your actual role is Super Admin
                      </p>
                    </div>
                    {isSimulating && simulatedUser && (
                      <div className="flex items-center gap-2 pl-3 border-l border-warning/30">
                        <Avatar className="h-6 w-6 border border-warning/50">
                          <AvatarFallback className="bg-warning/20 text-warning text-xs font-medium">
                            {getInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-warning font-medium">
                          {simulatedUser.profile.full_name || simulatedUser.profile.email}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <RoleSwitcher compact />
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 border-warning/40 text-warning hover:bg-warning/10 hover:text-warning"
                      onClick={() => {
                        setSimulatedRole(null);
                        navigate("/admin");
                      }}
                    >
                      <Shield className="h-3.5 w-3.5" />
                      Back to Admin
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

