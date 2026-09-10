interface JsonLdProps {
  /** Schema.org structured data object to serialize as JSON-LD. */
  data: Record<string, unknown> | Record<string, unknown>[]
}

export function JsonLd({ data }: JsonLdProps) {
  // Render JSON-LD in a script tag; escape "<" so API or CMS content cannot close the tag prematurely.
  const jsonString = JSON.stringify(data).replace(/</g, '\\u003c')

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires an inline script, and its content is escaped.
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  )
}
