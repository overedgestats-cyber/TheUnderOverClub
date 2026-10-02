import { pageMetadata } from "@/lib/seo/metadata";
import LegalShell from "@/components/legal/LegalShell";

export const metadata = pageMetadata('Privacy', 'Privacy information for The Under Over Club.', "/privacy");

export default function PrivacyPage() {
  return (
    <LegalShell
      eyebrow="PRIVACY"
      title="Privacy Policy"
      updated="20 August 2026"
    >
      <h2>1. Scope</h2>
      <p>
        This Privacy Policy explains the types of personal data that may be
        processed when you use The Under Over Club, why the data is used and
        the choices available to you.
      </p>

      <h2>2. Data we may process</h2>
      <ul>
        <li>
          Account information such as name, email address, profile image and
          authentication provider.
        </li>
        <li>
          Subscription and entitlement information, including plan, status,
          purchase date, renewal/cancellation state and payment-provider
          references.
        </li>
        <li>
          Technical information such as request logs, device/browser data,
          security events and basic usage information needed to operate and
          protect the service.
        </li>
        <li>
          Messages you send to support.
        </li>
      </ul>

      <h2>3. Payment data</h2>
      <p>
        Card details are handled by Stripe rather than stored directly by The
        Under Over Club. We may receive identifiers and status information
        needed to confirm purchases, subscriptions, renewals, cancellations
        and payment outcomes.
      </p>

      <h2>4. Authentication</h2>
      <p>
        Authentication is provided through Clerk. Depending on the sign-in
        method you choose, Clerk and the relevant identity provider may process
        information necessary to authenticate you.
      </p>

      <h2>5. How data is used</h2>
      <ul>
        <li>Provide and secure your account.</li>
        <li>Grant or revoke access to paid features.</li>
        <li>Process and reconcile subscription events.</li>
        <li>Operate, troubleshoot and improve the service.</li>
        <li>Prevent abuse, fraud and unauthorized access.</li>
        <li>Respond to support requests.</li>
        <li>Comply with applicable legal obligations.</li>
      </ul>

      <h2>6. Legal bases</h2>
      <p>
        Depending on the processing activity and applicable law, processing
        may be necessary to perform a contract with you, comply with legal
        obligations, pursue legitimate interests such as security and service
        operation, or rely on consent where consent is required.
      </p>

      <h2>7. Service providers</h2>
      <p>
        We use third-party infrastructure and service providers, including
        providers for authentication, payments, hosting and database services.
        Those providers may process personal data according to their own terms,
        data-processing arrangements and applicable law.
      </p>

      <h2>8. Retention</h2>
      <p>
        Personal data is kept only for as long as reasonably necessary for the
        purpose for which it was collected, including account operation,
        billing records, security, dispute handling and legal obligations.
      </p>

      <h2>9. Your rights</h2>
      <p>
        Depending on applicable data-protection law, you may have rights to
        request access, correction, deletion, restriction, portability or an
        objection to certain processing. You may also have a right to complain
        to the competent supervisory authority.
      </p>

      <h2>10. Cookies and analytics</h2>
      <p>
        The service may use strictly necessary technologies for sign-in,
        security and session management. If optional analytics or advertising
        technologies are introduced, they should be disclosed and, where
        required, presented through an appropriate consent mechanism before
        activation.
      </p>

      <h2>11. Contact</h2>
      <p>
        Privacy requests can be sent to
        {" "}
        <a href="mailto:theunderoverclub@gmail.com">
          theunderoverclub@gmail.com
        </a>.
      </p>

      <div style={{ marginTop: 22, padding: 18, border: "1px solid #2c6846", background: "#0a1b11", color: "#b7c6bc" }}>
        Before launch at scale, add the confirmed legal identity and contact
        details of the data controller and, if applicable, the competent
        supervisory-authority information.
      </div>
    </LegalShell>
  );
}
