import { motion } from "framer-motion";
import { Clock, Mail, CheckCircle } from "lucide-react";

export function PendingApproval() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md"
      >
        <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
          <Clock className="h-10 w-10 text-amber-500" />
        </div>
        
        <h1 className="text-2xl font-display font-bold text-foreground mb-3">
          Account Pending Approval
        </h1>
        
        <p className="text-muted-foreground mb-8">
          Your account has been created successfully. An administrator will review and approve your access shortly. You'll receive an email notification once approved.
        </p>

        <div className="bg-muted/50 rounded-xl p-6 text-left space-y-4">
          <h3 className="font-medium text-foreground flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-leaf" />
            What happens next?
          </h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">1</span>
              <span>An administrator will review your registration details</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">2</span>
              <span>Once approved, you'll gain access to training courses</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">3</span>
              <span>You'll receive an email confirmation when your access is granted</span>
            </li>
          </ul>
        </div>

        <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/10">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-5 w-5 text-primary" />
            <span className="text-muted-foreground">
              Questions? Contact your administrator or program coordinator.
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
