import type { Metadata } from 'next';
import ToolPage from '../../../components/tools/ToolPage';
import Cropper from '../../../components/tools/Cropper';

export const metadata: Metadata = {
  title: 'Wallpaper Cropper — Crop Photos to Phone Screen Size',
  description: 'Crop any photo to the exact resolution of your Android phone, iPhone or tablet. Drag, zoom and rotate, then download a perfect-fit wallpaper.',
  alternates: { canonical: '/tools/wallpaper-cropper/' },
};

export default function Page() {
  return (
    <ToolPage slug="wallpaper-cropper" intro="Frame your photo exactly the way it will appear on your screen, then save it at your phone’s native resolution.">
      <Cropper />
    </ToolPage>
  );
}
