/**
 * Axioms Lab — central public site identity.
 *
 * Single source of truth for the brand name, canonical origin and public
 * contact e-mail used by metadata, SEO files (robots/sitemap), structured
 * data and every contact surface. Change a value here and it propagates.
 */

/** Display brand name (title-case lockup). */
export const SITE_NAME = "Axioms Lab";

/**
 * Canonical origin, without trailing slash.
 * Overridable at build time via NEXT_PUBLIC_SITE_URL; defaults to the
 * verified production domain so the site is correct with or without env.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.axiomslab.com";

/**
 * Public contact e-mail shown on the site and used in mailto: links.
 * NEEDS OWNER DECISION: two different addresses were historically in use;
 * this unifies them on the business-account mailbox so inquiries always
 * arrive. To switch, edit this one line only.
 */
export const SITE_EMAIL = "info@axiomslab.com";
