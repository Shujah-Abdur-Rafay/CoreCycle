import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCw, Layers, Eye, MousePointerClick } from "lucide-react";
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
        role="button"
        tabIndex={0}
        aria-label={flipped ? "Tap to see the term" : "Tap to reveal the definition"}
        className="group relative h-48 cursor-pointer perspective select-none rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setFlipped((f) => !f);
          }
        }}
        style={{ perspective: "1000px" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${index}-${flipped}`}
            initial={{ rotateY: flipped ? -90 : 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: flipped ? 90 : -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`absolute inset-0 rounded-lg border-2 flex flex-col items-center justify-center p-6 text-center shadow-md transition-colors ${
              flipped
                ? "border-primary bg-primary/5"
                : "border-primary/30 bg-card group-hover:border-primary/60"
            }`}
            style={{ transformStyle: "preserve-3d" }}
          >
            <span
              className={`mb-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                flipped
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {flipped ? <Eye className="h-3 w-3" /> : null}
              {flipped ? "Definition" : "Term"}
            </span>
            <p className={flipped ? "text-base text-foreground" : "text-xl font-display font-semibold text-foreground"}>
              {flipped ? card.back : card.front}
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-medium text-primary/80">
              <MousePointerClick className="h-3.5 w-3.5" />
              {flipped ? "Tap to flip back to the term" : "Tap the card to reveal the answer"}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <Button variant="outline" size="sm" onClick={prev} disabled={items.length < 2}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Prev
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setFlipped((f) => !f)}>
          <RotateCw className="h-4 w-4 mr-1" /> {flipped ? "Show term" : "Show answer"}
        </Button>
        <Button variant="outline" size="sm" onClick={next} disabled={items.length < 2}>
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
