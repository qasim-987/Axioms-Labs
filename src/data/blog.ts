export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: "Web Development" | "UI/UX Web Design" | "AI Agents";
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  publishedAt: string;
  readingTime: string;
  featured?: boolean;
  content: {
    introduction: string;
    sections: {
      heading: string;
      body: string;
      takeaways?: string[];
    }[];
    conclusion: string;
  };
  /** One internal link to the service this post genuinely relates to. */
  relatedService?: { slug: string; label: string };
}

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-build-ai-agents-that-actually-help-customers",
    title: "How to Build AI Agents That Actually Convert & Support Customers",
    excerpt:
      "Why most website chatbots frustrate visitors—and how grounded RAG retrieval, strict tool schemas, and smooth human handoff turn AI agents into reliable teammates.",
    category: "AI Agents",
    author: {
      name: "Axioms Lab Team",
      role: "AI & Web Engineering • Kuopio & Lahore",
      avatar: "AX",
    },
    publishedAt: "October 2026",
    readingTime: "8 min read",
    featured: true,
    content: {
      introduction:
        "Most businesses want AI to answer repetitive questions, qualify incoming leads, and book meetings 24/7. Yet generic prompt-only chatbots often guess answers or trap customers in loops. Here is the practical blueprint we use at Axioms Lab to ship reliable AI agents.",
      sections: [
        {
          heading: "1. Ground Every Answer in Verified Knowledge (RAG)",
          body: "An AI agent should never guess your pricing, policies, or service scope. By indexing your real help docs, website pages, and service FAQs into a hybrid vector search pipeline, the agent answers strictly from verified facts.",
          takeaways: [
            "Index real company docs, FAQs, and product pages with clear source citations.",
            "Instruct the agent to say when a question requires a human specialist.",
            "Keep content easy to refresh whenever your offers or pricing change.",
          ],
        },
        {
          heading: "2. Schema-Validated Tool Calling for Bookings & Leads",
          body: "When an agent books a calendar call or creates a CRM lead, every input—email, service interest, time zone—must pass strict Zod schema validation before touching your backend APIs.",
          takeaways: [
            "Validate every tool call parameter with strict TypeScript/Zod schemas.",
            "Restrict permissions so agents only execute approved safe actions.",
            "Log conversations so your team has full context before every call.",
          ],
        },
      {
        heading: "Guardrails We Ship by Default",
        body: "In our own stack, every agent-adjacent boundary is validated server-side: contact submissions are checked against strict Zod schemas in the API layer before anything is stored, our database runs with Row Level Security enabled and no public policies (deny by default), and secrets never reach the browser because external calls go through a server-side proxy. None of this is exotic — it is the minimum we consider shippable, and it is exactly the posture we bring to agent tool-calling: validate every parameter, deny by default, keep keys server-side.",
        takeaways: [
          "Validate tool-call parameters with strict schemas at the API boundary, not in the prompt.",
          "Deny by default at the data layer; grant only what the agent's task needs.",
          "Route external API calls through server-side proxies so credentials never ship to clients.",
        ],
      },
      {
        heading: "The First Agent We Would Ship You",
        body: "Not a do-everything assistant. The narrowest useful agent we know is a lead-qualification copilot on your contact form: it reads the enquiry, checks it against your service list and budget bands, drafts a structured brief for a human, and stops there. Our own contact form already captures the fields such an agent needs — service, budget band, goals and timeline — which is why this is the cheapest high-value starting point we can defend. The limit: it improves response quality, not response volume, and it needs a human in the loop from day one.",
        takeaways: [
          "Start with one workflow that already has structured inputs.",
          "Give the agent a write-up role before a write-access role.",
          "Measure handoff quality, not just containment rate.",
        ],
      },
      ],
      conclusion:
        "When AI agents combine accurate retrieval with clean UI integration and human handoff, they elevate your customer experience instead of getting in the way.",
    },
    relatedService: { slug: "ai-agents", label: "AI Agents" },
  },
  {
    slug: "nextjs-performance-checklist-for-99-lighthouse-websites",
    title: "Next.js 14 Performance Blueprint: How We Cut Homepage JavaScript 41% (385 kB to 227 kB)",
    excerpt:
      "The exact changes we shipped on our own site: lazy-loading the 3D stack, deleting paint-heavy blur effects, and keeping motion on the GPU — with the real before/after build numbers and their limits.",
    category: "Web Development",
    author: {
      name: "Axioms Lab Team",
      role: "Full-Stack Web Development",
      avatar: "AX",
    },
    publishedAt: "October 2026",
    readingTime: "7 min read",
    featured: false,
    content: {
      introduction:
        "Website speed directly impacts conversion rates and search rankings. A visually impressive site that takes four seconds to become interactive loses visitors before they ever read your headline.",
      sections: [
        {
          heading: "Keep Heavy Logic on the Server & Motion on the GPU",
          body: "By rendering static marketing and content sections with Next.js Server Components and animating only GPU-composited properties (transform and opacity), you preserve silky 60fps scrolling even on mid-range mobile devices.",
          takeaways: [
            "Use React Server Components by default to minimize client JavaScript bundles.",
            "Self-host variable or subset fonts to eliminate external layout shifts.",
            "Animate transform and opacity rather than layout-triggering width or top properties.",
          ],
        },
      {
        heading: "Make the 3D Library a Lazy Async Chunk",
        body: "Our homepage hero renders a WebGL particle sphere with three.js. Statically imported, that put the entire 3D stack on the critical path of every hard load. We switched the hero canvas to next/dynamic with ssr: false so three.js ships as a separate async chunk, and held the layout with a lightweight CSS radial glow that fades out when the canvas arrives. Server-rendered HTML stays complete for crawlers and first paint; the 3D layer enhances afterwards.",
        takeaways: [
          "Heavy visual libraries belong behind dynamic imports, not static ones.",
          "Reserve space with CSS so lazy layers never shift layout.",
          "Respect prefers-reduced-motion by skipping the canvas entirely.",
        ],
      },
      {
        heading: "Delete Paint-Heavy Effects Before Optimising Anything",
        body: "Entrance animations that animate filter: blur() force the browser to repaint large regions every frame. Replacing them with compositor-only properties (transform and opacity) removed that per-frame paint cost across the landing page. Combined with the chunk split above, our home route's first-load JavaScript fell from 385 kB to 227 kB in the next build output — a real, repeatable lab number from our own repository.",
        takeaways: [
          "Audit animations for layout- and paint-triggering properties first.",
          "Measure with build output before and after; guesswork wastes sprints.",
          "Code-split per route so below-fold sections pay their own way.",
        ],
      },
      {
        heading: "Know What Your Numbers Are — and Are Not",
        body: "First-load JavaScript size is a lab metric: reproducible, but blind to real networks, devices and caching. Core Web Vitals from real users (field data) is what Google actually weighs, and we do not yet have enough traffic to publish it honestly. Until we do, we label every figure on this site as a target or a lab result — and we suggest you hold any agency, including us, to the same standard.",
        takeaways: [
          "Label every published metric as target, lab result, or field data.",
          "Ship RUM (real-user monitoring) before claiming Core Web Vitals wins.",
          "Absence of field data is not a failure; hiding that absence is.",
        ],
      },
      ],
      conclusion:
        "High performance isn't an afterthought plugin—it is the result of disciplined architecture from the very first component. One honest caveat: the 385 kB to 227 kB figures above are first-load JavaScript sizes from our own next build output (a lab measurement on one route), not field data from real users, and a Lighthouse score on your machine will vary with device, network and extensions. Treat the numbers as direction, not a promise — and if you want this discipline applied to your own site, see our web development service.",
    },
    relatedService: { slug: "web-development", label: "Web Development" },
  },
  {
    slug: "high-converting-web-design-hierarchy-and-visual-storytelling",
    title: "Web Designing for Trust: Visual Hierarchy That Turns Visitors Into Leads",
    excerpt:
      "Great web designing isn't decoration—it guides the eye, builds immediate brand credibility, and makes taking the next step effortless.",
    category: "UI/UX Web Design",
    author: {
      name: "Axioms Lab Team",
      role: "Brand & Web Design",
      avatar: "AX",
    },
    publishedAt: "September 2026",
    readingTime: "7 min read",
    featured: false,
    content: {
      introduction:
        "Visitors form an impression of your brand in less than a second. Clean typography, intentional spacing, and clear calls to action separate memorable digital flagships from generic templates.",
      sections: [
        {
          heading: "Clarity Beats Visual Clutter Every Time",
          body: "Every section on your homepage should answer one clear question for your buyer: What do you do? Why should I trust your craft? How do we start working together?",
          takeaways: [
            "Pair expressive display headlines with generous whitespace and readable body copy.",
            "Design mobile layouts with the same care and polish as widescreen desktop views.",
            "Use purposeful micro-interactions to highlight key actions without distracting the reader.",
          ],
        },
      {
        heading: "The Section Order We Actually Use",
        body: "Our own landing page follows one rule: answer 'what do you do and for whom' before asking for anything. The order is hero statement with a single primary action, then production-stack proof, then the service disciplines, then delivery process with weekly cadences, then the contact form. Every section earns its scroll by reducing a specific doubt — capability, reliability, scope, process, risk — and the primary action repeats only after each doubt is addressed.",
        takeaways: [
          "Map each section to one doubt it removes.",
          "Keep one primary action per viewport; repeat it after proof, not before.",
          "Put process and cadence before the form — it prices the commitment honestly.",
        ],
      },
      {
        heading: "Contrast and Motion Are Hierarchy Tools, Not Decoration",
        body: "We run a two-ink system: near-black #121317 for headings and actions, mid-grey #45474D for supporting copy, on white — enough contrast that hierarchy survives with colour switched off. Motion follows the same discipline: entrances animate transform and opacity only, and every sequence is disabled under prefers-reduced-motion. Where we publish numbers (load times, scores), they are labelled as targets or lab results, because a hierarchy claim you cannot evidence is just decoration too.",
        takeaways: [
          "Test hierarchy in greyscale before shipping colour.",
          "Compositor-only motion keeps scroll hierarchy intact on weak devices.",
          "Label every metric as target, lab result, or field data.",
        ],
      },
      ],
      conclusion:
        "Thoughtful web designing turns your website into your hardest-working salesperson around the clock.",
    },
    relatedService: { slug: "ui-ux-design", label: "UI/UX Web Design" },
  },
  {
    slug: "figma-to-code-ui-ux-design-systems-that-scale",
    title: "From Figma Tokens to Production React: Building Scalable UI/UX Systems",
    excerpt:
      "How structured Figma variables, reusable component kits, and interactive user flows cut development rework in half.",
    category: "UI/UX Web Design",
    author: {
      name: "Axioms Lab Team",
      role: "Product UI/UX Design",
      avatar: "AX",
    },
    publishedAt: "September 2026",
    readingTime: "8 min read",
    featured: false,
    content: {
      introduction:
        "Nothing slows down a product launch more than inconsistent buttons, unclear user states, and guesswork between designers and developers. A clean UI/UX design system solves this from day one.",
      sections: [
        {
          heading: "Design Components Once, Ship Everywhere",
          body: "When spacing scales, color tokens, typography, and empty/loading/error states are defined systematically in Figma, translating them into Tailwind CSS and React components becomes fast and predictable.",
          takeaways: [
            "Map user journeys and wireframes before jumping into high-fidelity visual polish.",
            "Document hover, focus, loading, and validation states for every interactive element.",
            "Keep accessibility (WCAG AA contrast and keyboard navigation) baked into your base tokens.",
          ],
        },
      {
        heading: "One Source of Truth: Tokens as TypeScript, Not Just Figma Variables",
        body: "Figma variables only survive contact with code if they live somewhere both sides import. In our repository, brand constants (colours, copy, contact details) sit in typed config modules, and UI components consume them directly — the same module feeds the navbar, the pricing blocks on service pages and the contact form, so a token change is one edit with compiler-checked reach. Your Figma variable names should mirror those module keys exactly; the naming map is the handoff.",
        takeaways: [
          "Publish tokens from typed config modules, not screenshots or PDFs.",
          "Mirror Figma variable names to code keys one-to-one.",
          "Let the compiler verify token reach across components.",
        ],
      },
      {
        heading: "Where Token Systems Break (and How We Contain It)",
        body: "Three failure modes we watch: one-off hex values sneaking into components (we review diffs for raw literals), state styles multiplying faster than states (hover/focus/disabled variants are declared once per component), and arbitrary-value drift in Tailwind classes when a token is missing (the fix is adding the token, not the literal). None of this needs tooling beyond code review and a shared component library — but it does need the discipline to say no to the fast workaround.",
        takeaways: [
          "Review diffs for raw colour literals.",
          "Declare state variants once, per component.",
          "Missing token? Add the token, never the literal.",
        ],
      },
      ],
      conclusion:
        "A cohesive UI/UX system gives your product an unmistakable sense of quality today while letting your team ship new features twice as fast tomorrow.",
    },
    relatedService: { slug: "ui-ux-design", label: "UI/UX Web Design" },
  },
];

export const blogCategories = [
  "All",
  "Web Development",
  "UI/UX Web Design",
  "AI Agents",
] as const;
