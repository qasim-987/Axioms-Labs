export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: "Web Development" | "Web Designing" | "UI/UX Design" | "AI Agents";
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
}

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-build-ai-agents-that-actually-help-customers",
    title: "How to Build AI Agents That Actually Convert & Support Customers",
    excerpt:
      "Why most website chatbots frustrate visitors—and how grounded RAG retrieval, strict tool schemas, and smooth human handoff turn AI agents into reliable teammates.",
    category: "AI Agents",
    author: {
      name: "Axiom Studio Team",
      role: "AI & Web Engineering • Kuopio & Lahore",
      avatar: "AX",
    },
    publishedAt: "October 2026",
    readingTime: "6 min read",
    featured: true,
    content: {
      introduction:
        "Most businesses want AI to answer repetitive questions, qualify incoming leads, and book meetings 24/7. Yet generic prompt-only chatbots often guess answers or trap customers in loops. Here is the practical blueprint we use at Axiom Studio to ship reliable AI agents.",
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
      ],
      conclusion:
        "When AI agents combine accurate retrieval with clean UI integration and human handoff, they elevate your customer experience instead of getting in the way.",
    },
  },
  {
    slug: "nextjs-performance-checklist-for-99-lighthouse-websites",
    title: "Next.js 14 Performance Blueprint: Hitting 99+ Lighthouse Scores",
    excerpt:
      "How clean Server Components, zero-jank animations, and smart asset loading make modern business websites feel instantaneous on every device.",
    category: "Web Development",
    author: {
      name: "Axiom Studio Team",
      role: "Full-Stack Web Development",
      avatar: "AX",
    },
    publishedAt: "October 2026",
    readingTime: "5 min read",
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
      ],
      conclusion:
        "High performance isn't an afterthought plugin—it is the result of disciplined architecture from the very first component.",
    },
  },
  {
    slug: "high-converting-web-design-hierarchy-and-visual-storytelling",
    title: "Web Designing for Trust: Visual Hierarchy That Turns Visitors Into Leads",
    excerpt:
      "Great web designing isn't decoration—it guides the eye, builds immediate brand credibility, and makes taking the next step effortless.",
    category: "Web Designing",
    author: {
      name: "Axiom Studio Team",
      role: "Brand & Web Design",
      avatar: "AX",
    },
    publishedAt: "September 2026",
    readingTime: "5 min read",
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
      ],
      conclusion:
        "Thoughtful web designing turns your website into your hardest-working salesperson around the clock.",
    },
  },
  {
    slug: "figma-to-code-ui-ux-design-systems-that-scale",
    title: "From Figma Tokens to Production React: Building Scalable UI/UX Systems",
    excerpt:
      "How structured Figma variables, reusable component kits, and interactive user flows cut development rework in half.",
    category: "UI/UX Design",
    author: {
      name: "Axiom Studio Team",
      role: "Product UI/UX Design",
      avatar: "AX",
    },
    publishedAt: "September 2026",
    readingTime: "6 min read",
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
      ],
      conclusion:
        "A cohesive UI/UX system gives your product an unmistakable sense of quality today while letting your team ship new features twice as fast tomorrow.",
    },
  },
];

export const blogCategories = [
  "All",
  "Web Development",
  "Web Designing",
  "UI/UX Design",
  "AI Agents",
] as const;
