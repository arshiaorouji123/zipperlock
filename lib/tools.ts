export interface ToolInfo {
  slug: string;
  name: string;
  blurb: string;
  href: string;
  icon: string;
}

export const TOOLS: ToolInfo[] = [
  { slug: 'color-studio', name: 'Zipper Color Studio', blurb: 'Turn any colour into a realistic metal finish.', href: '/tools/color-studio/', icon: '🎨' },
  { slug: 'wallpaper-cropper', name: 'Wallpaper Cropper', blurb: 'Crop any photo to your exact phone screen.', href: '/tools/wallpaper-cropper/', icon: '✂️' },
  { slug: 'resolution-converter', name: 'Resolution Converter', blurb: 'Resize one image for many devices at once.', href: '/tools/resolution-converter/', icon: '📐' },
  { slug: 'background-effects', name: 'Background Effects Studio', blurb: 'Generate gradients, glows, grain and textures.', href: '/tools/background-effects/', icon: '✨' },
  { slug: 'background-removal', name: 'Background Remover', blurb: 'Remove plain backgrounds from a photo.', href: '/tools/background-removal/', icon: '🪄' },
  { slug: 'sound-preview', name: 'Zipper Sound Preview', blurb: 'Hear metal, coil and chunky zipper sounds.', href: '/tools/sound-preview/', icon: '🔊' },
  { slug: 'preset-generator', name: 'Design Preset Generator', blurb: 'Shuffle random designs for inspiration.', href: '/tools/preset-generator/', icon: '🎲' },
  { slug: 'device-preview', name: 'Device Wallpaper Preview', blurb: 'See a wallpaper on phones with a real lock-screen layout.', href: '/tools/device-preview/', icon: '📱' },
  { slug: 'clock-designer', name: 'Clock Designer', blurb: 'Fonts, metallic colours, 12/24h and Persian dates.', href: '/studio/?tab=clock', icon: '🕒' },
  { slug: 'text-designer', name: 'Name & Text Designer', blurb: 'Add your name or a short message.', href: '/studio/?tab=clock', icon: '🔤' },
  { slug: 'zipper-position', name: 'Zipper Position Editor', blurb: 'Drag the zipper anywhere, vertical or horizontal.', href: '/studio/?tab=zipper', icon: '↔️' },
  { slug: 'export-assistant', name: 'Design Export Assistant', blurb: 'Native sizes, PNG/JPEG and Save to Photos.', href: '/studio/?tab=export', icon: '⬇️' },
];

export const getTool = (slug: string) => TOOLS.find((t) => t.slug === slug)!;
