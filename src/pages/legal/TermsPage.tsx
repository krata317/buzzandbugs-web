import { Link } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { LegalPage } from './LegalPage';

export function TermsPage() {
  useDocumentTitle('Terms of Service');

  return (
    <LegalPage
      title="Terms of Service"
      updated="6 November 2026"
      intro="These terms describe what you can expect from Buzz and Bugs and what we expect from you."
    >
      <section>
        <h2>1. Who we are</h2>
        <p>
          Buzz and Bugs is a community platform for developers, operated by [operator name]
          (&ldquo;we&rdquo;, &ldquo;us&rdquo;). You can reach us at [legal contact email]. By
          creating an account or using the platform you agree to these terms. If you do not agree,
          please do not use the service.
        </p>
      </section>

      <section>
        <h2>2. Your account</h2>
        <ul>
          <li>
            You must provide a valid email address and verify it before your account is created.
          </li>
          <li>
            Your username is permanent and public. Your display name and profile details can be
            changed at any time.
          </li>
          <li>
            You are responsible for keeping your password confidential and for activity performed
            through your account.
          </li>
          <li>
            You must be old enough to enter into a binding agreement in your jurisdiction. The
            service is not directed at children.
          </li>
          <li>
            One person should not maintain multiple accounts to evade moderation, bans or rate
            limits.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>
            post content that is unlawful, threatening, harassing, hateful, sexually exploitative of
            minors, or that incites violence;
          </li>
          <li>impersonate another person or misrepresent your affiliation;</li>
          <li>
            publish spam, undisclosed advertising, or repetitive promotional content;
          </li>
          <li>
            attempt to access accounts, data or systems you are not authorised to access, or probe,
            scan or overload the service;
          </li>
          <li>
            scrape or automate access in a way that degrades the service for others, or circumvent
            rate limits;
          </li>
          <li>upload malware, or content you do not have the rights to publish.</li>
        </ul>
      </section>

      <section>
        <h2>4. Your content</h2>
        <p>
          You keep ownership of the posts, replies and profile content you publish. By publishing,
          you grant us a non-exclusive licence to store, display and distribute that content on the
          platform, and to include it in previews of the platform. This licence ends when the content
          is deleted, except where content has been anonymised and retained as described below.
        </p>
        <p>
          You are responsible for what you publish. Do not publish personal information about other
          people without their consent.
        </p>
      </section>

      <section>
        <h2>5. Moderation</h2>
        <p>
          Moderation is report-driven. Posts are not reviewed before they are published. When
          someone reports a post, it is checked against these terms.
        </p>
        <ul>
          <li>
            If the post does not break these terms, it stays up and the report leaves no trace:
            neither the author nor anyone else is told that it was made.
          </li>
          <li>
            If it does break them, the post is hidden and its author is notified privately, with
            seven days to appeal. Appeals are decided by a person.
          </li>
          <li>
            A post that is not appealed, or whose appeal is rejected, is deleted permanently along
            with its replies, votes and reposts. If you did not appeal, no moderation record is kept
            beyond the warning on your account. If you did appeal, the record keeps the post title
            and the decision for thirty days, then it is deleted too.
          </li>
        </ul>
        <p>
          Reports are rate-limited, and a post revision that has just been cleared is not checked
          again immediately. Repeated violations can lead to warnings, temporary restrictions or a
          permanent ban. We do not publish who reported what.
        </p>
      </section>

      <section>
        <h2>6. External content</h2>
        <p>
          News, trending items, podcasts and events link to third-party websites. We do not control
          that content and are not responsible for it. Following an external link is subject to that
          site&apos;s own terms and privacy policy.
        </p>
      </section>

      <section>
        <h2>7. Ending your account</h2>
        <p>
          You can request deletion from Settings at any time. Deletion begins a seven-day recovery
          window during which you can cancel by signing in again. After that window, your posts and
          replies are anonymised under the name &ldquo;Squashed Bug&rdquo;, your profile and personal
          data are removed, and your username is released.
        </p>
        <p>
          Content removed for a moderation violation is deleted permanently rather than anonymised,
          as described in section 5.
        </p>
        <p>
          We may suspend or terminate an account that materially breaches these terms, or where
          required by law. Where it is reasonable to do so, we will explain the reason.
        </p>
      </section>

      <section>
        <h2>8. Availability and responsibility</h2>
        <p>
          The service is provided on an &ldquo;as is&rdquo; basis. We work to keep it available and
          correct, but we do not guarantee uninterrupted access, and content published by others is
          not our statement. To the extent permitted by law, we are not liable for indirect or
          consequential loss arising from use of the platform.
        </p>
        <p>
          Nothing in these terms excludes liability that cannot lawfully be excluded, including for
          death or personal injury caused by negligence, or for fraud.
        </p>
      </section>

      <section>
        <h2>9. Changes</h2>
        <p>
          We may update these terms as the platform changes. Material changes will be announced on
          the platform before they take effect. Continuing to use the service after that point means
          you accept the updated terms.
        </p>
      </section>

      <section>
        <h2>10. Contact</h2>
        <p>
          Questions about these terms: [legal contact email]. For privacy questions, see our{' '}
          <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
