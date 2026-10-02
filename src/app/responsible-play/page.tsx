import { pageMetadata } from "@/lib/seo/metadata";
import LegalShell from "@/components/legal/LegalShell";

export const metadata = pageMetadata('Responsible Play', 'Responsible-use guidance for football prediction content.', "/responsible-play");

export default function ResponsiblePlayPage() {
  return (
    <LegalShell
      eyebrow="RESPONSIBLE USE"
      title="Responsible Play"
      updated="20 August 2026"
    >
      <h2>Predictions are not guarantees</h2>
      <p>
        The Under Over Club publishes statistical football predictions. Every
        prediction can lose. No confidence score, model probability, price or
        historical record removes the uncertainty of a football match.
      </p>

      <h2>Set limits before you start</h2>
      <p>
        If you choose to bet, decide in advance how much money and time you can
        afford to spend. Do not increase stakes because of a losing run and do
        not treat gambling as a way to recover losses or solve financial
        problems.
      </p>

      <h2>Use units, not emotion</h2>
      <p>
        Our performance reporting uses a simple one-unit-per-pick convention so
        results can be compared consistently. It is a reporting method, not a
        recommendation about how much money you should stake.
      </p>

      <h2>Never borrow to gamble</h2>
      <p>
        Do not gamble with borrowed money, money needed for rent, bills, food,
        debt payments or other essential expenses.
      </p>

      <h2>Take warning signs seriously</h2>
      <p>
        Warning signs can include chasing losses, hiding gambling activity,
        borrowing to gamble, repeatedly exceeding limits or feeling unable to
        stop. If gambling is becoming difficult to control, stop using betting
        services and use the support or self-exclusion resources available in
        your jurisdiction.
      </p>

      <h2>Age and local law</h2>
      <p>
        Do not use prediction content for gambling if you are below the legal
        gambling age where you live or if gambling is unlawful in your
        jurisdiction.
      </p>

      <h2>Our role</h2>
      <p>
        The Under Over Club is a prediction and information service. It does
        not accept bets, hold betting balances or operate gambling games for
        real-money wagering.
      </p>

      <p>
        If you want to contact us about responsible-use concerns, email
        {" "}
        <a href="mailto:theunderoverclub@gmail.com">
          theunderoverclub@gmail.com
        </a>.
      </p>
    </LegalShell>
  );
}
