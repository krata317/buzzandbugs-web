import { Link } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { LegalPage } from './LegalPage';

export function PrivacyPage() {
  useDocumentTitle('Privacy Policy');

  return (
    <LegalPage
      title="Privacy Policy"
      updated="6 November 2026"
      intro="What Buzz and Bugs collects, why it is collected, how long it is kept, and what you can ask us to do with it."
    >
      <section>
        <h2>1. What we collect</h2>
        <ul>
          <li>
            <strong>Account data:</strong> email address, username, display name, and a password
            stored only as a one-way hash.
          </li>
          <li>
            <strong>Profile data you choose to add:</strong> a short biography, links to other
            profiles, and an uploaded profile picture.
          </li>
          <li>
            <strong>Content you publish:</strong> posts, replies, votes, reports and appeals.
          </li>
          <li>
            <strong>Session data:</strong> a session identifier, the time it was created and last
            used, its expiry, and a truncated browser identifier. IP addresses are stored only as a
            keyed hash, never in plain text.
          </li>
          <li>
            <strong>Operational records:</strong> reports while their moderation case exists,
            moderation decisions, warnings and bans, email delivery records, and administrative
            audit entries.
          </li>
        </ul>
        <p>
          We do not use advertising trackers or third-party analytics scripts, and we do not sell
          personal data.
        </p>
      </section>

      <section>
        <h2>2. Why we use it</h2>
        <ul>
          <li>to create and secure your account, and to verify your email address;</li>
          <li>to publish your content and show it to the people who should see it;</li>
          <li>to deliver notifications you have asked for;</li>
          <li>to review reports, apply moderation decisions and handle appeals;</li>
          <li>to detect abuse, enforce rate limits and keep the service available;</li>
          <li>to meet legal obligations where they apply.</li>
        </ul>
      </section>

      <section>
        <h2>3. Cookies and sessions</h2>
        <p>
          Signing in sets two cookies. A session cookie keeps you signed in for up to 90 days and is
          not readable by scripts. A second, readable cookie is used to protect forms against
          cross-site request forgery; it contains no personal information. Signing out, changing your
          password, or deleting your account invalidates the session on the server.
        </p>
        <p>
          Your theme and sidebar preferences are stored in your browser, not on our servers, unless
          you are signed in and have chosen to save them to your account.
        </p>
      </section>

      <section>
        <h2>4. Who else is involved</h2>
        <ul>
          <li>
            <strong>Email delivery:</strong> transactional email is sent through the email provider
            configured by the operator.
          </li>
          <li>
            <strong>Automated content checks:</strong> when enabled, the text of a post may be sent
            to OpenAI&apos;s moderation service to classify it. Reports and appeals are reviewed by
            a person.
          </li>
          <li>
            <strong>Fonts:</strong> typefaces are loaded from Google Fonts, which receives the
            request for the font files.
          </li>
          <li>
            <strong>Publishers:</strong> news, podcast, event and trending items link to external
            sites. We do not send them your account information.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. How long we keep it</h2>
        <ul>
          <li>Sessions expire after 90 days, or sooner if revoked.</li>
          <li>Notifications are deleted 14 days after they are created.</li>
          <li>
            A report is kept only while the moderation case it belongs to exists. If the post is
            cleared, the case and its reports are deleted immediately and no record is kept.
          </li>
          <li>
            Resolved moderation cases are deleted 30 days after the decision, together with their
            reports and audit entries. A case closed because the author did not appeal is deleted
            immediately; the warning on the account is the only record. Open cases are kept until
            they are resolved.
          </li>
          <li>
            Content removed for a policy violation is deleted permanently, along with its replies,
            votes and reposts. The moderation record keeps the post title and the decision for the
            thirty-day window above.
          </li>
          <li>
            A post you delete yourself is kept as a placeholder only while it still anchors a reply
            thread or a repost. Once nothing points at it, it is deleted for good, and in any case
            within 30 days.
          </li>
          <li>
            Warnings remain active for 150 days. Ban records are kept while the ban applies.
          </li>
          <li>
            Administrative audit entries are kept until an administrator clears the audit log,
            except for entries attached to a moderation case, which are deleted with that case.
          </li>
          <li>
            After an account is deleted, published posts and replies remain but are anonymised; the
            profile, email address and uploaded picture are removed.
          </li>
        </ul>
      </section>

      <section>
        <h2>6. Your choices and rights</h2>
        <ul>
          <li>
            You can edit your display name, biography, links and picture, and control which profile
            details are public, in Settings.
          </li>
          <li>You can delete individual posts and replies at any time.</li>
          <li>
            You can request deletion of your account in Settings. A seven-day recovery window
            applies before deletion is completed.
          </li>
          <li>
            You can ask for a copy of your account data, or ask us to correct it, by writing to
            [privacy contact email].
          </li>
          <li>
            You can object to a moderation decision through the appeal link sent to you, or by
            contacting us.
          </li>
        </ul>
      </section>

      <section>
        <h2>7. Security</h2>
        <p>
          Passwords are stored as Argon2id hashes. Session tokens are stored only as hashes and are
          sent in cookies that scripts cannot read. Access to administrative functions requires a
          separate account and is recorded in an audit log.
        </p>
        <p>
          No system is perfectly secure. If you believe your account has been compromised, change
          your password, which signs out every session, and contact us.
        </p>
      </section>

      <section>
        <h2>8. Children</h2>
        <p>
          The platform is intended for people who can enter into a binding agreement in their
          jurisdiction. It is not directed at children, and we do not knowingly collect their
          personal data.
        </p>
      </section>

      <section>
        <h2>9. Changes and contact</h2>
        <p>
          Material changes to this policy will be announced on the platform. Privacy questions and
          requests: [privacy contact email]. See also our <Link to="/terms">Terms of Service</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
