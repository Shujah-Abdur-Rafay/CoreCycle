export type LessonBlock =
  | { type: "summary"; body: string }
  | { type: "highlight"; stat: string; label: string }
  | { type: "callout"; variant: "info" | "tip" | "warning" | "important"; title?: string; body: string; bodyHtml?: string }
  | { type: "keyTerms"; items: { term: string; definition: string }[] }
  | { type: "flashcards"; items: { front: string; back: string }[] }
  | { type: "html"; html: string }
  | { type: "checkpoint"; label: string };

export interface LessonChapter {
  id: string;
  title: string;
  blocks: LessonBlock[];
  estimatedSeconds: number;
}

export interface ParsedLesson {
  summary: string | null;
  chapters: LessonChapter[];
}

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

function detectCallout(p: HTMLParagraphElement): { variant: "info" | "tip" | "warning" | "important"; title?: string; body: string; bodyHtml: string } | null {
  const text = textOf(p);
  for (const { match, variant } of CALLOUT_PREFIXES) {
    const m = text.match(match);
    if (m) {
      const title = m[1].replace(/^./, (c) => c.toUpperCase());
      const body = text.slice(m[0].length).trim();
      // Strip the same leading prefix from the inner HTML so inline links and
      // formatting are preserved when we render the callout in place of the
      // original paragraph (avoids duplicating the text).
      const bodyHtml = p.innerHTML.replace(match, "").replace(/^[\s:–—-]+/, "").trim();
      return { variant, title, body, bodyHtml };
    }
  }
  return null;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function processGroupNodes(nodes: HTMLElement[]): LessonBlock[] {
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
        // Render ONLY the callout. Its bodyHtml preserves the paragraph's inline
        // links/formatting, so we drop the original <p> to avoid showing the same
        // text twice (callout + paragraph).
        out.push({ type: "callout", ...callout });
        continue;
      }
      // Note: short statistic paragraphs are rendered as plain paragraphs only.
      // We intentionally do NOT also emit a "highlight" stat card, which would
      // duplicate the very same number/sentence already shown in the paragraph.
      out.push({ type: "html", html: el.outerHTML });
      continue;
    }

    if (tag === "BLOCKQUOTE") {
      // Render ONLY the callout; its bodyHtml carries the quote's inline
      // formatting, so the original blockquote is not emitted as a duplicate.
      out.push({ type: "callout", variant: "info", body: textOf(el), bodyHtml: el.innerHTML });
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
          // Render ONLY the interactive cards. The term + definition text is fully
          // contained in the cards/flashcards, so we drop the original <ul> to
          // avoid duplicating the list content below the cards.
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

  const chapters: LessonChapter[] = [];

  const buildChapter = (id: string, title: string, nodes: HTMLElement[]): LessonChapter | null => {
    // Chapter heroes render the heading only — no introductory hook text.
    // All paragraph content stays in the body so nothing is duplicated or lost.
    const blocks = processGroupNodes(nodes);
    if (blocks.length === 0) return null;
    return {
      id,
      title,
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
    const blocks = processGroupNodes(children.filter((c) => !c.getAttribute("data-consumed")));
    chapters.push({
      id: "ch-0",
      title: fallbackTitle,
      blocks,
      estimatedSeconds: estimateSeconds(blocks),
    });
  }

  return { summary, chapters };
}
