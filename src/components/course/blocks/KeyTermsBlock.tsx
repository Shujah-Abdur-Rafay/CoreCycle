import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";

interface KeyTermsBlockProps {
  items: { term: string; definition: string }[];
}

export function KeyTermsBlock({ items }: KeyTermsBlockProps) {
  return (
    <div className="my-6 rounded-xl border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-semibold uppercase tracking-wider text-primary">
          Key Terms
        </h4>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
            className="rounded-lg border border-border/60 bg-background/60 p-3 hover:border-primary/40 hover:shadow-sm transition-all"
          >
            <div className="font-semibold text-foreground text-sm mb-1">
              {item.term}
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed">
              {item.definition}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
