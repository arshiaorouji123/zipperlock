import type { Metadata } from 'next';
import ToolPage from '../../../components/tools/ToolPage';
import DevicePreview from '../../../components/tools/DevicePreview';

export const metadata: Metadata = {
  title: 'Device Wallpaper Preview — See It on Android, iPhone & iPad',
  description: 'Preview a wallpaper on Android, iPhone and iPad frames with an approximate lock-screen clock overlay to check for overlaps before you set it.',
  alternates: { canonical: '/tools/device-preview/' },
};

export default function Page() {
  return (
    <ToolPage slug="device-preview" intro="Check how a wallpaper sits under the system clock and notch on different screens before you set it.">
      <DevicePreview />
    </ToolPage>
  );
}
