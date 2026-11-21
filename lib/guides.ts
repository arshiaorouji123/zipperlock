/**
 * Original educational content. Each guide is a list of blocks so pages stay static and fast.
 */
export type Block = { h?: string; p?: string; ol?: string[]; ul?: string[]; tip?: string };

export interface Guide {
  slug: string;
  title: string;
  description: string;
  updated: string;
  readMins: number;
  cta: { label: string; href: string };
  body: Block[];
}

export const GUIDES: Guide[] = [
  {
    slug: 'set-lock-screen-wallpaper-android',
    title: 'How to Set a Custom Lock Screen Wallpaper on Android',
    description: 'Step-by-step instructions for Samsung, Pixel and other Android phones, plus fixes for blurry, zoomed or shifted wallpapers.',
    updated: '2026-11-09',
    readMins: 5,
    cta: { label: 'Create a zipper wallpaper', href: '/studio/' },
    body: [
      {
        p: 'Android lets you use any image as your lock screen, but the menus differ between brands. The steps below cover the most common phones. Before you start, make sure the image is saved in your Gallery or Google Photos — if you downloaded it from ZipperLock it will usually be in the Downloads album.',
      },
      { h: 'The universal way (any Android phone)' },
      {
        ol: [
          'Open the image in Google Photos or your Gallery app.',
          'Tap the three-dot menu (⋮) and choose “Use as” or “Set as wallpaper”.',
          'Pick “Lock screen” — or “Home and lock screens” if you want it on both.',
          'Check the preview, then confirm.',
        ],
      },
      { h: 'Samsung Galaxy (One UI)' },
      {
        ol: [
          'Open Settings → Wallpaper and style → Change wallpapers.',
          'Choose Gallery, select your image and tap Lock screen.',
          'On the editing screen, pinch to position it, then tap Done.',
        ],
      },
      {
        tip: 'Samsung adds clock, notification and shortcut widgets on top of the lock screen. In the lock screen editor you can move or restyle the clock so it doesn’t cover the zipper puller.',
      },
      { h: 'Google Pixel' },
      {
        ol: [
          'Long-press an empty area of the home screen and tap Wallpaper & style.',
          'Tap Change wallpaper → My photos and pick your image.',
          'Choose Lock screen and tap the check mark.',
        ],
      },
      { h: 'Why does my wallpaper look zoomed in or blurry?' },
      {
        p: 'Most problems come from the image not matching the screen. If the picture is a different shape, Android crops it; if it is smaller than the screen, Android stretches it and it looks soft. ZipperLock exports at your phone’s native resolution (for example 1080 × 2400 for most mid-range phones) to avoid both problems.',
      },
      {
        ul: [
          'Turn off “Wallpaper scrolling” or “Parallax” if the image moves when you tilt or swipe.',
          'Avoid sending the image through messaging apps — they compress it. Copy it with a cable, cloud drive or Quick Share instead.',
          'If the zipper ends up hidden behind the clock, move the puller lower in the Studio (Zipper → Puller start).',
        ],
      },
      { h: 'Can I make the zipper actually unlock my phone?' },
      {
        p: 'A wallpaper is a picture; it can’t change how Android unlocks. Some apps replace the lock screen with their own animated screen, but they still rely on the system lock for real security. Keep your PIN, fingerprint or face unlock switched on — the zipper is decoration.',
      },
    ],
  },
  {
    slug: 'set-lock-screen-wallpaper-iphone',
    title: 'How to Set a Custom Lock Screen Wallpaper on iPhone',
    description: 'Add your own image to the iPhone lock screen, avoid clock overlaps and stop the Depth and Perspective effects from moving your design.',
    updated: '2026-11-09',
    readMins: 4,
    cta: { label: 'Design for iPhone', href: '/studio/?tab=export' },
    body: [
      {
        p: 'iOS treats the lock screen as an editable page: a wallpaper plus a large clock and optional widgets. That makes custom images look great, but the clock sits on top of your design — worth planning for when the design itself contains a zipper or text.',
      },
      { h: 'Save the image to Photos first' },
      {
        p: 'In Safari, a downloaded image goes to the Files app. In ZipperLock use “Share / Save to Photos” on the Download tab, or open the file in Files, tap Share and choose “Save Image”.',
      },
      { h: 'Set it as your lock screen' },
      {
        ol: [
          'Open the image in Photos and tap the Share button.',
          'Scroll down and tap “Use as Wallpaper”.',
          'Pinch to adjust if needed, then tap Add.',
          'Choose “Set as Wallpaper Pair” to use it on both screens, or “Customise Home Screen” to pick something different for the home screen.',
        ],
      },
      { h: 'Stop the image from moving' },
      {
        ul: [
          'Perspective Zoom makes the wallpaper shift as you tilt the phone. In the wallpaper editor tap ⋯ and turn it off so the zipper stays exactly where you placed it.',
          'Depth Effect can push the clock behind parts of the photo. It usually switches itself off when widgets are added; you can also turn it off in the ⋯ menu.',
        ],
      },
      { h: 'Avoid two clocks' },
      {
        p: 'Because iOS always draws its own clock, a clock baked into the wallpaper creates a double. In the Studio, switch off “Show clock” before downloading, or keep only your name or a short message. The Device Preview tool shows roughly where the iOS clock will sit.',
      },
      {
        tip: 'The iOS clock is centred near the top. A zipper placed slightly left or right of centre, or a puller that starts lower down, keeps both clearly visible.',
      },
    ],
  },
  {
    slug: 'choosing-photos-for-zipper-wallpapers',
    title: 'Choosing the Right Photo for a Zipper Lock Screen',
    description: 'Composition, colour and contrast tips that make a zipper design look intentional instead of cluttered.',
    updated: '2026-11-09',
    readMins: 5,
    cta: { label: 'Try it with your photo', href: '/studio/' },
    body: [
      {
        p: 'A zipper is a strong vertical line through your picture. Used well, it frames the subject and adds depth; used carelessly, it slices through a face. These tips help you pick and prepare a photo that works with the zipper rather than against it.',
      },
      { h: 'Keep the subject off the zipper line' },
      {
        p: 'Place people and faces to one side, or slide the zipper left or right in the Studio. Portrait photos where the subject stands slightly off-centre are ideal. Symmetrical subjects (a building, a road) can work centred, because the zipper then becomes part of the symmetry.',
      },
      { h: 'Give the metal something to contrast against' },
      {
        ul: [
          'Gold and rose gold stand out on dark, cool or neutral backgrounds.',
          'Silver and gunmetal pop on warm, dark or saturated images.',
          'Black nickel suits bright, light photos and almost disappears on dark ones.',
          'Violet is the boldest choice and pairs well with night shots and neon.',
        ],
      },
      { h: 'Calm busy pictures' },
      {
        p: 'Very detailed photos compete with the fine teeth of the zipper. Use the Darken slider (10–30% is usually enough) or a small amount of Blur so the zipper reads clearly. Darkening also makes a white clock easier to read.',
      },
      { h: 'Mind the top of the screen' },
      {
        p: 'The top 15–20% of your screen is covered by the camera cut-out, status bar and system clock. Keep important details out of that zone, and start the puller below it.',
      },
      { h: 'Resolution matters' },
      {
        p: 'A modern phone screen is around 2,400–3,200 pixels tall. Photos from any recent phone camera are plenty; screenshots and images saved from social media may be too small and will look soft when enlarged. If the Studio needs to zoom in a lot to fill the screen, try a larger original.',
      },
      {
        tip: 'Not sure which finish fits? Upload your photo, then tap through the six finishes on the Zipper tab — the preview updates instantly.',
      },
    ],
  },
  {
    slug: 'phone-screen-resolutions-explained',
    title: 'Phone Wallpaper Sizes and Screen Resolutions Explained',
    description: 'What resolution and aspect ratio mean for wallpapers, common sizes for Android and iPhone, and how to pick the right export.',
    updated: '2026-11-09',
    readMins: 4,
    cta: { label: 'Open the Resolution Converter', href: '/tools/resolution-converter/' },
    body: [
      {
        p: 'Two numbers decide whether a wallpaper looks right: the resolution (how many pixels wide and tall) and the aspect ratio (the shape). Get both right and the image is sharp and fills the screen with no surprise cropping.',
      },
      { h: 'Resolution' },
      {
        p: 'Resolution is the number of pixels, written width × height, for example 1080 × 2400. A wallpaper smaller than your screen is stretched and looks soft. One much larger than your screen wastes space but looks fine, because the phone scales it down.',
      },
      { h: 'Aspect ratio' },
      {
        p: 'The aspect ratio is the shape. Most Android phones are 20:9, recent iPhones about 19.5:9, older iPhones like the SE are 16:9 and iPads are close to 4:3. If the wallpaper’s shape doesn’t match, the phone crops the edges to fill the screen.',
      },
      { h: 'Common sizes' },
      {
        ul: [
          'Android FHD+ (most mid-range phones): 1080 × 2400',
          'Android QHD+ (many flagships): 1440 × 3200',
          'iPhone 15 / 16: 1179 × 2556',
          'iPhone Pro Max: 1320 × 2868',
          'iPhone SE: 750 × 1334',
          'iPad (10th gen): 1640 × 2360',
        ],
      },
      { h: 'How ZipperLock handles it' },
      {
        p: 'Pick your device on the Download tab and the Studio renders the whole design again at that exact size — it doesn’t just enlarge the preview. The zipper teeth, clock and photo are drawn at full resolution, so fine details stay crisp.',
      },
      {
        tip: 'Don’t know your phone’s resolution? Choosing the closest model is fine — phones scale wallpapers smoothly, and matching the aspect ratio is what matters most.',
      },
    ],
  },
  {
    slug: 'zipper-anatomy-teeth-sliders-pullers',
    title: 'Zipper Anatomy: Teeth, Sliders and Pullers',
    description: 'The real-world parts of a zipper and how they inspired the styles in ZipperLock — from metal teeth to coil chains and teardrop pulls.',
    updated: '2026-11-09',
    readMins: 4,
    cta: { label: 'Browse zipper styles', href: '/styles/' },
    body: [
      {
        p: 'Zippers look simple, but each part has a job. Knowing them helps you choose a style that feels right — and explains why the ZipperLock renderer draws things the way it does.',
      },
      { h: 'Tape' },
      {
        p: 'The fabric strips the teeth are attached to. On clothing they usually match the garment. In the Studio you can show or hide the tape and pick its colour and width; a dark tape makes the metal look brighter.',
      },
      { h: 'Teeth (elements)' },
      {
        ul: [
          'Metal teeth are individually stamped and polished — the classic look of jeans and leather jackets.',
          'Coil zippers use a continuous spiral of nylon. They are slim, flexible and quiet; our “Fine coil” style is based on them.',
          'Moulded plastic teeth are wide and chunky, common on outdoor jackets and luggage.',
        ],
      },
      {
        p: 'Teeth on the two sides are offset by half a tooth, so they interlock like fingers. When the slider moves, it pushes them together or wedges them apart — the V-shaped opening you see in the simulator.',
      },
      { h: 'Slider' },
      {
        p: 'The slider is the body that runs along the teeth. Inside it is a Y-shaped channel: two separate rows enter at the top and leave as one locked chain, or the reverse.',
      },
      { h: 'Puller' },
      {
        p: 'The puller (or pull tab) is the part you hold. Designers change it freely: flat tabs with a hole, rings for gloved hands, teardrops on bags and jewellery. ZipperLock offers all three.',
      },
      {
        tip: 'Real metals reflect their surroundings, so they are never one flat colour. That’s why every finish in ZipperLock uses a ramp of highlight, light, base and shadow tones.',
      },
    ],
  },
  {
    slug: 'zipper-lock-screen-apps-vs-wallpapers',
    title: 'Zipper Lock Screen Apps vs Zipper Wallpapers: What’s the Difference?',
    description: 'An honest look at how zipper lock screen apps work, their trade-offs, and when a zipper wallpaper is the better choice.',
    updated: '2026-11-09',
    readMins: 5,
    cta: { label: 'Try the unlock simulator', href: '/simulator/' },
    body: [
      {
        p: 'Search for “zipper lock screen” and you’ll find two very different things: apps that replace your lock screen with an interactive zipper, and wallpapers that simply look like a zipper. Here’s how they compare.',
      },
      { h: 'How zipper lock apps work' },
      {
        p: 'On Android, a lock screen app shows its own full-screen activity when the screen turns on. You unzip it to dismiss it, and then the real system lock (PIN, pattern, fingerprint) appears if you have one. iPhones don’t allow third-party lock screens at all.',
      },
      { h: 'Things to consider before installing one' },
      {
        ul: [
          'Security: the zipper screen itself isn’t security. Keep your system lock switched on.',
          'Permissions: these apps need to draw over other apps and often ask for notification access. Read what each permission is for.',
          'Battery and ads: some free apps show full-screen ads or run in the background constantly.',
          'Two steps to unlock: unzip, then still use your PIN or biometrics.',
        ],
      },
      { h: 'What a zipper wallpaper gives you' },
      {
        p: 'A wallpaper works on every phone, including iPhone, uses no battery, needs no permissions and keeps your normal fast unlock. You lose the interactive unzip on the real lock screen — which is exactly what the ZipperLock simulator is for: try the animation in your browser whenever you like, then use the design as a static wallpaper.',
      },
      { h: 'Which should you choose?' },
      {
        p: 'If you want the look with zero trade-offs, use a wallpaper. If you really want the interactive gesture on Android, choose a well-reviewed app with clear permissions and no aggressive ads, and keep your system lock on.',
      },
      {
        tip: 'ZipperLock is a design tool and simulator. It never asks for device permissions and can’t change how your phone unlocks.',
      },
    ],
  },
];

export const getGuide = (slug: string) => GUIDES.find((g) => g.slug === slug);
