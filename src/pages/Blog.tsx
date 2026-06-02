import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bot, Calendar, Clock, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import { CATEGORIES, KEYWORD_CLUSTER, POSTS, type PostCategory } from "@/content/posts";

const ALL = "All" as const;
type Filter = PostCategory | typeof ALL;

const tabs: Filter[] = [ALL, ...CATEGORIES];

export default function Blog() {
  const [filter, setFilter] = useState<Filter>(ALL);

  const posts = useMemo(
    () => (filter === ALL ? POSTS : POSTS.filter(p => p.category === filter)),
    [filter],
  );

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "NakeKnight™ Field Notes",
    description:
      "Case studies and breakdowns from an AI-driven business: how one operator + AI built and ships a verifiable entertainment brand.",
    url: "https://herodossier.lovable.app/blog",
    keywords: KEYWORD_CLUSTER.join(", "),
    blogPost: POSTS.map(p => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      datePublished: p.publishedAt,
      url: `https://herodossier.lovable.app/blog/${p.slug}`,
      author: { "@type": "Organization", name: "NakeKnight™" },
    })),
  };

  return (
    <div className="min-h-screen bg-background font-body pt-14">
      <SEO
        title="Field Notes — AI-Driven Businesses, Case Studies & Breakdowns"
        description="Case studies and AI breakdowns from NakeKnight, a verifiable AI-driven business. Learn how AI-native brands are built, shipped, and licensed."
        path="/blog"
        jsonLd={blogJsonLd}
      />

      <div className="max-w-5xl mx-auto px-6 py-16">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-2">
            <p className="text-primary font-display tracking-[0.3em]">FIELD NOTES</p>
            <span className="inline-flex items-center gap-1 text-[10px] text-primary/60 bg-primary/5 border border-primary/10 rounded px-1.5 py-0.5">
              <Bot className="w-3 h-3" /> Written + edited with AI
            </span>
          </div>
          <h1 className="font-display text-6xl md:text-7xl text-foreground mb-4">
            AI-DRIVEN BUSINESSES, IN PUBLIC
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Case studies and AI breakdowns from NakeKnight™ — a one-operator,
            AI-built entertainment brand with every public number wired to a
            real source.
          </p>
        </motion.header>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-10" role="tablist" aria-label="Post categories">
          {tabs.map(t => {
            const active = filter === t;
            return (
              <button
                key={t}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(t)}
                className={`px-4 py-2 font-display text-xs tracking-widest rounded-sm border transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-transparent text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {t.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Posts */}
        <div className="grid md:grid-cols-2 gap-6">
          {posts.map((p, i) => (
            <motion.article
              key={p.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary/30 transition-colors flex flex-col"
            >
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span className="px-2 py-0.5 bg-primary/10 text-primary font-display tracking-wider rounded-sm">
                  {p.category.toUpperCase()}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(p.publishedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {p.readingMinutes} min
                </span>
              </div>
              <h2 className="font-display text-2xl text-foreground mb-2 leading-snug">
                <Link to={`/blog/${p.slug}`} className="hover:text-primary transition-colors">
                  {p.title}
                </Link>
              </h2>
              <p className="text-sm text-muted-foreground mb-4 flex-1">{p.description}</p>
              <Link
                to={`/blog/${p.slug}`}
                className="inline-flex items-center gap-2 text-primary font-display text-sm tracking-wider"
              >
                READ <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.article>
          ))}
        </div>

        {posts.length === 0 && (
          <p className="text-muted-foreground text-sm">Nothing in this category yet.</p>
        )}
      </div>
    </div>
  );
}
