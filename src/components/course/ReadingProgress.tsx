import { useEffect, useState, RefObject } from "react";
import { motion } from "framer-motion";

interface ReadingProgressProps {
  targetRef: RefObject<HTMLElement>;
}

export function ReadingProgress({ targetRef }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const el = targetRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      const pct = total <= 0 ? 100 : Math.min(100, Math.max(0, (scrolled / total) * 100));
      setProgress(pct);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [targetRef]);

  return (
    <div className="sticky top-0 z-30 -mx-2 h-1 bg-transparent">
      <motion.div
        className="h-full bg-gradient-to-r from-primary via-leaf to-primary origin-left rounded-r-full"
        style={{ width: `${progress}%` }}
        animate={{ width: `${progress}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      />
    </div>
  );
}
