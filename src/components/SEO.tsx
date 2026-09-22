import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
  preloadImage?: string;
  /** Social preview image. Relative asset paths are resolved against the site origin. */
  image?: string;
}

const BASE = "https://herodossier.lovable.app";

export default function SEO({ title, description, path, jsonLd, noindex, preloadImage, image }: SEOProps) {
  const url = `${BASE}${path}`;
  const imageUrl = image ? (image.startsWith("http") ? image : `${BASE}${image}`) : undefined;
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
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      {imageUrl && <meta property="og:image:width" content="1200" />}
      {imageUrl && <meta property="og:image:height" content="630" />}
      <meta name="twitter:card" content={imageUrl ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}


      {jsonLd &&
        (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).map((entry, i) => (
          <script key={i} type="application/ld+json">
            {JSON.stringify(entry)}
          </script>
        ))}
    </Helmet>
  );
}
