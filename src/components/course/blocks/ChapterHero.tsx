import { motion } from "framer-motion";
import { ChapterTheme } from "@/lib/chapterTheme";
import { cn } from "@/lib/utils";

interface ChapterHeroProps {
  number: number;
  total: number;
  title: string;
  hook?: string;
  theme: ChapterTheme;
  compact?: boolean;
}

export function ChapterHero({ number, total, title, hook, theme, compact = false }: ChapterHeroProps) {
  const Icon = theme.icon;
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border bg-gradient-to-br",
      compact ? "p-4 lg:p-5" : "p-6 lg:p-8",
      theme.gradient
    )}>
      {/* Floating decorative blobs (skipped in compact/focus to reduce visual jitter) */}
      {!compact && (
        <>
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
        </>
      )}

      <div className={cn("relative flex items-start", compact ? "gap-3" : "gap-5")}>
        {/* Icon tile */}
        <div
          className={cn(
            "flex flex-shrink-0 items-center justify-center rounded-2xl shadow-lg",
            compact ? "h-12 w-12 lg:h-14 lg:w-14" : "h-16 w-16 lg:h-20 lg:w-20",
            theme.iconBg
          )}
        >
          <Icon
            className={cn("text-white", compact ? "h-6 w-6 lg:h-7 lg:w-7" : "h-8 w-8 lg:h-10 lg:w-10")}
            strokeWidth={2.2}
          />
        </div>

        {/* Title block */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className={cn("font-bold uppercase tracking-[0.18em]", compact ? "text-[10px] mb-1" : "text-xs mb-1.5", theme.accent)}>
            <span className="mr-1">{theme.emoji}</span>
            Chapter {number} of {total}
          </div>
          <h2 className={cn(
            "font-display font-extrabold text-foreground tracking-tight leading-tight",
            compact ? "text-xl lg:text-2xl" : "text-2xl lg:text-4xl"
          )}>
            {title}
          </h2>
          {hook && (
            <p className={cn(
              "text-foreground/75 leading-relaxed font-medium",
              compact ? "mt-1.5 text-sm lg:text-base" : "mt-3 text-base lg:text-lg"
            )}>
              {hook}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
