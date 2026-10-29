import { ICON_ONLY_BELOW } from "@/config/responsive";
import { hasServiceToolIcon, renderServiceToolIcon } from "./ServiceToolIcons";
/** Existing parent styling is retained at desktop widths. CSS controls mobile-only presentation. */
export default function ToolChipContent({name}:{name:string}) {
  const icon=hasServiceToolIcon(name);
  return <span className={`responsive-tool-chip ${icon?"has-tool-icon":"text-only-tool"}`} data-icon-only-below={ICON_ONLY_BELOW} title={name} aria-label={name} role="img">
    {icon && <span aria-hidden="true" className="responsive-tool-logo">{renderServiceToolIcon(name)}</span>}
    <span className="responsive-tool-name">{name}</span>
  </span>;
}
