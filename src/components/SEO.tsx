import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
  preloadImage?: string;
}

const BASE = "https://herodossier.lovable.app";

export default function SEO({ title, description, path, jsonLd, noindex, preloadImage }: SEOProps) {
  const url = `${BASE}${path}`;
  return (
    <Helmet>
      {preloadImage && <link rel="preload" as="image" href={preloadImage} />}

      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, follow" />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      {jsonLd &&
        (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).map((entry, i) => (
          <script key={i} type="application/ld+json">
            {JSON.stringify(entry)}
          </script>
        ))}
    </Helmet>
  );
}
