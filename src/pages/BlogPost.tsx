import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, Bot } from "lucide-react";
import SEO from "@/components/SEO";
import NotFound from "./NotFound";
import { getPostBySlug, POSTS } from "@/content/posts";

// Tiny markdown-ish renderer: supports ## h2, ### h3, "- " lists,
// and paragraph splits. Keeps content authoring frictionless.
function renderBody(body: string) {
  const blocks = body.trim().split(/\n\s*\n/);
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (trimmed.startsWith("### ")) {
      return (
        <h3 key={i} className="font-display text-xl text-foreground mt-8 mb-3">
          {trimmed.slice(4)}
        </h3>
      );
    }
    if (trimmed.startsWith("## ")) {
      return (
        <h2 key={i} className="font-display text-3xl text-foreground mt-10 mb-4">
          {trimmed.slice(3)}
        </h2>
      );
    }
    if (trimmed.startsWith("- ")) {
      const items = trimmed.split(/\n/).map(l => l.replace(/^-\s+/, ""));
      return (
        <ul key={i} className="list-disc pl-6 space-y-2 my-4 text-muted-foreground">
          {items.map((it, j) => (
            <li key={j} dangerouslySetInnerHTML={{ __html: inline(it) }} />
          ))}
        </ul>
      );
    }
    return (
      <p
        key={i}
        className="text-muted-foreground leading-relaxed my-4"
        dangerouslySetInnerHTML={{ __html: inline(trimmed) }}
      />
    );
  });
}

// Inline transforms: **bold**, *italic*, [text](url). All link hrefs
// are escaped so authored content can't inject HTML.
function inline(s: string) {
  const esc = s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return esc
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-foreground">$1</strong>')
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-primary hover:underline">$1</a>',
    );
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;
  if (!post) return <NotFound />;

  const url = `https://herodossier.lovable.app/blog/${post.slug}`;
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    keywords: post.keywords.join(", "),
    articleSection: post.category,
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: "NakeKnight™", url: "https://herodossier.lovable.app/about" },
    publisher: {
      "@type": "Organization",
      name: "NakeKnight™",
      url: "https://herodossier.lovable.app",
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Field Notes", item: "https://herodossier.lovable.app/blog" },
      { "@type": "ListItem", position: 2, name: post.category, item: `https://herodossier.lovable.app/blog?category=${encodeURIComponent(post.category)}` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  const related = POSTS.filter(p => p.slug !== post.slug && p.category === post.category).slice(0, 2);

  return (
    <div className="min-h-screen bg-background font-body pt-14">
      <SEO
        title={`${post.title} — NakeKnight™ Field Notes`}
        description={post.description}
        path={`/blog/${post.slug}`}
        jsonLd={[articleLd, breadcrumbLd]}
      />

      <article className="max-w-3xl mx-auto px-6 py-16">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> All field notes
        </Link>

        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4">
            <span className="px-2 py-0.5 bg-primary/10 text-primary font-display tracking-wider rounded-sm">
              {post.category.toUpperCase()}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(post.publishedAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.readingMinutes} min read
            </span>
            <span className="inline-flex items-center gap-1 text-primary/60">
              <Bot className="w-3 h-3" /> AI-assisted
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-foreground leading-tight mb-4">
            {post.title}
          </h1>
          <p className="text-lg text-muted-foreground">{post.description}</p>
        </motion.header>

        <div className="prose-invert">{renderBody(post.body)}</div>

        {related.length > 0 && (
          <aside className="mt-16 pt-10 border-t border-border">
            <h2 className="font-display text-2xl text-foreground mb-4">MORE IN {post.category.toUpperCase()}</h2>
            <ul className="space-y-3">
              {related.map(r => (
                <li key={r.slug}>
                  <Link to={`/blog/${r.slug}`} className="text-primary hover:underline">
                    {r.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">{r.description}</p>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </article>
    </div>
  );
}
