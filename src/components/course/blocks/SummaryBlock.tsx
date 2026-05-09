import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function SummaryBlock({ body }: { body: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent p-5 lg:p-6"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 rounded-lg bg-primary/10 p-2 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Lesson Summary
          </p>
          <p className="text-base leading-relaxed text-foreground">{body}</p>
        </div>
      </div>
    </motion.div>
  );
}
