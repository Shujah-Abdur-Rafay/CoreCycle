import { useState } from "react";
import { motion } from "framer-motion";
import { useAdminSMEs, SME, SMEMember } from "@/hooks/useAdminSMEs";
import { useIndustrySectors } from "@/hooks/useIndustrySectors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Building2,
  Users,
  Search,
  UserCog,
  User,
  Mail,
  MapPin,
  Briefcase,
  Loader2,
  ChevronRight,
  Shield,
  UserMinus,
  Plus,
  GitMerge,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  producer_admin: "Producer Admin",
  municipality_admin: "Municipality Admin",
  sme_admin: "SME Admin",
  learner: "Learner",
};

const roleColors: Record<string, string> = {
  super_admin: "bg-destructive text-destructive-foreground",
  producer_admin: "bg-primary text-primary-foreground",
  municipality_admin: "bg-secondary text-secondary-foreground",
  sme_admin: "bg-accent text-accent-foreground",
  learner: "bg-muted text-muted-foreground",
};

export function SMEManagement() {
  const { smes, loading, error, updateMemberRole, removeMemberFromSME, createSME, mergeSMEs, getDuplicateSMEs, refetch } = useAdminSMEs();
  const { sectors, loading: sectorsLoading } = useIndustrySectors();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSME, setSelectedSME] = useState<SME | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<SMEMember | null>(null);
  const [showAddSMEDialog, setShowAddSMEDialog] = useState(false);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [mergeTarget, setMergeTarget] = useState<{ companyName: string; smes: SME[] } | null>(null);
  const [selectedMergeTarget, setSelectedMergeTarget] = useState<string>("");
  const [merging, setMerging] = useState(false);
  const [newSME, setNewSME] = useState({ companyName: "", municipality: "", industrySector: "" });
  const [creating, setCreating] = useState(false);

  const duplicates = getDuplicateSMEs();
  const filteredSMEs = smes.filter(sme => {
    const search = searchTerm.toLowerCase();
    return (
      sme.company_name?.toLowerCase().includes(search) ||
      sme.sme_id.toLowerCase().includes(search) ||
      sme.municipality?.toLowerCase().includes(search) ||
      sme.admin?.full_name?.toLowerCase().includes(search) ||
      sme.admin?.email?.toLowerCase().includes(search)
    );
  });

  const handlePromoteToAdmin = async (member: SMEMember, sme: SME) => {
    try {
      // If there's already an admin, demote them first
      if (sme.admin) {
        await updateMemberRole(sme.admin.user_id, 'learner');
      }
      await updateMemberRole(member.user_id, 'sme_admin');
      toast.success(`${member.full_name || member.email} promoted to SME Admin`);
    } catch (err) {
      toast.error("Failed to update role");
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      await removeMemberFromSME(memberToRemove.user_id);
      toast.success(`${memberToRemove.full_name || memberToRemove.email} removed from SME`);
      setMemberToRemove(null);
    } catch (err) {
      toast.error("Failed to remove member");
    }
  };

  const handleMergeSMEs = async () => {
    if (!mergeTarget || !selectedMergeTarget) return;
    setMerging(true);
    try {
      const sourceSmeIds = mergeTarget.smes
        .filter(sme => sme.sme_id !== selectedMergeTarget)
        .map(sme => sme.sme_id);
      
      await mergeSMEs(selectedMergeTarget, sourceSmeIds);
      toast.success(`Successfully merged ${sourceSmeIds.length + 1} SME entries into one`);
      setShowMergeDialog(false);
      setMergeTarget(null);
      setSelectedMergeTarget("");
    } catch (err) {
      toast.error("Failed to merge SMEs");
    } finally {
      setMerging(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        Error loading SMEs: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">SME Management</h2>
          <p className="text-muted-foreground">Manage SME organizations and their team members</p>
        </div>
        <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>{smes.length} SMEs registered</span>
          </div>
          {duplicates.length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => {
                setMergeTarget(duplicates[0]);
                setSelectedMergeTarget(duplicates[0].smes[0].sme_id);
                setShowMergeDialog(true);
              }} 
              className="gap-2 border-amber-500/50 text-amber-600 hover:bg-amber-500/10"
            >
              <AlertTriangle className="h-4 w-4" />
              {duplicates.length} Duplicate{duplicates.length > 1 ? 's' : ''} Found
            </Button>
          )}
          <Button onClick={() => setShowAddSMEDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add SME
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by company name, SME ID, municipality, or admin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* SME List */}
      {filteredSMEs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No SMEs found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Try adjusting your search criteria" : "No SME organizations have been registered yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {filteredSMEs.map((sme, index) => (
            <motion.div
              key={sme.sme_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <AccordionItem value={sme.sme_id} className="border rounded-lg bg-card">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-foreground">
                          {sme.company_name || "Unnamed Company"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          SME ID: {sme.sme_id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {sme.municipality && (
                        <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {sme.municipality}
                        </div>
                      )}
                      <Badge variant="outline" className="gap-1">
                        <Users className="h-3 w-3" />
                        {sme.member_count} members
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-6">
                    {/* SME Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Sector:</span>
                        <span className="text-foreground">{sme.industry_sector || "Not specified"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Municipality:</span>
                        <span className="text-foreground">{sme.municipality || "Not specified"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Total Members:</span>
                        <span className="text-foreground">{sme.member_count}</span>
                      </div>
                    </div>

                    {/* Admin Section */}
                    <Card className="border-primary/20 bg-primary/5">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          SME Administrator
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {sme.admin ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                                {sme.admin.full_name?.[0]?.toUpperCase() || sme.admin.email?.[0]?.toUpperCase() || 'A'}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">
                                  {sme.admin.full_name || "No name"}
                                </p>
                                <p className="text-sm text-muted-foreground">{sme.admin.email}</p>
                              </div>
                            </div>
                            <Badge className={roleColors.sme_admin}>
                              {roleLabels.sme_admin}
                            </Badge>
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm">No administrator assigned</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Team Members Table */}
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Team Members ({sme.members.length})
                      </h4>
                      {sme.members.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sme.members.map(member => (
                              <TableRow key={member.id}>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    {member.full_name || "No name"}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    {member.email}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={roleColors[member.role]}>
                                    {roleLabels[member.role]}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {member.is_approved ? (
                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                      Approved
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                                      Pending
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handlePromoteToAdmin(member, sme)}
                                      className="gap-1"
                                    >
                                      <UserCog className="h-3 w-3" />
                                      Make Admin
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setMemberToRemove(member)}
                                      className="text-destructive hover:text-destructive"
                                    >
                                      <UserMinus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-6 border rounded-lg bg-muted/20">
                          <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">No team members yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      )}

      {/* Remove Member Dialog */}
      <Dialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Member from SME</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {memberToRemove?.full_name || memberToRemove?.email} from this SME? 
              They will no longer have access to SME-allocated courses.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setMemberToRemove(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveMember}>
              Remove Member
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Add SME Dialog */}
      <Dialog open={showAddSMEDialog} onOpenChange={setShowAddSMEDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New SME Organization</DialogTitle>
            <DialogDescription>
              Create a new SME organization. You can assign users to this SME later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                placeholder="Enter company name"
                value={newSME.companyName}
                onChange={(e) => setNewSME({ ...newSME, companyName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="municipality">Municipality</Label>
              <Input
                id="municipality"
                placeholder="Enter municipality"
                value={newSME.municipality}
                onChange={(e) => setNewSME({ ...newSME, municipality: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="industrySector">Industry Sector</Label>
              <Select
                value={newSME.industrySector}
                onValueChange={(value) => setNewSME({ ...newSME, industrySector: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={sectorsLoading ? "Loading..." : "Select industry sector"} />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  {sectors.map((sector) => (
                    <SelectItem key={sector.id} value={sector.name}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowAddSMEDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                if (!newSME.companyName.trim()) {
                  toast.error("Company name is required");
                  return;
                }
                setCreating(true);
                try {
                  await createSME(newSME.companyName, newSME.municipality, newSME.industrySector);
                  toast.success(`SME "${newSME.companyName}" created successfully`);
                  setShowAddSMEDialog(false);
                  setNewSME({ companyName: "", municipality: "", industrySector: "" });
                } catch (err) {
                  toast.error("Failed to create SME");
                } finally {
                  setCreating(false);
                }
              }}
              disabled={creating}
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create SME
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Merge Duplicates Dialog */}
      <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitMerge className="h-5 w-5 text-amber-500" />
              Merge Duplicate SMEs
            </DialogTitle>
            <DialogDescription>
              Multiple SME entries found with the same company name. Select which one to keep as the primary record.
            </DialogDescription>
          </DialogHeader>
          {mergeTarget && (
            <div className="space-y-4 mt-4">
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm font-medium text-amber-600">
                  Company: {mergeTarget.companyName.toUpperCase()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {mergeTarget.smes.length} duplicate entries found
                </p>
              </div>

              <div>
                <Label>Select primary SME to keep</Label>
                <Select
                  value={selectedMergeTarget}
                  onValueChange={setSelectedMergeTarget}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select primary SME" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    {mergeTarget.smes.map((sme) => (
                      <SelectItem key={sme.sme_id} value={sme.sme_id}>
                        <div className="flex items-center gap-2">
                          <span>{sme.sme_id}</span>
                          <Badge variant="outline" className="text-xs">
                            {sme.member_count} members
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                <p className="font-medium mb-2">What will happen:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>All members from duplicate entries will be moved to the primary SME</li>
                  <li>Course allocations will be transferred</li>
                  <li>Duplicate SME records will be deleted</li>
                </ul>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowMergeDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleMergeSMEs}
              disabled={merging || !selectedMergeTarget}
              className="gap-2"
            >
              {merging ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitMerge className="h-4 w-4" />}
              Merge SMEs
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
