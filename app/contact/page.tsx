import type { Metadata } from 'next';
import ContactForm from '../../components/ContactForm';
import { SITE } from '../../lib/site';

export const metadata: Metadata = { title: 'Contact', description: 'Contact the ZipperLock team with questions, feedback or feature ideas.', alternates: { canonical: '/contact/' } };

export default function Contact() {
  return (
    <div className="wrap page narrow">
      <div className="page-head">
        <h1>Contact</h1>
        <p className="muted">
          Questions, bug reports or ideas for new zipper styles are welcome. Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          {SITE.phpContact ? ' or use the form below.' : '.'}
        </p>
      </div>
      {SITE.phpContact && <ContactForm />}
      <div className="prose">
        <h2>Before you write</h2>
        <ul>
          <li>Wallpaper looks blurry or cropped? See the guide on screen resolutions.</li>
          <li>Lost a saved project? Projects live in your browser — they can’t be recovered if site data was cleared.</li>
          <li>Please don’t send photos; we don’t need them to help.</li>
        </ul>
      </div>
    </div>
  );
}
