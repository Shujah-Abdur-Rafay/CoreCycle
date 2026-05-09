import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { parseLesson, LessonBlock } from "@/lib/lessonBlocks";
import { getChapterTheme } from "@/lib/chapterTheme";
import { SummaryBlock } from "./blocks/SummaryBlock";
import { HighlightCard } from "./blocks/HighlightCard";
import { CalloutBlock } from "./blocks/CalloutBlock";
import { KeyTermsBlock } from "./blocks/KeyTermsBlock";
import { FlashcardSet } from "./blocks/FlashcardSet";
import { ChapterHero } from "./blocks/ChapterHero";
import { XPCounter } from "./blocks/XPCounter";
import { Confetti } from "./blocks/Confetti";

const proseClass =
  "prose prose-lg max-w-none dark:prose-invert " +
  "prose-headings:font-display prose-headings:text-foreground " +
  "prose-p:text-foreground/85 prose-p:leading-[1.85] prose-p:text-[1.02rem] " +
  "prose-li:text-foreground/85 prose-li:leading-[1.8] " +
  "prose-strong:text-foreground prose-strong:font-semibold " +
  "prose-a:text-primary prose-a:no-underline hover:prose-a:underline " +
  "prose-ul:my-4 prose-ol:my-4";

const XP_PER_CHAPTER = 10;

function renderBlock(block: LessonBlock, i: number) {
  switch (block.type) {
    case "summary":
      return <SummaryBlock key={i} body={block.body} />;
    case "highlight":
      return <HighlightCard key={i} stat={block.stat} label={block.label} />;
    case "callout":
      return (
        <CalloutBlock key={i} variant={block.variant} title={block.title} body={block.body} />
      );
    case "keyTerms":
      return <KeyTermsBlock key={i} items={block.items} />;
    case "flashcards":
      return <FlashcardSet key={i} items={block.items} />;
    case "html":
    default:
      return (
        <div
          key={i}
          className={proseClass}
          dangerouslySetInnerHTML={{ __html: (block as any).html }}
        />
      );
  }
}

interface LessonChapterViewProps {
  html: string;
  moduleTitle?: string;
  onAllChaptersRead?: () => void;
}

export function LessonChapterView({ html, moduleTitle, onAllChaptersRead }: LessonChapterViewProps) {
  const { summary, chapters } = useMemo(
    () => parseLesson(html, moduleTitle || "Introduction"),
    [html, moduleTitle]
  );

  const [active, setActive] = useState(0);
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [bigConfetti, setBigConfetti] = useState(false);
  const [streak, setStreak] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const allReadFiredRef = useRef(false);

  const total = chapters.length;
  const chapter = chapters[active];
  const theme = getChapterTheme(chapter.title, active);
  const xp = visited.size * XP_PER_CHAPTER;
  const maxXP = total * XP_PER_CHAPTER;
  const allRead = visited.size === total;

  useEffect(() => {
    setVisited((prev) => {
      if (prev.has(active)) return prev;
      const next = new Set(prev);
      next.add(active);
      return next;
    });
  }, [active]);

  useEffect(() => {
    if (allRead && !allReadFiredRef.current) {
      allReadFiredRef.current = true;
      setBigConfetti(true);
      setConfettiTrigger((t) => t + 1);
      onAllChaptersRead?.();
    }
  }, [allRead, onAllChaptersRead]);

  const goTo = (i: number, isAdvance = false) => {
    if (i < 0 || i >= total || i === active) return;
    const isNew = !visited.has(i);
    if (isAdvance && isNew) {
      setBigConfetti(false);
      setConfettiTrigger((t) => t + 1);
      setStreak((s) => s + 1);
    } else if (!isNew) {
      setStreak(0);
    }
    setActive(i);
    requestAnimationFrame(() => {
      stageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const next = () => goTo(active + 1, true);
  const prev = () => goTo(active - 1, false);

  const formatTime = (sec: number) => {
    if (sec < 60) return `${sec}s`;
    const m = Math.round(sec / 60);
    return `${m} min`;
  };

  return (
    <div className="space-y-5">
      <Confetti trigger={confettiTrigger} count={bigConfetti ? 80 : 24} big={bigConfetti} />

      {/* Status bar: XP + streak */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <XPCounter xp={xp} max={maxXP} />
          <AnimatePresence>
            {streak >= 2 && (
              <motion.div
                initial={{ opacity: 0, x: -8, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -8, scale: 0.8 }}
                className="flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-red-500/10 px-3 py-1.5 text-xs font-bold text-orange-600 dark:text-orange-400"
              >
                <span className="text-base leading-none">🔥</span>
                {streak} chapter streak!
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          {allRead && (
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg"
            >
              <Trophy className="h-3.5 w-3.5" />
              All Done!
            </motion.div>
          )}
        </div>
      </div>

      {/* Optional Lesson Summary on first chapter */}
      {summary && active === 0 && <SummaryBlock body={summary} />}

      {/* Chapter Stage */}
      <div
        ref={stageRef}
        className="relative overflow-hidden rounded-2xl border bg-card shadow-lg scroll-mt-20"
      >
        {/* Top progress dots */}
        <div className="flex items-center justify-between gap-4 border-b bg-muted/20 px-5 py-3">
          <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">
            {chapters.map((c, i) => {
              const t = getChapterTheme(c.title, i);
              return (
                <button
                  key={c.id}
                  onClick={() => goTo(i, false)}
                  title={c.title}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300 group relative",
                    i === active
                      ? `w-10 ${t.iconBg} shadow-sm`
                      : visited.has(i)
                      ? "w-3.5 bg-primary/40 hover:bg-primary/60"
                      : "w-3.5 bg-muted-foreground/20 hover:bg-muted-foreground/40"
                  )}
                  aria-label={`Go to chapter ${i + 1}: ${c.title}`}
                />
              );
            })}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
            <Clock className="h-3 w-3" />
            {formatTime(chapter.estimatedSeconds)}
          </div>
        </div>

        {/* Chapter body */}
        <div className="px-5 py-6 lg:px-8 lg:py-8 min-h-[320px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, scale: 0.99 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <ChapterHero
                number={active + 1}
                total={total}
                title={chapter.title}
                hook={chapter.hook}
                theme={theme}
              />

              <div className="space-y-4 px-1 lg:px-2">
                {chapter.blocks.map((b, i) => renderBlock(b, i))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom navigation */}
        <div className="flex items-center justify-between gap-3 border-t bg-muted/20 px-5 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={prev}
            disabled={active === 0}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="text-xs font-medium text-muted-foreground tabular-nums">
            {active + 1} <span className="opacity-50">/</span> {total}
          </div>

          {active < total - 1 ? (
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="forest"
                size="sm"
                onClick={next}
                className="gap-1.5 shadow-md"
              >
                {visited.has(active + 1) ? "Next" : (
                  <>
                    Next <Sparkles className="h-3.5 w-3.5" /> +{XP_PER_CHAPTER} XP
                  </>
                )}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 text-xs font-bold text-white shadow-md"
            >
              <Trophy className="h-3.5 w-3.5" />
              Lesson Complete
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
