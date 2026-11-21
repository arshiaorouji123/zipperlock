import type { Metadata } from 'next';
import ToolPage from '../../../components/tools/ToolPage';
import PresetGenerator from '../../../components/tools/PresetGenerator';

export const metadata: Metadata = {
  title: 'Zipper Design Generator — Random Lock Screen Ideas',
  description: 'Shuffle random zipper lock screen designs for inspiration. Pick a mood, then open any design in the Studio to make it your own.',
  alternates: { canonical: '/tools/preset-generator/' },
};

export default function Page() {
  return (
    <ToolPage slug="preset-generator" intro="Not sure where to start? Shuffle until something clicks, then open it in the Studio and swap in your photo.">
      <PresetGenerator />
    </ToolPage>
  );
}
