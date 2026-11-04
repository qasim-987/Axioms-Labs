/**
 * Renders a JSON-LD structured-data block. Presentation-only <script>;
 * keep payloads derived from verified content (see src/lib/seo.ts).
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
