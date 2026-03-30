import { motion } from "framer-motion";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Users, UserCheck, UserX, Building2 } from "lucide-react";

export function AdminStats() {
  const { users, loading } = useAdminUsers();

  const totalUsers = users.length;
  const approvedUsers = users.filter(u => u.is_approved).length;
  const pendingUsers = users.filter(u => !u.is_approved).length;
  const smeAdmins = users.filter(u => u.role === 'sme_admin').length;

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-28 bg-muted/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <StatsCard
        title="Total Users"
        value={totalUsers}
        icon={Users}
        description="Registered accounts"
      />
      <StatsCard
        title="Approved"
        value={approvedUsers}
        icon={UserCheck}
        description="Active users"
        variant="success"
      />
      <StatsCard
        title="Pending Approval"
        value={pendingUsers}
        icon={UserX}
        description="Awaiting review"
        variant="warning"
      />
      <StatsCard
        title="SME Admins"
        value={smeAdmins}
        icon={Building2}
        description="Company managers"
        variant="info"
      />
    </motion.div>
  );
}
