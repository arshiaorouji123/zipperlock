import type { Metadata } from 'next';
import ToolPage from '../../../components/tools/ToolPage';
import SoundPreview from '../../../components/tools/SoundPreview';

export const metadata: Metadata = {
  title: 'Zipper Sound Preview — Metal, Coil & Chunky Zip Sounds',
  description: 'Listen to synthesised zipper sounds: crisp metal, soft coil and chunky plastic. Drag to zip at your own speed.',
  alternates: { canonical: '/tools/sound-preview/' },
};

export default function Page() {
  return (
    <ToolPage slug="sound-preview" intro="Three zipper sounds, generated live. Play them fast or slow, or drag the strip to zip at your own pace.">
      <SoundPreview />
    </ToolPage>
  );
}
