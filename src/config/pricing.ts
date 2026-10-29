/** Owner-supplied portfolio-launch placeholders, NOT market research or fixed quotes. */
export const pricing = {
  currency: "USD", // TODO(owner): confirm
  locale: "en-US", // TODO(owner): confirm
  services: {
    "ui-ux-design": {
      startingPrice: 300, // TODO(owner): confirm
      typicalRange: [300, 1500], // TODO(owner): confirm
    },
    "web-designing": {
      startingPrice: 250, // TODO(owner): confirm
      typicalRange: [250, 1200], // TODO(owner): confirm
    },
    "web-development": {
      startingPrice: 600, // TODO(owner): confirm
      typicalRange: [600, 3500], // TODO(owner): confirm
      customAppStartingPrice: 2000, // TODO(owner): confirm
    },
    "ai-agents": {
      startingPrice: 800, // TODO(owner): confirm
      typicalRange: [800, 5000], // TODO(owner): confirm
    },
  },
  budgetBands: [
    "Under $500", // TODO(owner): confirm
    "$500 - $1,500", // TODO(owner): confirm
    "$1,500 - $3,500", // TODO(owner): confirm
    "$3,500 - $7,500", // TODO(owner): confirm
    "$7,500+", // TODO(owner): confirm
    "Not sure yet, let's talk", // TODO(owner): confirm
  ],
  copy: {
    launch: "Launch pricing for our first clients", // TODO(owner): confirm
    consultation: "Free 30-minute consultation", // TODO(owner): confirm offer before enabling
    showConsultation: false, // TODO(owner): confirm; no unverified free offer is published
    disclaimer: "Starting estimates only. Final scope and quote are agreed before work begins.",
  },
} as const;
export type PricedService = keyof typeof pricing.services;
export const DEFAULT_BUDGET: string = pricing.budgetBands[5];
export const formatPrice = (value:number) => new Intl.NumberFormat(pricing.locale,{style:"currency",currency:pricing.currency,maximumFractionDigits:0}).format(value);
export function getServicePricing(slug:string) { return pricing.services[slug as PricedService]; }
export function startingPriceText(slug:string) { const value=getServicePricing(slug);return value ? `Starting from ${formatPrice(value.startingPrice)}` : "Scope and quote on request"; }
export function pricingDescription(slug:string) { const value=getServicePricing(slug);return value?`${startingPriceText(slug)}. Typical project range ${formatPrice(value.typicalRange[0])}–${formatPrice(value.typicalRange[1])}. ${pricing.copy.disclaimer}`:""; }
