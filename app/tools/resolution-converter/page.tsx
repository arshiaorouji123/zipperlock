import type { Metadata } from 'next';
import ToolPage from '../../../components/tools/ToolPage';
import ResolutionConverter from '../../../components/tools/ResolutionConverter';

export const metadata: Metadata = {
  title: 'Wallpaper Resolution Converter — Resize for Every Phone',
  description: 'Resize one image for Android, iPhone and tablet screens at once. Fill, fit with blurred edges or fit with a colour background.',
  alternates: { canonical: '/tools/resolution-converter/' },
};

export default function Page() {
  return (
    <ToolPage
      slug="resolution-converter"
      intro="Create correctly sized copies of one image for several devices. Choose how to handle images that don’t match the screen shape."
      about={
        <>
          <h2>Fill or fit?</h2>
          <p className="muted">
            <b>Fill</b> covers the whole screen and trims what doesn’t fit — best for photos. <b>Fit</b> keeps the whole image visible and fills the gaps
            with a blurred copy or a solid colour — best for artwork, logos and screenshots.
          </p>
        </>
      }
    >
      <ResolutionConverter />
    </ToolPage>
  );
}
