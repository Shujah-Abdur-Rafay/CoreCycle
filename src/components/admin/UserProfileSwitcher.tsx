import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, 
  Users, 
  X, 
  Search,
  Building2,
  MapPin
} from "lucide-react";

interface UserProfile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  company_name: string | null;
  municipality: string | null;
  user_type: string;
}

interface SimulatedUser {
  userId: string;
  profile: UserProfile;
  role: string;
}

// Context for simulated user
import { createContext, useContext, ReactNode } from 'react';

interface SimulatedUserContextType {
  simulatedUser: SimulatedUser | null;
  setSimulatedUser: (user: SimulatedUser | null) => void;
  isSimulating: boolean;
}

const SimulatedUserContext = createContext<SimulatedUserContextType | undefined>(undefined);

export function SimulatedUserProvider({ children }: { children: ReactNode }) {
  const [simulatedUser, setSimulatedUser] = useState<SimulatedUser | null>(null);
  const { userRole } = useUserRole();
  
  // Only super admins can simulate users
  const actualIsSuperAdmin = userRole?.role === 'super_admin';
  
  return (
    <SimulatedUserContext.Provider value={{
      simulatedUser: actualIsSuperAdmin ? simulatedUser : null,
      setSimulatedUser: actualIsSuperAdmin ? setSimulatedUser : () => {},
      isSimulating: actualIsSuperAdmin && simulatedUser !== null,
    }}>
      {children}
    </SimulatedUserContext.Provider>
  );
}

export function useSimulatedUser() {
  const context = useContext(SimulatedUserContext);
  if (context === undefined) {
    throw new Error('useSimulatedUser must be used within a SimulatedUserProvider');
  }
  return context;
}

// Role badge colors
const roleColors: Record<string, string> = {
  super_admin: "bg-destructive/10 text-destructive border-destructive/30",
  producer_admin: "bg-primary/10 text-primary border-primary/30",
  municipality_admin: "bg-leaf/10 text-leaf border-leaf/30",
  sme_admin: "bg-warning/10 text-warning border-warning/30",
  learner: "bg-secondary text-secondary-foreground border-border",
};

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  producer_admin: "Producer Admin",
  municipality_admin: "Municipality Admin",
  sme_admin: "SME Admin",
  learner: "Learner",
};

export function UserProfileSwitcher() {
  const { userRole } = useUserRole();
  const { simulatedUser, setSimulatedUser, isSimulating } = useSimulatedUser();
  const [users, setUsers] = useState<(UserProfile & { role?: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const actualIsSuperAdmin = userRole?.role === 'super_admin';
  
  useEffect(() => {
    if (actualIsSuperAdmin) {
      fetchUsers();
    }
  }, [actualIsSuperAdmin]);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');
      
      if (profilesError) throw profilesError;
      
      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) throw rolesError;
      
      // Combine profiles with roles
      const usersWithRoles = (profiles || []).map(profile => ({
        ...profile,
        role: roles?.find(r => r.user_id === profile.user_id)?.role || 'learner'
      }));
      
      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUserSelect = (userId: string) => {
    if (userId === 'none') {
      setSimulatedUser(null);
      return;
    }
    
    const selectedUser = users.find(u => u.user_id === userId);
    if (selectedUser) {
      setSimulatedUser({
        userId: selectedUser.user_id,
        profile: selectedUser,
        role: selectedUser.role || 'learner'
      });
    }
  };
  
  const handleReset = () => {
    setSimulatedUser(null);
  };
  
  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };
  
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.company_name?.toLowerCase().includes(searchLower) ||
      user.municipality?.toLowerCase().includes(searchLower)
    );
  });
  
  if (!actualIsSuperAdmin) return null;
  
  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="font-medium text-foreground">View as User</h3>
        </div>
        {isSimulating && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Reset
          </Button>
        )}
      </div>
      
      {isSimulating && simulatedUser && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-warning/50">
            <AvatarFallback className="bg-warning/20 text-warning font-medium">
              {getInitials(simulatedUser.profile.full_name, simulatedUser.profile.email)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">
              {simulatedUser.profile.full_name || simulatedUser.profile.email || 'Unknown User'}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={roleColors[simulatedUser.role]}>
                {roleLabels[simulatedUser.role] || simulatedUser.role}
              </Badge>
              {simulatedUser.profile.company_name && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {simulatedUser.profile.company_name}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select
          value={simulatedUser?.userId || 'none'}
          onValueChange={handleUserSelect}
          disabled={loading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={loading ? "Loading users..." : "Select a user to view as"} />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            <SelectItem value="none">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span>View as yourself (Super Admin)</span>
              </div>
            </SelectItem>
            {filteredUsers.map((user) => (
              <SelectItem key={user.user_id} value={user.user_id}>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-muted">
                      {getInitials(user.full_name, user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm">
                      {user.full_name || user.email || 'Unknown User'}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">
                        {roleLabels[user.role || 'learner']}
                      </span>
                      {user.company_name && (
                        <span className="text-xs text-muted-foreground">
                          • {user.company_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <p className="text-xs text-muted-foreground">
        View the application as another user to see their perspective and data access.
      </p>
    </div>
  );
}
