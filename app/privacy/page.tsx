import type { Metadata } from 'next';
import { ConsentReset } from '../../components/Consent';
import { SITE } from '../../lib/site';

export const metadata: Metadata = { title: 'Privacy Policy', description: 'How ZipperLock handles your data: photos stay on your device; optional analytics and ads only with consent.', alternates: { canonical: '/privacy/' } };

export default function Privacy() {
  const thirdParty = !!(SITE.gaId || SITE.adsenseClient);
  return (
    <div className="wrap page narrow prose">
      <h1>Privacy Policy</h1>
      <p className="muted">Last updated: November 9, 2026</p>
      <p>ZipperLock is built so you can create wallpapers without handing over your photos. This policy explains what happens to your data.</p>
      <h2>Your photos and designs</h2>
      <ul>
        <li>Photos you open in the Studio or tools are processed entirely in your browser on your device. They are <b>never uploaded</b> to our servers.</li>
        <li>Projects you save are stored in your browser’s local storage (IndexedDB) on that device only. Clearing your browser’s site data deletes them. We cannot see or recover them.</li>
        <li>“Copy a link to this design” puts the design settings (colours, positions, text) into the link. Photos are never included.</li>
      </ul>
      <h2>Information we don’t collect</h2>
      <p>We don’t require an account, and we don’t ask for your name, phone number, contacts or device permissions.</p>
      <h2>Contact messages</h2>
      <p>If you email us or use the contact form, we receive the details you send (such as your email address and message) and use them only to reply. We don’t sell or share them.</p>
      <h2>Analytics and advertising</h2>
      {thirdParty ? (
        <>
          <p>
            With your consent, we use {SITE.gaId ? 'Google Analytics to understand which pages are useful (IP anonymised)' : ''}
            {SITE.gaId && SITE.adsenseClient ? ', and ' : ''}
            {SITE.adsenseClient ? 'Google AdSense to show ads that keep the site free' : ''}. These services may set cookies and process data such as your IP
            address, browser type and pages visited, as described in Google’s privacy policy (policies.google.com/privacy). Nothing loads until you accept.
          </p>
          <p>
            Ads may be personalised based on your activity on other sites. You can opt out of personalised advertising at adssettings.google.com. You can
            change your choice here at any time:
          </p>
          <ConsentReset />
        </>
      ) : (
        <p>The site currently runs without analytics or advertising cookies. If that changes, this policy will be updated and you’ll be asked for consent first.</p>
      )}
      <h2>Local storage we use</h2>
      <ul>
        <li><code>zl:draft</code> — your latest Studio settings, so a refresh doesn’t lose your work.</li>
        <li><code>zl:consent</code> — your cookie choice.</li>
        <li>IndexedDB database <code>zipperlock</code> — projects you choose to save.</li>
        <li>Offline cache — copies of the site’s own pages and code so the app opens without a connection.</li>
      </ul>
      <h2>Children</h2>
      <p>ZipperLock is a general-audience tool and does not knowingly collect personal information from children.</p>
      <h2>Your rights</h2>
      <p>
        Because we don’t store your photos or designs, there’s nothing on our side to access or delete. For any privacy question, contact{' '}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
    </div>
  );
}
