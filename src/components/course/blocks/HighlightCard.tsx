import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

export function HighlightCard({ stat, label }: { stat: string; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      className="my-4 rounded-xl border border-leaf/30 bg-gradient-to-br from-leaf/10 to-leaf/5 p-5"
    >
      <div className="flex items-center gap-4">
        <div className="rounded-full bg-leaf/15 p-3 text-leaf">
          <TrendingUp className="h-6 w-6" />
        </div>
        <div>
          <div className="text-3xl lg:text-4xl font-display font-bold text-leaf">
            {stat}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">{label}</div>
        </div>
      </div>
    </motion.div>
  );
}
