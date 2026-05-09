import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCw, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FlashcardSetProps {
  items: { front: string; back: string }[];
}

export function FlashcardSet({ items }: FlashcardSetProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!items.length) return null;

  const card = items[index];

  const next = () => {
    setFlipped(false);
    setTimeout(() => setIndex((i) => (i + 1) % items.length), 150);
  };
  const prev = () => {
    setFlipped(false);
    setTimeout(() => setIndex((i) => (i - 1 + items.length) % items.length), 150);
  };

  return (
    <div className="my-6 rounded-xl border bg-gradient-to-br from-secondary/40 to-background p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold uppercase tracking-wider text-primary">
            Practice Flashcards
          </h4>
        </div>
        <span className="text-xs text-muted-foreground">
          {index + 1} / {items.length}
        </span>
      </div>

      <div
        className="relative h-44 cursor-pointer perspective select-none"
        onClick={() => setFlipped((f) => !f)}
        style={{ perspective: "1000px" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${index}-${flipped}`}
            initial={{ rotateY: flipped ? -90 : 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: flipped ? 90 : -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 rounded-lg border-2 border-primary/30 bg-card flex items-center justify-center p-6 text-center shadow-md"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                {flipped ? "Definition" : "Term"}
              </p>
              <p className={flipped ? "text-base text-foreground" : "text-xl font-display font-semibold text-foreground"}>
                {flipped ? card.back : card.front}
              </p>
              {!flipped && (
                <p className="mt-3 text-[11px] text-muted-foreground">Tap to reveal</p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <Button variant="outline" size="sm" onClick={prev} disabled={items.length < 2}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Prev
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setFlipped((f) => !f)}>
          <RotateCw className="h-4 w-4 mr-1" /> Flip
        </Button>
        <Button variant="outline" size="sm" onClick={next} disabled={items.length < 2}>
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
