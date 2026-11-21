import type { Metadata } from 'next';
import ThemeLibrary from '../../components/ThemeLibrary';

export const metadata: Metadata = {
  title: 'Zipper Lock Screen Themes — Ready-made Looks',
  description:
    'Complete zipper lock screen themes that set the background, zipper and clock in one tap. Love & romance, luxury diamond, cyber neon, kawaii aesthetic, dark gothic and steel collections.',
  alternates: { canonical: '/themes/' },
};

export default function ThemesPage() {
  return (
    <div className="wrap page">
      <div className="page-head">
        <p className="eyebrow">Theme library</p>
        <h1>Complete looks, ready to customise</h1>
        <p className="muted">Each theme combines a background, zipper style and clock design. Open one and swap in your own photo.</p>
      </div>
      <ThemeLibrary />
    </div>
  );
}
