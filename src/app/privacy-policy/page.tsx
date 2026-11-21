import React from "react";
import Footer from "@/components/Footer";
import { SITE_EMAIL, SITE_URL } from "@/config/site";

export const metadata = {
  title: "Privacy Policy | Axioms Lab",
  description:
    "How Axioms Lab collects, uses, shares, and protects personal data on axiomslab.com, including contact briefs, AI assistant conversations, and WhatsApp messages.",
  alternates: { canonical: `${SITE_URL}/privacy-policy` },
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

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#FFFFFF] text-[#121317]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-24">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F5FF] border border-[#0061FD]/15 text-[11px] font-mono uppercase tracking-[0.2em] text-[#0061FD] mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0061FD]" />
          Legal
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] mb-4">
          Privacy Policy
        </h1>
        <p className="text-xs font-mono text-[#6A6A71] mb-10">
          Last updated: November 2026
        </p>

        <div className="space-y-10">
          <Section id="who-we-are" title="1. Who we are">
            <p>
              Axioms Lab (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;)
              is a digital product and AI studio operating from Kuopio,
              Finland and Lahore, Pakistan. We are the controller of the
              personal data described in this policy for our website{" "}
              <span className="font-semibold text-[#121317]">
                www.axiomslab.com
              </span>{" "}
              and our related services. Questions about this policy can be
              sent to{" "}
              <a
                href={`mailto:${SITE_EMAIL}`}
                className="font-medium text-[#0061FD] hover:underline"
              >
                {SITE_EMAIL}
              </a>
              .
            </p>
          </Section>

          <Section id="data-we-collect" title="2. Information we collect">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-semibold text-[#121317]">
                  Contact and project briefs.
                </span>{" "}
                When you submit our contact form or complete a project brief
                with our website assistant, we collect the details you
                provide, such as your name, email address, company, and
                project requirements.
              </li>
              <li>
                <span className="font-semibold text-[#121317]">
                  Assistant conversations.
                </span>{" "}
                Messages you type into our AI assistant while shaping a
                project brief, so the conversation can continue across
                visits and our team can follow up.
              </li>
              <li>
                <span className="font-semibold text-[#121317]">
                  WhatsApp messages.
                </span>{" "}
                If you message us on WhatsApp, we receive your phone number
                and message content through the Meta WhatsApp Cloud API, and
                we keep a thread history so our team can reply in context.
              </li>
              <li>
                <span className="font-semibold text-[#121317]">
                  Usage and performance data.
                </span>{" "}
                Aggregated, privacy-friendly site metrics (such as page
                views and performance timings) provided by our hosting
                platform. We do not run advertising trackers or sell
                browsing data.
              </li>
            </ul>
          </Section>

          <Section id="how-we-use" title="3. How we use information">
            <ul className="list-disc pl-5 space-y-2">
              <li>Respond to inquiries and prepare proposals.</li>
              <li>Deliver, maintain, and support services you order.</li>
              <li>
                Keep internal records of conversations and follow-ups in our
                private staff dashboard.
              </li>
              <li>
                Improve our website, services, and documentation based on
                aggregated usage signals.
              </li>
              <li>Comply with legal and accounting obligations.</li>
            </ul>
            <p>
              We do not sell personal data, and we do not share it with third
              parties for their own marketing.
            </p>
          </Section>

          <Section id="legal-bases" title="4. Legal bases (GDPR)">
            <p>
              Where the EU/EEA GDPR applies, we rely on: your{" "}
              <span className="font-semibold text-[#121317]">consent</span>{" "}
              when you contact us or message us on WhatsApp; the{" "}
              <span className="font-semibold text-[#121317]">
                performance of a contract
              </span>{" "}
              when you engage our services; our{" "}
              <span className="font-semibold text-[#121317]">
                legitimate interests
              </span>{" "}
              in running a secure website and understanding aggregated
              usage; and{" "}
              <span className="font-semibold text-[#121317]">
                legal obligations
              </span>{" "}
              for records we must keep.
            </p>
          </Section>

          <Section id="processors" title="5. Who we share information with">
            <p>
              We share data only with service providers who act on our
              behalf under confidentiality:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-semibold text-[#121317]">Vercel</span> —
                website and API hosting.
              </li>
              <li>
                <span className="font-semibold text-[#121317]">Supabase</span>{" "}
                — database storage for inquiries, briefs, and message
                threads.
              </li>
              <li>
                <span className="font-semibold text-[#121317]">Resend</span> —
                delivery of notification emails to our team.
              </li>
              <li>
                <span className="font-semibold text-[#121317]">Groq</span> —
                language-model inference for our website assistant.
              </li>
              <li>
                <span className="font-semibold text-[#121317]">
                  Meta Platforms
                </span>{" "}
                — transport of WhatsApp messages via the WhatsApp Cloud
                API, subject to Meta&apos;s own terms and privacy policy.
              </li>
            </ul>
          </Section>

          <Section id="transfers" title="6. International transfers">
            <p>
              Some of our providers process data outside the EU/EEA
              (including the United States and Pakistan). Where required,
              transfers rely on EU Standard Contractual Clauses, adequacy
              decisions, or the provider&apos;s certified transfer
              mechanisms. Our own team operates in both Finland and
              Pakistan as part of delivering our services.
            </p>
          </Section>

          <Section id="retention" title="7. Data retention">
            <p>
              We keep personal data only as long as needed for the purposes
              above: inquiry and brief records for as long as the
              conversation or client relationship remains relevant and as
              required by accounting law; WhatsApp thread history while
              needed to provide continuity of support. You can ask us to
              delete your data at any time, and we will honour valid
              requests unless a legal obligation requires retention.
            </p>
          </Section>

          <Section id="whatsapp" title="8. WhatsApp messaging">
            <p>
              When you message us on WhatsApp, messages are processed
              through Meta&apos;s WhatsApp Cloud API so our team can reply.
              We use your number only to respond to and manage your
              conversation — not for unsolicited marketing. You can ask us
              to pause automated replies or delete your thread at any time
              by emailing{" "}
              <a
                href={`mailto:${SITE_EMAIL}`}
                className="font-medium text-[#0061FD] hover:underline"
              >
                {SITE_EMAIL}
              </a>
              . Meta&apos;s handling of WhatsApp data is governed by
              Meta&apos;s terms and privacy policy.
            </p>
          </Section>

          <Section id="your-rights" title="9. Your rights">
            <p>
              If you are in the EEA, UK, or another jurisdiction with
              similar laws, you can request: access to your data;
              correction of inaccurate data; deletion; restriction or
              objection to processing; portability; and withdrawal of
              consent where we rely on it. Email{" "}
              <a
                href={`mailto:${SITE_EMAIL}`}
                className="font-medium text-[#0061FD] hover:underline"
              >
                {SITE_EMAIL}
              </a>{" "}
              and we will respond without undue delay. You also have the
              right to complain to a supervisory authority; in Finland this
              is the Office of the Data Protection Ombudsman
              (tietosuoja.fi).
            </p>
          </Section>

          <Section id="children" title="10. Children">
            <p>
              Our website and services are intended for business use and are
              not directed at children. We do not knowingly collect personal
              data from anyone under 16.
            </p>
          </Section>

          <Section id="security" title="11. Security">
            <p>
              We protect data with encrypted transport (TLS), access
              controls, a sign-in protected staff dashboard, and
              server-side credentials that are never exposed to browsers.
              No system is perfectly secure; if a breach affecting your
              data occurs, we will notify affected individuals and
              authorities where the law requires.
            </p>
          </Section>

          <Section id="changes" title="12. Changes to this policy">
            <p>
              We may update this policy as our services evolve. The
              &ldquo;last updated&rdquo; date above always reflects the
              current version published on this page.
            </p>
          </Section>

          <Section id="contact" title="13. Contact">
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
