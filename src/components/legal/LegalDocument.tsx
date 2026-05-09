import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollText, Calendar, MapPin, Shield } from "lucide-react";

export interface LegalSection {
  id: string;
  heading: string;
  level?: 2 | 3;
  content: ReactNode;
}

interface LegalDocumentProps {
  title: string;
  version: string;
  effectiveDate: string;
  lastUpdated?: string;
  jurisdiction?: string;
  badges?: string[];
  intro?: ReactNode;
  sections: LegalSection[];
  related?: { label: string; to: string }[];
}

export function LegalDocument({
  title,
  version,
  effectiveDate,
  lastUpdated,
  jurisdiction = "Ontario, Canada",
  badges = [],
  intro,
  sections,
  related = [],
}: LegalDocumentProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-20 lg:pt-24">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-primary/5 via-background to-leaf/5 border-b">
          <div className="container mx-auto px-4 py-12 lg:py-16 max-w-5xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <ScrollText className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Legal & Policy Suite
              </span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-display font-bold text-foreground tracking-tight mb-4">
              {title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Badge variant="outline" className="font-mono">v{version}</Badge>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Effective {effectiveDate}
              </span>
              {lastUpdated && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Updated {lastUpdated}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {jurisdiction}
              </span>
              {badges.map((b) => (
                <Badge key={b} className="bg-leaf/10 text-leaf border-leaf/30">
                  <Shield className="h-3 w-3 mr-1" />
                  {b}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Body */}
        <section className="container mx-auto px-4 py-10 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
            {/* Sticky TOC */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 px-2">
                  On this page
                </p>
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block px-2 py-1.5 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 rounded transition-colors"
                  >
                    {s.heading}
                  </a>
                ))}
              </div>
            </aside>

            <div className="min-w-0">
              <Card>
                <CardContent className="p-6 lg:p-10">
                  {intro && (
                    <div className="mb-8 pb-6 border-b text-base text-foreground/85 leading-relaxed">
                      {intro}
                    </div>
                  )}

                  <div className="space-y-10">
                    {sections.map((s) => (
                      <section key={s.id} id={s.id} className="scroll-mt-24">
                        {s.level === 3 ? (
                          <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                            {s.heading}
                          </h3>
                        ) : (
                          <h2 className="text-2xl font-display font-bold text-foreground border-l-4 border-primary pl-3 mb-4">
                            {s.heading}
                          </h2>
                        )}
                        <div className="prose prose-base max-w-none dark:prose-invert
                          prose-p:text-foreground/85 prose-p:leading-[1.8]
                          prose-li:text-foreground/85 prose-li:leading-[1.7]
                          prose-strong:text-foreground prose-strong:font-semibold
                          prose-a:text-primary prose-headings:font-display prose-headings:text-foreground
                          prose-table:text-sm">
                          {s.content}
                        </div>
                      </section>
                    ))}
                  </div>

                  {related.length > 0 && (
                    <div className="mt-12 pt-6 border-t">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                        Related Policies
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {related.map((r) => (
                          <Link
                            key={r.to}
                            to={r.to}
                            className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm text-foreground hover:bg-primary/5 hover:border-primary/40 hover:text-primary transition-colors"
                          >
                            <ScrollText className="h-3.5 w-3.5" />
                            {r.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
