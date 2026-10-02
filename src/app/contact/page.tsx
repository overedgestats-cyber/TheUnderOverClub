import { pageMetadata } from "@/lib/seo/metadata";
import LegalShell from "@/components/legal/LegalShell";

export const metadata = pageMetadata('Contact', 'Contact The Under Over Club for account, billing or service support.', "/contact");

export default function ContactPage() {
  return (
    <LegalShell
      eyebrow="SUPPORT"
      title="Contact"
      updated="20 August 2026"
    >
      <h2>Support</h2>
      <p>
        For account, access, billing, privacy or technical questions, contact:
      </p>

      <p>
        <a href="mailto:theunderoverclub@gmail.com">
          theunderoverclub@gmail.com
        </a>
      </p>

      <h2>When contacting support</h2>
      <p>
        Include the email address used for your account and a short description
        of the issue. Do not send passwords, full card numbers, authentication
        codes or other sensitive credentials.
      </p>

      <h2>Billing questions</h2>
      <p>
        If your account has an active Stripe customer profile, use the billing
        controls in your account where available for subscription management.
        For an access problem after a successful payment, contact support and
        include the approximate purchase time.
      </p>

      <h2>Prediction questions</h2>
      <p>
        Published picks are generated through the service's model and
        publication process. Support cannot change a published selection after
        publication or retroactively replace a losing pick.
      </p>

      <h2>Response time</h2>
      <p>
        We aim to respond as soon as reasonably possible. Response times may
        vary, especially outside normal working hours.
      </p>
    </LegalShell>
  );
}
