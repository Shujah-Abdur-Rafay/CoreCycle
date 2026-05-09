import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";

interface XPCounterProps {
  xp: number;
  max: number;
}

export function XPCounter({ xp, max }: XPCounterProps) {
  const [display, setDisplay] = useState(xp);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (xp === display) return;
    setPulse(true);
    const start = display;
    const delta = xp - start;
    const duration = 600;
    const startTime = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - startTime) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + delta * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setPulse(false), 400);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [xp]);

  const pct = Math.min(100, (xp / max) * 100);

  return (
    <motion.div
      animate={pulse ? { scale: [1, 1.08, 1] } : { scale: 1 }}
      transition={{ duration: 0.45 }}
      className="relative flex items-center gap-2 rounded-full border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 px-3 py-1.5 shadow-sm"
    >
      <motion.div
        animate={pulse ? { rotate: [0, -15, 15, 0] } : {}}
        transition={{ duration: 0.5 }}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 shadow-md"
      >
        <Zap className="h-3.5 w-3.5 text-white fill-white" />
      </motion.div>
      <div className="flex items-baseline gap-1">
        <span className="text-sm font-bold tabular-nums text-amber-700 dark:text-amber-300">
          {display}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600/70 dark:text-amber-400/70">
          XP
        </span>
      </div>
      {/* Mini progress ring */}
      <div className="ml-1 h-1 w-10 overflow-hidden rounded-full bg-amber-200/40">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-400 to-yellow-500"
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 18 }}
        />
      </div>

      {/* +XP burst */}
      <AnimatePresence>
        {pulse && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.6 }}
            animate={{ opacity: 1, y: -22, scale: 1 }}
            exit={{ opacity: 0, y: -34 }}
            transition={{ duration: 0.7 }}
            className="pointer-events-none absolute -top-1 right-2 text-xs font-bold text-amber-600"
          >
            +{xp - (display - (xp - display)) || 10}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
