import { useUserRole, AppRole } from "@/hooks/useUserRole";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const roleLabels: Record<AppRole, string> = {
  super_admin: "Super Admin",
  producer_admin: "Producer Admin",
  municipality_admin: "Municipality Admin",
  sme_admin: "SME Admin",
  learner: "Learner",
};

interface RoleSwitcherProps {
  /** When true, renders a smaller inline variant suited for the top header bar */
  compact?: boolean;
}

export function RoleSwitcher({ compact = false }: RoleSwitcherProps) {
  const { userRole, simulatedRole, setSimulatedRole } = useUserRole();

  // Always use ACTUAL role so the switcher stays visible while simulating
  const actualIsSuperAdmin = userRole?.role === 'super_admin';
  if (!actualIsSuperAdmin) return null;

  const handleRoleChange = (value: string) => {
    if (value === "none") {
      setSimulatedRole(null);
    } else {
      setSimulatedRole(value as AppRole);
    }
  };

  if (compact) {
    // Inline compact version for the header bar
    return (
      <div className="flex items-center gap-2">
        {simulatedRole ? (
          <Eye className="h-4 w-4 text-warning shrink-0" />
        ) : (
          <Shield className="h-4 w-4 text-primary shrink-0" />
        )}
        <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">View as:</span>
        <Select value={simulatedRole || "none"} onValueChange={handleRoleChange}>
          <SelectTrigger className="h-8 w-[160px] text-xs">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              <div className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5" />
                Super Admin (Default)
              </div>
            </SelectItem>
            <SelectItem value="producer_admin">Producer Admin</SelectItem>
            <SelectItem value="municipality_admin">Municipality Admin</SelectItem>
            <SelectItem value="sme_admin">SME Admin</SelectItem>
            <SelectItem value="learner">Learner</SelectItem>
          </SelectContent>
        </Select>
        {simulatedRole && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSimulatedRole(null)}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <EyeOff className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  // Full panel version (used on the admin overview page)
  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
      <div className="flex items-center gap-2">
        {simulatedRole ? (
          <Eye className="h-4 w-4 text-warning" />
        ) : (
          <Shield className="h-4 w-4 text-primary" />
        )}
        <span className="text-sm font-medium text-foreground">View as:</span>
      </div>
      
      <Select
        value={simulatedRole || "none"}
        onValueChange={handleRoleChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Super Admin (Default)
            </div>
          </SelectItem>
          <SelectItem value="producer_admin">Producer Admin</SelectItem>
          <SelectItem value="municipality_admin">Municipality Admin</SelectItem>
          <SelectItem value="sme_admin">SME Admin</SelectItem>
          <SelectItem value="learner">Learner</SelectItem>
        </SelectContent>
      </Select>

      {simulatedRole && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSimulatedRole(null)}
          className="text-xs"
        >
          <EyeOff className="h-3 w-3 mr-1" />
          Reset
        </Button>
      )}

      {simulatedRole && (
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning">
          Viewing as {roleLabels[simulatedRole]}
        </Badge>
      )}
    </div>
  );
}
