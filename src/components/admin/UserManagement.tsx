import { useState } from "react";
import { useAdminUsers, UserWithRole } from "@/hooks/useAdminUsers";
import { AppRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  UserCog,
  Loader2,
  Filter
} from "lucide-react";

const roleLabels: Record<AppRole, string> = {
  super_admin: 'Super Admin',
  producer_admin: 'Producer Admin',
  municipality_admin: 'Municipality Admin',
  sme_admin: 'SME Admin',
  learner: 'Learner'
};

const roleColors: Record<AppRole, string> = {
  super_admin: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  producer_admin: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  municipality_admin: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  sme_admin: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  learner: 'bg-gray-500/10 text-gray-600 border-gray-500/20'
};

export function UserManagement() {
  const { users, loading, updateUserRole, approveUser } = useAdminUsers();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<AppRole>("learner");
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.company_name?.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "approved" && user.is_approved) ||
      (statusFilter === "pending" && !user.is_approved);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleApprove = async (user: UserWithRole, approved: boolean) => {
    setIsUpdating(true);
    try {
      await approveUser(user.user_id, approved);
      toast.success(approved ? "User approved successfully" : "User access revoked");
    } catch (error) {
      toast.error("Failed to update user status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser) return;
    setIsUpdating(true);
    try {
      await updateUserRole(selectedUser.user_id, newRole);
      toast.success("User role updated successfully");
      setIsRoleDialogOpen(false);
    } catch (error) {
      toast.error("Failed to update user role");
    } finally {
      setIsUpdating(false);
    }
  };

  const openRoleDialog = (user: UserWithRole) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsRoleDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Users</span>
            <Badge variant="secondary">{users.length} total</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="producer_admin">Producer Admin</SelectItem>
                <SelectItem value="municipality_admin">Municipality Admin</SelectItem>
                <SelectItem value="sme_admin">SME Admin</SelectItem>
                <SelectItem value="learner">Learner</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">
                            {user.full_name || 'No name'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {user.company_name || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`${roleColors[user.role]} cursor-pointer hover:opacity-80 transition-opacity`}
                          onClick={() => openRoleDialog(user)}
                        >
                          {roleLabels[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.is_approved ? (
                          <Badge className="bg-leaf/10 text-leaf border-leaf/20">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Approved
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openRoleDialog(user)}
                          >
                            <UserCog className="h-4 w-4" />
                          </Button>
                          {user.is_approved ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(user, false)}
                              disabled={isUpdating}
                              className="text-destructive hover:text-destructive"
                            >
                              Revoke
                            </Button>
                          ) : (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleApprove(user, true)}
                              disabled={isUpdating}
                            >
                              Approve
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Role Change Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="producer_admin">Producer Admin</SelectItem>
                <SelectItem value="municipality_admin">Municipality Admin</SelectItem>
                <SelectItem value="sme_admin">SME Admin</SelectItem>
                <SelectItem value="learner">Learner</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRoleChange} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
