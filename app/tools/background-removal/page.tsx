import type { Metadata } from 'next';
import ToolPage from '../../../components/tools/ToolPage';
import BackgroundRemoval from '../../../components/tools/BackgroundRemoval';

export const metadata: Metadata = {
  title: 'Background Remover for Plain Backgrounds — Free & Private',
  description: 'Remove plain or studio backgrounds from photos, logos and screenshots in your browser. Download a transparent PNG or place it on a zipper wallpaper.',
  alternates: { canonical: '/tools/background-removal/' },
};

export default function Page() {
  return (
    <ToolPage
      slug="background-removal"
      intro="Removes a solid or near-solid background colour. Everything happens on your device — the image is never uploaded."
    >
      <BackgroundRemoval />
    </ToolPage>
  );
}
