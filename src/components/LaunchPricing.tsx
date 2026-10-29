import { formatPrice, getServicePricing, pricing, startingPriceText } from "@/config/pricing";
export function PricingTrustCopy() {
  return <p className="pricing-trust text-xs leading-relaxed text-[#6A6A71]">{pricing.copy.launch}{pricing.copy.showConsultation ? ` · ${pricing.copy.consultation}` : ""}</p>;
}
export default function LaunchPricing({slug}:{slug:string}) {
  const item=getServicePricing(slug);
  if(!item)return null;
  return <aside className="launch-pricing mt-6 rounded-2xl border border-[#212226]/10 bg-[#F8F9FC] p-4 text-left max-w-lg mx-auto lg:mx-0">
    <p className="text-lg font-semibold text-[#121317]">{startingPriceText(slug)}</p>
    <p className="mt-1 text-sm text-[#45474D]">Typical project range: {formatPrice(item.typicalRange[0])}–{formatPrice(item.typicalRange[1])}</p>
    {"customAppStartingPrice" in item && <p className="mt-1 text-sm text-[#45474D]">Custom web apps / SaaS dashboards: starting from {formatPrice(item.customAppStartingPrice)}</p>}
    <div className="mt-2"><PricingTrustCopy /></div><p className="mt-1 text-xs text-[#6A6A71]">{pricing.copy.disclaimer}</p>
  </aside>;
}
