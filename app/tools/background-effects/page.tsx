import type { Metadata } from 'next';
import ToolPage from '../../../components/tools/ToolPage';
import BackgroundEffects from '../../../components/tools/BackgroundEffects';

export const metadata: Metadata = {
  title: 'Background Effects Studio — Gradient & Glow Wallpaper Generator',
  description: 'Generate gradient, glow, mesh, wave and grain backgrounds at your phone’s resolution. Download them or add a zipper on top.',
  alternates: { canonical: '/tools/background-effects/' },
};

export default function Page() {
  return (
    <ToolPage slug="background-effects" intro="Generate an original background in seconds. Every shuffle is unique and rendered at full resolution for your device.">
      <BackgroundEffects />
    </ToolPage>
  );
}
