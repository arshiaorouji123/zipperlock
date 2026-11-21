import type { Metadata } from 'next';
import ToolPage from '../../../components/tools/ToolPage';
import ColorStudio from '../../../components/tools/ColorStudio';

export const metadata: Metadata = {
  title: 'Zipper Color Studio — Custom Metal Zipper Colours',
  description: 'Pick any colour and turn it into a realistic metallic zipper finish with highlights and shadows. Preview it live and use it in your lock screen.',
  alternates: { canonical: '/tools/color-studio/' },
};

export default function Page() {
  return (
    <ToolPage
      slug="color-studio"
      intro="Pick any colour — the studio builds a full metallic ramp (highlight, light, base, shadow, edge) so it looks like polished metal, not flat paint."
      about={
        <>
          <h2>How custom metals work</h2>
          <p className="muted">
            Real metal looks shiny because one colour appears at many brightness levels at once. From your base colour we keep the hue, lift the lightness for
            highlights, drop it for shadows and slightly change saturation, then use that ramp on every tooth, the slider and the puller.
          </p>
        </>
      }
    >
      <ColorStudio />
    </ToolPage>
  );
}
