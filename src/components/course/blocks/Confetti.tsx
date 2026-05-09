import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiProps {
  trigger: number; // increment to fire
  count?: number;
  big?: boolean;
}

const COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6", "#ef4444", "#22d3ee"];

export function Confetti({ trigger, count = 28, big = false }: ConfettiProps) {
  const [pieces, setPieces] = useState<Array<{ id: number; x: number; rot: number; color: string; delay: number; dist: number }>>([]);

  useEffect(() => {
    if (trigger === 0) return;
    const next = Array.from({ length: count }).map((_, i) => ({
      id: trigger * 1000 + i,
      x: (Math.random() - 0.5) * (big ? 600 : 360),
      rot: Math.random() * 720 - 360,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.1,
      dist: (big ? 240 : 140) + Math.random() * (big ? 180 : 100),
    }));
    setPieces(next);
    const t = setTimeout(() => setPieces([]), 1400);
    return () => clearTimeout(t);
  }, [trigger, count, big]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      <AnimatePresence>
        {pieces.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 0.5 }}
            animate={{
              opacity: 0,
              x: p.x,
              y: p.dist,
              rotate: p.rot,
              scale: 1,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, delay: p.delay, ease: [0.23, 0.9, 0.4, 1] }}
            className="absolute h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: p.color }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
