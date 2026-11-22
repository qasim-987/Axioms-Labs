/**
 * Engagement-first pricing stance (owner directive, November 2026): the site
 * publishes NO price list. Every project is quoted individually after a
 * scoping conversation (AI assistant brief or contact form), so visitors are
 * invited into a conversation instead of being screened by numbers.
 *
 * The budget bands below are the visitor's OWN budget hint captured in the
 * brief - never published rates - and the default stays "Not sure yet".
 */
export const pricing = {
  budgetBands: [
    "Under $500", // TODO(owner): confirm
    "$500 - $1,500", // TODO(owner): confirm
    "$1,500 - $3,500", // TODO(owner): confirm
    "$3,500 - $7,500", // TODO(owner): confirm
    "$7,500+", // TODO(owner): confirm
    "Not sure yet, let's talk", // TODO(owner): confirm
  ],
  copy: {
    engagement:
      "No public price list - every project is quoted individually after a short scoping chat.",
    disclaimer: "Scope and quote are agreed in writing before work begins.",
  },
} as const;
export const DEFAULT_BUDGET: string = pricing.budgetBands[5];
