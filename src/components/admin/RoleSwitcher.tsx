import { useState } from "react";
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

const roleColors: Record<AppRole, string> = {
  super_admin: "bg-destructive text-destructive-foreground",
  producer_admin: "bg-primary text-primary-foreground",
  municipality_admin: "bg-secondary text-secondary-foreground",
  sme_admin: "bg-accent text-accent-foreground",
  learner: "bg-muted text-muted-foreground",
};

export function RoleSwitcher() {
  const { isSuperAdmin, simulatedRole, setSimulatedRole, userRole } = useUserRole();

  if (!isSuperAdmin) return null;

  const handleRoleChange = (value: string) => {
    if (value === "none") {
      setSimulatedRole(null);
    } else {
      setSimulatedRole(value as AppRole);
    }
  };

  const currentViewRole = simulatedRole || userRole?.role;

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
