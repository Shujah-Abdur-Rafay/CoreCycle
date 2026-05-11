import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, Sparkles, Trophy, Maximize2, X, Play, Pause, Gauge } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

const proseClass =
  "prose prose-lg max-w-none dark:prose-invert " +
  "prose-headings:font-display prose-headings:text-foreground " +
  "prose-p:text-foreground/85 prose-p:leading-[1.85] prose-p:text-[1.02rem] " +
  "prose-li:text-foreground/85 prose-li:leading-[1.8] " +
  "prose-strong:text-foreground prose-strong:font-semibold " +
  "prose-a:text-primary prose-a:no-underline hover:prose-a:underline " +
  "prose-ul:my-4 prose-ol:my-4";

const proseClassFocus =
  "prose prose-xl max-w-none dark:prose-invert " +
  "prose-headings:font-display prose-headings:text-foreground " +
  "prose-p:text-foreground/90 prose-p:leading-[1.9] prose-p:text-[1.15rem] lg:prose-p:text-[1.2rem] " +
  "prose-li:text-foreground/90 prose-li:leading-[1.85] prose-li:text-[1.1rem] " +
  "prose-strong:text-foreground prose-strong:font-semibold " +
  "prose-a:text-primary prose-a:no-underline hover:prose-a:underline " +
  "prose-ul:my-5 prose-ol:my-5 prose-h2:text-3xl prose-h3:text-2xl";

const XP_PER_CHAPTER = 10;

function renderBlock(block: LessonBlock, i: number, focus = false) {
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
          className={focus ? proseClassFocus : proseClass}
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
  const [streak, setStreak] = useState(0);
  const [focused, setFocused] = useState(false);
  const focusBodyRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  // slideDuration in seconds; 0 means "auto" (use each chapter's estimated reading time)
  const [slideDuration, setSlideDuration] = useState<number>(0);
  const [slideProgress, setSlideProgress] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const allReadFiredRef = useRef(false);

  // ESC closes focus mode; lock body scroll while focused
  useEffect(() => {
    if (!focused) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFocused(false);
      if (e.key === "ArrowRight") {
        setPlaying(false);
        setActive((i) => Math.min(i + 1, chapters.length - 1));
      }
      if (e.key === "ArrowLeft") {
        setPlaying(false);
        setActive((i) => Math.max(i - 1, 0));
      }
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    // Lock body scroll AND compensate for scrollbar to prevent layout shift
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [focused]);

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
    // Reset focus-mode internal scroll on chapter change so each chapter starts at top
    if (focusBodyRef.current) {
      focusBodyRef.current.scrollTop = 0;
    }
  }, [active]);

  useEffect(() => {
    if (allRead && !allReadFiredRef.current) {
      allReadFiredRef.current = true;
      onAllChaptersRead?.();
    }
  }, [allRead, onAllChaptersRead]);

  // Slideshow autoplay: advances through chapters at the chapter's reading pace
  useEffect(() => {
    setSlideProgress(0);
    if (!playing) return;
    if (active >= chapters.length - 1) {
      setPlaying(false);
      return;
    }
    const baseSec =
      slideDuration > 0
        ? slideDuration
        : Math.max(8, Math.min(chapter.estimatedSeconds, 45));
    const durationMs = baseSec * 1000;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / durationMs);
      setSlideProgress(p);
      if (p >= 1) {
        // Advance, mimicking a manual "Next" so XP/streak/confetti fire
        const nextIdx = active + 1;
        const isNew = !visited.has(nextIdx);
        if (isNew) {
          setStreak((s) => s + 1);
        }
        setActive(nextIdx);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, active, slideDuration, chapters.length, chapter.estimatedSeconds]);

  // Stop autoplay when user manually navigates via dots/prev/next/keys
  const stopAutoplay = () => {
    if (playing) setPlaying(false);
    setSlideProgress(0);
  };

  const goTo = (i: number, isAdvance = false) => {
    if (i < 0 || i >= total || i === active) return;
    const isNew = !visited.has(i);
    if (isAdvance && isNew) {
      setStreak((s) => s + 1);
    } else if (!isNew) {
      setStreak(0);
    }
    setActive(i);
    requestAnimationFrame(() => {
      stageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const next = () => {
    stopAutoplay();
    goTo(active + 1, true);
  };
  const prev = () => {
    stopAutoplay();
    goTo(active - 1, false);
  };

  const formatTime = (sec: number) => {
    if (sec < 60) return `${sec}s`;
    const m = Math.round(sec / 60);
    return `${m} min`;
  };

  return (
    <div className="space-y-5">
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

      {/* Chapter Stage (inline) — frozen visually while focused so it doesn't compete with overlay animations */}
      <div
        className={cn(
          "transition-opacity duration-200",
          focused && "opacity-0 pointer-events-none"
        )}
        aria-hidden={focused}
      >
        {renderStage(false)}
      </div>

      {/* Focused overlay portal */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {focused && (
              <motion.div
                key="focus-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-[60] overflow-y-auto bg-background/80 backdrop-blur-2xl"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setFocused(false);
                }}
              >
                {/* Animated theme-tinted backdrop orbs */}
                <div className="pointer-events-none fixed inset-0 overflow-hidden">
                  <motion.div
                    key={`orb-a-${chapter.id}`}
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 0.5,
                      x: [0, 60, -30, 0],
                      y: [0, -40, 30, 0],
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                    className={cn(
                      "absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full blur-3xl",
                      theme.iconBg
                    )}
                  />
                  <motion.div
                    key={`orb-b-${chapter.id}`}
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 0.35,
                      x: [0, -50, 40, 0],
                      y: [0, 30, -50, 0],
                    }}
                    transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className={cn(
                      "absolute -bottom-32 -right-20 h-[32rem] w-[32rem] rounded-full blur-3xl",
                      theme.iconBg
                    )}
                  />
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.18, scale: [1, 1.1, 1] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/3 right-1/4 h-72 w-72 rounded-full bg-primary blur-3xl"
                  />
                </div>

                {/* Floating exit button (top-right of viewport) */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 220 }}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  onClick={() => setFocused(false)}
                  className="fixed top-4 right-4 lg:top-6 lg:right-6 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-card/80 border backdrop-blur-md shadow-xl hover:bg-card transition-colors"
                  aria-label="Exit focus mode (Esc)"
                >
                  <X className="h-5 w-5" />
                </motion.button>

                {/* Floating left arrow */}
                {active > 0 && (
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    whileHover={{ scale: 1.1, x: -3 }}
                    onClick={() => {
                      stopAutoplay();
                      goTo(active - 1, false);
                    }}
                    className="hidden lg:flex fixed left-4 xl:left-8 top-1/2 -translate-y-1/2 z-20 h-14 w-14 items-center justify-center rounded-full bg-card/80 border backdrop-blur-md shadow-xl hover:bg-card text-foreground"
                    aria-label="Previous chapter"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </motion.button>
                )}

                {/* Floating right arrow */}
                {active < total - 1 && (
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    whileHover={{ scale: 1.1, x: 3 }}
                    onClick={next}
                    className={cn(
                      "hidden lg:flex fixed right-4 xl:right-8 top-1/2 -translate-y-1/2 z-20 h-14 w-14 items-center justify-center rounded-full border backdrop-blur-md shadow-xl text-white",
                      theme.iconBg
                    )}
                    aria-label="Next chapter"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </motion.button>
                )}

                {/* Centered, fixed-size chapter card */}
                <div className="relative min-h-screen flex items-center justify-center px-3 py-6 lg:px-20 lg:py-8">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.94, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 12 }}
                    transition={{ type: "spring", stiffness: 200, damping: 24 }}
                    className="relative w-full max-w-7xl flex flex-col"
                    style={{ height: "min(88vh, 980px)" }}
                  >
                    {/* Theme-colored glow ring */}
                    <div
                      className={cn(
                        "pointer-events-none absolute -inset-1 rounded-[28px] opacity-30 blur-xl transition-colors duration-500",
                        theme.iconBg
                      )}
                    />
                    <div className="relative flex-1 min-h-0">{renderStage(true)}</div>

                    {/* Bottom keyboard hint */}
                    <div className="mt-3 flex-shrink-0 text-center text-xs text-muted-foreground/80 flex items-center justify-center gap-3 flex-wrap">
                      <span className="inline-flex items-center gap-1.5">
                        <kbd className="rounded border bg-card/60 backdrop-blur px-1.5 py-0.5 font-mono text-[10px]">Esc</kbd>
                        exit
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <kbd className="rounded border bg-card/60 backdrop-blur px-1.5 py-0.5 font-mono text-[10px]">←</kbd>
                        <kbd className="rounded border bg-card/60 backdrop-blur px-1.5 py-0.5 font-mono text-[10px]">→</kbd>
                        navigate
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <kbd className="rounded border bg-card/60 backdrop-blur px-1.5 py-0.5 font-mono text-[10px]">Space</kbd>
                        play / pause
                      </span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );

  function renderStage(isFocusMode: boolean) {
    return (
      <div
        ref={isFocusMode ? undefined : stageRef}
        className={cn(
          "relative overflow-hidden rounded-2xl border bg-card scroll-mt-20",
          isFocusMode ? "shadow-2xl ring-1 ring-primary/10 flex flex-col h-full" : "shadow-lg"
        )}
      >
        {/* Top progress dots + focus toggle */}
        <div className={cn(
          "flex items-center justify-between gap-4 border-b bg-muted/20 px-5 py-3",
          isFocusMode && "flex-shrink-0"
        )}>
          <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">
            {chapters.map((c, i) => {
              const t = getChapterTheme(c.title, i);
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    stopAutoplay();
                    goTo(i, false);
                  }}
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
          <div className="flex items-center gap-2 whitespace-nowrap">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatTime(chapter.estimatedSeconds)}
            </div>

            {/* Play / Pause */}
            <button
              onClick={() => {
                if (active >= total - 1 && !playing) {
                  setActive(0);
                  setPlaying(true);
                } else {
                  setPlaying((p) => !p);
                }
              }}
              title={playing ? "Pause slideshow" : "Play slideshow"}
              className={cn(
                "flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
                playing
                  ? "border-primary/60 bg-primary/15 text-primary"
                  : "border-border/60 bg-background/60 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/40"
              )}
            >
              {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {playing ? "Pause" : "Play"}
            </button>

            {/* Slide duration control */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  title="Time per slide"
                  className="flex items-center gap-1 rounded-md border border-border/60 bg-background/60 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-colors tabular-nums"
                >
                  <Gauge className="h-3 w-3" />
                  {slideDuration === 0 ? "Auto" : `${slideDuration}s`}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-1" align="end">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Time per slide
                </div>
                <div className="space-y-0.5">
                  {[
                    { value: 0, label: "Auto (read pace)" },
                    { value: 5, label: "5 seconds" },
                    { value: 10, label: "10 seconds" },
                    { value: 15, label: "15 seconds" },
                    { value: 20, label: "20 seconds" },
                    { value: 30, label: "30 seconds" },
                    { value: 60, label: "1 minute" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSlideDuration(opt.value)}
                      className={cn(
                        "flex w-full items-center justify-between rounded px-2 py-1.5 text-xs font-medium transition-colors",
                        slideDuration === opt.value
                          ? "bg-primary/15 text-primary"
                          : "hover:bg-muted text-muted-foreground"
                      )}
                    >
                      <span>{opt.label}</span>
                      {slideDuration === opt.value && <Sparkles className="h-3 w-3" />}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {!isFocusMode && (
              <button
                onClick={() => setFocused(true)}
                title="Focus mode (distraction-free)"
                className="flex items-center gap-1 rounded-md border border-border/60 bg-background/60 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-colors"
              >
                <Maximize2 className="h-3 w-3" />
                Focus
              </button>
            )}
          </div>
        </div>

        {/* Slideshow progress bar */}
        <div className={cn("h-0.5 w-full bg-transparent", isFocusMode && "flex-shrink-0")}>
          <div
            className="h-full bg-gradient-to-r from-primary via-leaf to-primary transition-[width] duration-100 ease-linear"
            style={{ width: playing ? `${slideProgress * 100}%` : "0%" }}
          />
        </div>

        {/* Chapter body */}
        <div
          ref={isFocusMode ? focusBodyRef : undefined}
          className={cn(
            "relative",
            isFocusMode
              ? "flex-1 min-h-0 overflow-y-auto px-5 py-6 lg:px-14 lg:py-8 xl:px-20"
              : "min-h-[320px] px-5 py-6 lg:px-8 lg:py-8"
          )}
        >
          {/* Giant decorative chapter number watermark in focus mode */}
          {isFocusMode && (
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute -top-2 right-4 lg:right-12 select-none font-display font-black leading-none text-[8rem] lg:text-[14rem] opacity-[0.04]",
                theme.accent
              )}
            >
              {String(active + 1).padStart(2, "0")}
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${chapter.id}-${isFocusMode ? "f" : "i"}`}
              initial={{ opacity: 0, y: isFocusMode ? 6 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: isFocusMode ? -4 : -10 }}
              transition={{ duration: isFocusMode ? 0.25 : 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={isFocusMode ? "space-y-4" : "space-y-6"}
            >
              <ChapterHero
                number={active + 1}
                total={total}
                title={chapter.title}
                hook={chapter.hook}
                theme={theme}
                compact={isFocusMode}
              />

              <div className={cn(isFocusMode ? "space-y-6 px-0" : "space-y-4 px-1 lg:px-2")}>
                {chapter.blocks.map((b, i) => renderBlock(b, i, isFocusMode))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom navigation */}
        <div className={cn(
          "flex items-center justify-between gap-3 border-t bg-muted/20 px-5 py-4",
          isFocusMode && "flex-shrink-0"
        )}>
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
    );
  }
}
