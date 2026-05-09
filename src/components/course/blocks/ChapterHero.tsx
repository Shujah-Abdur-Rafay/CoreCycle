import { motion } from "framer-motion";
import { ChapterTheme } from "@/lib/chapterTheme";
import { cn } from "@/lib/utils";

interface ChapterHeroProps {
  number: number;
  total: number;
  title: string;
  hook?: string;
  theme: ChapterTheme;
}

export function ChapterHero({ number, total, title, hook, theme }: ChapterHeroProps) {
  const Icon = theme.icon;
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 lg:p-8",
      theme.gradient
    )}>
      {/* Floating decorative blobs */}
      <motion.div
        className={cn("pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full opacity-20 blur-2xl", theme.iconBg)}
        animate={{ scale: [1, 1.15, 1], rotate: [0, 8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className={cn("pointer-events-none absolute -left-10 -bottom-10 h-32 w-32 rounded-full opacity-10 blur-2xl", theme.iconBg)}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />

      <div className="relative flex items-start gap-5">
        {/* Animated icon tile */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0, rotate: -20 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 14 }}
          className={cn(
            "flex h-16 w-16 lg:h-20 lg:w-20 flex-shrink-0 items-center justify-center rounded-2xl shadow-lg",
            theme.iconBg
          )}
        >
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Icon className="h-8 w-8 lg:h-10 lg:w-10 text-white" strokeWidth={2.2} />
          </motion.div>
        </motion.div>

        {/* Title block */}
        <div className="flex-1 min-w-0 pt-1">
          <div className={cn("text-xs font-bold uppercase tracking-[0.18em] mb-1.5", theme.accent)}>
            <span className="mr-1">{theme.emoji}</span>
            Chapter {number} of {total}
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-2xl lg:text-4xl font-display font-extrabold text-foreground tracking-tight leading-tight"
          >
            {title}
          </motion.h2>
          {hook && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.4 }}
              className="mt-3 text-base lg:text-lg text-foreground/75 leading-relaxed font-medium"
            >
              {hook}
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}
