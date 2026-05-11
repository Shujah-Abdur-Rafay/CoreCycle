export type LessonBlock =
  | { type: "summary"; body: string }
  | { type: "highlight"; stat: string; label: string }
  | { type: "callout"; variant: "info" | "tip" | "warning" | "important"; title?: string; body: string }
  | { type: "keyTerms"; items: { term: string; definition: string }[] }
  | { type: "flashcards"; items: { front: string; back: string }[] }
  | { type: "html"; html: string }
  | { type: "checkpoint"; label: string };

export interface LessonChapter {
  id: string;
  title: string;
  hook?: string;
  blocks: LessonBlock[];
  estimatedSeconds: number;
}

export interface ParsedLesson {
  summary: string | null;
  chapters: LessonChapter[];
}

const STAT_REGEX = /\b(\d{1,3}(?:,\d{3})*(?:\.\d+)?\s?(?:%|percent|million|billion|tonnes?|kg|tons?|kilograms?))\b/i;

const CALLOUT_PREFIXES: { match: RegExp; variant: "info" | "tip" | "warning" | "important" }[] = [
  { match: /^(warning|caution)[:\-\s]/i, variant: "warning" },
  { match: /^(important|key)[:\-\s]/i, variant: "important" },
  { match: /^(tip|pro tip|hint)[:\-\s]/i, variant: "tip" },
  { match: /^(note|info|did you know)[:\-\s]/i, variant: "info" },
];

const WORDS_PER_SECOND = 3.5; // ~210 wpm reading

function textOf(el: Element | null | undefined): string {
  return (el?.textContent || "").trim();
}

function isLikelyKeyTermsList(ul: HTMLUListElement): boolean {
  const items = Array.from(ul.querySelectorAll(":scope > li"));
  if (items.length < 2) return false;
  let matches = 0;
  for (const li of items) {
    const strong = li.querySelector("strong, b");
    const text = textOf(li);
    if (strong && textOf(strong).length > 0 && text.length > textOf(strong).length + 3) {
      matches++;
    }
  }
  return matches >= Math.ceil(items.length * 0.6);
}

function extractKeyTerms(ul: HTMLUListElement): { term: string; definition: string }[] {
  const items: { term: string; definition: string }[] = [];
  for (const li of Array.from(ul.querySelectorAll(":scope > li"))) {
    const strong = li.querySelector("strong, b");
    if (!strong) continue;
    const term = textOf(strong);
    const fullText = textOf(li);
    let def = fullText.slice(term.length).trim();
    def = def.replace(/^[\-:–—]\s*/, "").trim();
    if (term && def) items.push({ term, definition: def });
  }
  return items;
}

function detectCallout(p: HTMLParagraphElement): { variant: "info" | "tip" | "warning" | "important"; title?: string; body: string } | null {
  const text = textOf(p);
  for (const { match, variant } of CALLOUT_PREFIXES) {
    const m = text.match(match);
    if (m) {
      const title = m[1].replace(/^./, (c) => c.toUpperCase());
      const body = text.slice(m[0].length).trim();
      return { variant, title, body };
    }
  }
  return null;
}

function findStat(text: string): { stat: string; label: string } | null {
  const m = text.match(STAT_REGEX);
  if (!m) return null;
  const stat = m[1];
  let label = text.replace(m[0], "").trim();
  label = label.replace(/^[,.\-:]\s*/, "").replace(/\s+/g, " ").trim();
  if (!label) return null;
  return { stat, label };
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function extractHook(nodes: HTMLElement[]): { hook: string | null; consumeIndex: number } {
  for (let i = 0; i < nodes.length; i++) {
    const el = nodes[i];
    if (el.tagName !== "P") continue;
    if (detectCallout(el as HTMLParagraphElement)) continue;
    const text = textOf(el);
    if (!text) continue;
    // Take first sentence (or up to 180 chars)
    const sentenceMatch = text.match(/^[^.!?]+[.!?]/);
    const candidate = (sentenceMatch ? sentenceMatch[0] : text).trim();
    if (candidate.length >= 30 && candidate.length <= 220) {
      // Never consume the underlying paragraph — the hook is a display-only
      // echo so the full DB content stays rendered in the chapter body.
      return { hook: candidate, consumeIndex: -1 };
    }
    break;
  }
  return { hook: null, consumeIndex: -1 };
}

function processGroupNodes(
  nodes: HTMLElement[],
  ctx: { highlightCount: number }
): LessonBlock[] {
  const out: LessonBlock[] = [];
  // Track if we already emitted a flashcard set in this group to avoid duplicate KeyTerms+Flashcards visual noise
  const emittedTermsThisGroup = new Set<HTMLElement>();

  for (const el of nodes) {
    const tag = el.tagName;

    if (tag === "H4" || tag === "H5" || tag === "H6") {
      out.push({ type: "html", html: el.outerHTML });
      continue;
    }

    if (tag === "P") {
      const callout = detectCallout(el as HTMLParagraphElement);
      if (callout) {
        out.push({ type: "callout", ...callout });
        out.push({ type: "html", html: el.outerHTML });
        continue;
      }
      const txt = textOf(el);
      if (ctx.highlightCount < 4 && txt.length < 220) {
        const stat = findStat(txt);
        if (stat) {
          // Always emit the full paragraph so inline links/strong/em are preserved.
          // The highlight card only adds visual emphasis on top.
          out.push({ type: "html", html: el.outerHTML });
          out.push({ type: "highlight", stat: stat.stat, label: stat.label });
          ctx.highlightCount++;
          continue;
        }
      }
      out.push({ type: "html", html: el.outerHTML });
      continue;
    }

    if (tag === "BLOCKQUOTE") {
      // Emit both: the callout for emphasis + the original blockquote HTML
      // so inline links/formatting inside the quote are never lost.
      out.push({ type: "callout", variant: "info", body: textOf(el) });
      out.push({ type: "html", html: el.outerHTML });
      continue;
    }

    if (tag === "UL") {
      const ul = el as HTMLUListElement;
      if (!emittedTermsThisGroup.has(ul) && isLikelyKeyTermsList(ul)) {
        const items = extractKeyTerms(ul);
        if (items.length >= 2) {
          if (items.length <= 4) {
            out.push({ type: "keyTerms", items });
          } else {
            out.push({
              type: "flashcards",
              items: items.map((i) => ({ front: i.term, back: i.definition })),
            });
          }
          emittedTermsThisGroup.add(ul);
          // Also keep the original list HTML so any inline links/formatting
          // inside list items aren't dropped from the rendered lesson.
          out.push({ type: "html", html: el.outerHTML });
          continue;
        }
      }
      out.push({ type: "html", html: el.outerHTML });
      continue;
    }

    out.push({ type: "html", html: el.outerHTML });
  }

  return out;
}

function estimateSeconds(blocks: LessonBlock[]): number {
  let words = 0;
  for (const b of blocks) {
    if (b.type === "html") words += b.html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    else if (b.type === "callout") words += b.body.split(/\s+/).filter(Boolean).length;
    else if (b.type === "keyTerms") words += b.items.reduce((n, it) => n + it.definition.split(/\s+/).length + 2, 0);
    else if (b.type === "flashcards") words += b.items.reduce((n, it) => n + it.back.split(/\s+/).length + 2, 0);
    else if (b.type === "highlight") words += b.label.split(/\s+/).length + 4;
  }
  return Math.max(20, Math.round(words / WORDS_PER_SECOND));
}

/**
 * Parse module HTML into a paginated lesson: a top-level summary plus a
 * sequence of chapters (one per h2/h3). Each chapter has a focused set of
 * blocks so the UI can show one chapter at a time instead of a long page.
 */
export function parseLesson(html: string, fallbackTitle = "Introduction"): ParsedLesson {
  if (!html || typeof window === "undefined") {
    return {
      summary: null,
      chapters: [{ id: "ch-0", title: fallbackTitle, blocks: [{ type: "html", html: html || "" }], estimatedSeconds: 60 }],
    };
  }

  const doc = new DOMParser().parseFromString(`<div id="root">${html}</div>`, "text/html");
  const root = doc.getElementById("root");
  if (!root) {
    return {
      summary: null,
      chapters: [{ id: "ch-0", title: fallbackTitle, blocks: [{ type: "html", html }], estimatedSeconds: 60 }],
    };
  }

  const children = Array.from(root.children) as HTMLElement[];

  // Extract a summary from the first substantial paragraph if there's more content after
  let summary: string | null = null;
  if (children.length > 1) {
    const firstP = children.find((c) => c.tagName === "P");
    if (firstP) {
      const txt = textOf(firstP);
      if (txt.length >= 60 && txt.length <= 600 && !detectCallout(firstP as HTMLParagraphElement)) {
        // Display the summary as a visual lead-in but do NOT mark the paragraph
        // consumed — the original paragraph must still render in the chapter
        // body so all DB content reaches the user.
        summary = txt;
      }
    }
  }

  // Group into chapters by h2/h3 headings
  type Group = { heading?: HTMLElement; nodes: HTMLElement[] };
  const groups: Group[] = [{ nodes: [] }];
  for (const el of children) {
    if (el.getAttribute("data-consumed")) continue;
    if (el.tagName === "H1" || el.tagName === "H2" || el.tagName === "H3") {
      groups.push({ heading: el, nodes: [] });
    } else {
      groups[groups.length - 1].nodes.push(el);
    }
  }

  const ctx = { highlightCount: 0 };
  const chapters: LessonChapter[] = [];

  const buildChapter = (id: string, title: string, nodes: HTMLElement[]): LessonChapter | null => {
    const { hook, consumeIndex } = extractHook(nodes);
    const remaining = consumeIndex >= 0 ? nodes.filter((_, i) => i !== consumeIndex) : nodes;
    const blocks = processGroupNodes(remaining, ctx);
    if (blocks.length === 0 && !hook) return null;
    return {
      id,
      title,
      hook: hook || undefined,
      blocks,
      estimatedSeconds: estimateSeconds(blocks),
    };
  };

  // Lead-in group (no heading) becomes "Overview" if it has content
  const lead = groups[0];
  if (lead.nodes.length > 0) {
    const ch = buildChapter("ch-overview", "Overview", lead.nodes);
    if (ch) chapters.push(ch);
  }

  for (const group of groups.slice(1)) {
    if (!group.heading) continue;
    const title = textOf(group.heading) || "Section";
    const ch = buildChapter(`ch-${slugify(title)}-${chapters.length}`, title, group.nodes);
    if (ch) chapters.push(ch);
  }

  // If no chapters were produced (raw content with no headings), fall back to one chapter with everything
  if (chapters.length === 0) {
    const blocks = processGroupNodes(children.filter((c) => !c.getAttribute("data-consumed")), ctx);
    chapters.push({
      id: "ch-0",
      title: fallbackTitle,
      blocks,
      estimatedSeconds: estimateSeconds(blocks),
    });
  }

  return { summary, chapters };
}
