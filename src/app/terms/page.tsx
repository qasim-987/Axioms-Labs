import React from "react";
import Footer from "@/components/Footer";
import { SITE_EMAIL, SITE_URL } from "@/config/site";

export const metadata = {
  title: "Terms of Service | Axioms Lab",
  description:
    "The terms under which Axioms Lab provides UI/UX Web Design, Web Development, and AI Agent services, including quotes, payments, ownership, and liability.",
  alternates: { canonical: `${SITE_URL}/terms` },
};

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#121317] mb-3">
        {title}
      </h2>
      <div className="space-y-3 text-sm sm:text-[15px] leading-relaxed text-[#45474D]">
        {children}
      </div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FFFFFF] text-[#121317]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-24">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F5FF] border border-[#0061FD]/15 text-[11px] font-mono uppercase tracking-[0.2em] text-[#0061FD] mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0061FD]" />
          Legal
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] mb-4">
          Terms of Service
        </h1>
        <p className="text-xs font-mono text-[#6A6A71] mb-10">
          Last updated: November 2026
        </p>

        <div className="space-y-10">
          <Section id="about" title="1. About these terms">
            <p>
              These terms govern use of www.axiomslab.com and the services
              offered by Axioms Lab (&ldquo;we&rdquo;, &ldquo;us&rdquo;). A
              signed proposal, quote, or written agreement between us
              (&ldquo;Contract&rdquo;) complements these terms; if the
              Contract states something different, the Contract wins.
              Using our website or ordering services means you accept these
              terms.
            </p>
          </Section>

          <Section id="services" title="2. Services">
            <p>
              We provide UI/UX web design, web development, AI agents and
              automation work, and related consulting. The exact scope,
              deliverables, and timeline for every engagement are described
              in its quote or Contract — work outside that scope is agreed
              separately before it starts.
            </p>
          </Section>

          <Section id="quotes" title="3. Quotes and pricing">
            <p>
              Quotes are valid for 7 days from the date issued unless the
              quote states otherwise. Fixed-price packages cover exactly
              what the package describes; additional pages, features, or
              revisions beyond the agreed scope are quoted and approved
              before being built.
            </p>
          </Section>

          <Section id="payment" title="4. Payment">
            <p>
              Unless the Contract states otherwise: 50% of the agreed price
              is due in advance before work begins, and the remaining 50% is
              due at delivery or handover. Invoices are issued by email and
              are payable within 7 days. We may pause work or withhold
              handover credentials while an invoice is overdue.
            </p>
          </Section>

          <Section id="timelines" title="5. Timelines and delays">
            <p>
              Delivery schedules (for example a 7-day website package) start
              once the advance payment is received and we have everything
              we need from you: content, logos, brand assets, and access to
              accounts or domains. Delays in providing materials, feedback,
              or approvals shift the delivery date day for day.
            </p>
          </Section>

          <Section id="client-responsibilities" title="6. Your responsibilities">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Provide accurate information and materials, and confirm you
                have the rights to everything you supply (text, images,
                logos, data).
              </li>
              <li>
                Review work promptly and give clear approvals or change
                requests within agreed review windows.
              </li>
              <li>
                Keep credentials you control (domains, hosting, ad
                accounts) secure, and use delivered work lawfully.
              </li>
            </ul>
          </Section>

          <Section id="our-commitments" title="7. Our commitments and warranty">
            <p>
              We perform all work with professional care and keep you
              updated on progress. After handover we fix bugs — meaning
              defects where the delivered work does not behave as its
              specification describes — free of charge for 14 days. New
              features, content changes, and issues caused by third-party
              changes are not bugs and are quoted separately.
            </p>
          </Section>

          <Section id="ownership" title="8. Intellectual property">
            <p>
              On full payment, you own the deliverables created specifically
              for you (designs, pages, copy we wrote for the project, and
              project source code). We retain ownership of our pre-existing
              tools, frameworks, templates, and know-how, granting you a
              perpetual licence to use them as part of the deliverables.
              Unless agreed otherwise in writing, we may display completed
              work in our portfolio and case studies.
            </p>
          </Section>

          <Section id="third-party" title="9. Third-party services">
            <p>
              Projects often rely on third-party services — hosting,
              domains, payment providers, messaging platforms such as
              Meta&apos;s WhatsApp Cloud API, and AI model providers. Those
              services are governed by their own terms; we are not
              responsible for their outages, price changes, policy changes,
              or account decisions affecting you.
            </p>
          </Section>

          <Section id="no-guarantees" title="10. No guarantees of outcomes">
            <p>
              We build to agreed specifications and good practice. We do not
              guarantee search-engine rankings, traffic, leads, revenue, or
              any other business outcome; anyone promising those is
              guessing. Statements about expected results in our materials
              are estimates, not commitments.
            </p>
          </Section>

          <Section id="liability" title="11. Liability">
            <p>
              To the extent permitted by law, our total liability for any
              claim arising from an engagement is limited to the fees you
              paid us for that engagement. We are not liable for indirect
              losses such as lost profits, lost data you failed to back up,
              or business interruption, except where caused by our wilful
              misconduct or where the law forbids such a limit.
            </p>
          </Section>

          <Section id="termination" title="12. Termination">
            <p>
              Either party may end an engagement with written notice if the
              other materially breaches these terms or the Contract and
              does not fix it within 14 days of being told. On termination
              you pay for work completed to date, and we hand over whatever
              is paid for in its current state.
            </p>
          </Section>

          <Section id="law" title="13. Governing law and disputes">
            <p>
              These terms are governed by the laws of Finland, our EU hub,
              unless the Contract selects another jurisdiction. Before any
              formal procedure, both sides agree to try to resolve disputes
              in good faith by direct conversation.
            </p>
          </Section>

          <Section id="changes" title="14. Changes to these terms">
            <p>
              We may revise these terms; the version published on this page
              with the &ldquo;last updated&rdquo; date above applies to new
              engagements, while ongoing Contracts keep the terms in force
              when they were signed.
            </p>
          </Section>

          <Section id="contact" title="15. Contact">
            <p>
              Axioms Lab — Kuopio, Finland &amp; Lahore, Pakistan.
              <br />
              Email:{" "}
              <a
                href={`mailto:${SITE_EMAIL}`}
                className="font-medium text-[#0061FD] hover:underline"
              >
                {SITE_EMAIL}
              </a>
            </p>
          </Section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
