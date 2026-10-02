import { pageMetadata } from "@/lib/seo/metadata";
import LegalShell from "@/components/legal/LegalShell";

export const metadata = pageMetadata('Terms', 'Terms of use for The Under Over Club football prediction service.', "/terms");

export default function TermsPage() {
  return (
    <LegalShell
      eyebrow="LEGAL"
      title="Terms of Use"
      updated="20 August 2026"
    >
      <h2>1. About the service</h2>
      <p>
        The Under Over Club provides football match analysis, statistical
        information and prediction content. Free Picks and Paid Picks are
        informational products. We do not operate a bookmaker, accept wagers,
        hold betting funds or place bets on behalf of users.
      </p>

      <h2>2. No guarantee of results</h2>
      <p>
        Football outcomes are uncertain. A model probability, confidence score,
        historical win rate, value estimate or published prediction is not a
        guarantee that a selection will win. Past performance does not
        guarantee future results.
      </p>

      <h2>3. Eligibility and lawful use</h2>
      <p>
        You may use the service only if doing so is lawful where you are
        located. If you use prediction content in connection with gambling,
        you are responsible for complying with applicable age restrictions and
        local gambling laws.
      </p>

      <h2>4. Accounts</h2>
      <p>
        Some areas require an account. You are responsible for maintaining
        control of your account and for activity carried out through it. You
        must not attempt to bypass access controls, share paid-only content at
        scale, scrape protected areas, interfere with the service or misuse
        another person's account.
      </p>

      <h2>5. Paid access</h2>
      <p>
        The service may offer a Daily Pass and recurring Weekly, Monthly and
        Yearly plans. The checkout page shows the applicable price and billing
        interval before purchase. Recurring subscriptions continue until
        cancelled unless otherwise stated at checkout.
      </p>
      <p>
        A Daily Pass provides access for the purchase date shown during the
        checkout flow. Subscription access is linked to the account used for
        purchase.
      </p>

      <h2>6. Payments, cancellations and consumer rights</h2>
      <p>
        Payments are processed by our payment provider. Where a recurring plan
        is offered, you may cancel future renewals using the available billing
        controls. Cancellation does not remove any mandatory consumer rights
        that apply under law.
      </p>
      <p>
        If applicable law gives you withdrawal, refund or other consumer
        rights, those rights remain unaffected by these Terms. Digital-service
        access and immediate performance may affect statutory withdrawal rights
        in some jurisdictions, depending on the circumstances and any consent
        collected during checkout.
      </p>

      <h2>7. Published picks and statistics</h2>
      <p>
        We aim to preserve published selections and their publication-time
        values once they are made public. Results and statistics may be updated
        after matches settle, while the original published selection is
        intended to remain unchanged.
      </p>

      <h2>8. Availability and changes</h2>
      <p>
        We may maintain, update, suspend or modify parts of the service. Data
        providers, payment providers, authentication providers and other
        technical dependencies can experience outages or delays. We do not
        promise uninterrupted availability.
      </p>

      <h2>9. Intellectual property</h2>
      <p>
        The site design, branding, written analysis, model outputs and other
        original service content are protected by applicable intellectual
        property laws. Personal use of purchased content does not transfer
        ownership or grant a right to redistribute it commercially.
      </p>

      <h2>10. Limitation of responsibility</h2>
      <p>
        To the extent permitted by law, you remain responsible for decisions
        you make using the information provided by the service, including any
        decision to gamble or spend money. Nothing in these Terms excludes or
        limits liability where doing so would be prohibited by applicable law.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about these Terms can be sent to
        {" "}
        <a href="mailto:theunderoverclub@gmail.com">
          theunderoverclub@gmail.com
        </a>.
      </p>

      <div style={{ marginTop: 22, padding: 18, border: "1px solid #2c6846", background: "#0a1b11", color: "#b7c6bc" }}>
        Before scaling paid advertising, add the legal name, business address
        and any required company/VAT identification details for the operator
        once those details are confirmed.
      </div>
    </LegalShell>
  );
}
