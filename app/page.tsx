import Link from 'next/link';
import ZipperDemo from '../components/ZipperDemo';
import DemoPlayground from '../components/DemoPlayground';
import DesignThumb from '../components/DesignThumb';
import { BACKGROUNDS, DEFAULT_DESIGN, type Design } from '../lib/design';
import { METALS, type MetalId } from '../lib/zipper';
import { THEMES } from '../lib/presets';
import { GUIDES } from '../lib/guides';
import AdSlot from '../components/AdSlot';
import { CATEGORIES, LIBRARY, type CatId } from '../lib/library';

const heroDesign = THEMES[0].design;
const FEATURED = [
  'theme-cute-kitty-hat',
  'theme-black-purple-rose',
  'theme-fire-wolf-flame',
  'theme-supercar-red-racing',
  'theme-candy-wonderland',
  'theme-ice-tiger-frost',
  'theme-gaming-cyber-setup',
  'theme-cherry-blossom-sakura',
];

const styleDesign = (m: MetalId): Design => ({
  ...DEFAULT_DESIGN,
  bg: m === 'gold' || m === 'rose' ? 'midnight' : m === 'purple' ? 'aurora' : 'carbon',
  zipper: { ...DEFAULT_DESIGN.zipper, metal: m, size: 1.3 },
  clock: { ...DEFAULT_DESIGN.clock, show: false },
});

const bgDesign = (id: string): Design => ({
  ...DEFAULT_DESIGN,
  bg: id,
  clock: { ...DEFAULT_DESIGN.clock, show: false },
});

const METAL_NOTES: Partial<Record<MetalId, string>> = {
  gold: 'Warm, classic and the most popular finish.',
  silver: 'Bright polished steel — pairs with any photo.',
  rose: 'Soft copper-pink for warm-toned pictures.',
  black: 'Low-key and modern, great on light photos.',
  purple: 'Anodised violet in the ZipperLock signature colour.',
  gunmetal: 'Dark grey steel with an industrial feel.',
  white: 'Soft pearl white for light, airy photos.',
  pink: 'Baby pink for cute and pastel designs.',
  ruby: 'Deep red metal for love and bold looks.',
  emerald: 'Rich green for nature and luxury themes.',
  sapphire: 'Royal blue for sports and night scenes.',
  holo: 'Iridescent rainbow sheen, futuristic and fun.',
};

const FAQ = [
  {
    q: 'Is ZipperLock free?',
    a: 'Yes. The studio, the simulator and full-resolution downloads are free, and you don’t need an account.',
  },
  {
    q: 'Does this replace my phone’s lock screen?',
    a: 'No. ZipperLock makes wallpaper images and lets you try a zipper unlock animation in the browser. Your phone keeps its own lock screen, PIN, fingerprint and face unlock — we never touch them.',
  },
  {
    q: 'Are my photos uploaded anywhere?',
    a: 'No. Photos are opened and edited inside your browser on your own device. Nothing is sent to our servers.',
  },
  {
    q: 'Which image size should I pick?',
    a: 'Choose your phone model in the Download tab. The studio exports at that screen’s native resolution so the result is sharp and fills the screen without stretching.',
  },
  {
    q: 'Why does my lock screen show two clocks?',
    a: 'Android and iOS draw their own clock on top of the wallpaper. If you see two, switch off “Show clock” in the Clock & Text tab and download again.',
  },
  {
    q: 'Can I use it on a computer?',
    a: 'Yes. The studio works in any modern browser on Windows, macOS, Android, iPhone and iPad. On a computer, download the image and send it to your phone.',
  },
  {
    q: 'Can I install ZipperLock as an app?',
    a: 'Yes. On Android and desktop Chrome use “Install app” (in the footer or the browser menu). On iPhone and iPad tap Share → Add to Home Screen. The installed app opens full-screen and works offline, including your saved projects.',
  },
];

export default function Home() {
  return (
    <>
      {/* 1. Hero */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Zipper lock screen maker</p>
            <h1>
              Zip up your screen in <span className="gold">gold</span>, <span className="silver">silver</span> or{' '}
              <span className="purple">violet</span>.
            </h1>
            <p className="lead">
              Turn any photo into a metallic zipper lock screen wallpaper. Pick the teeth, the puller and the finish, add a clock,
              and download it at your phone’s exact resolution.
            </p>
            <div className="cta-row">
              <Link href="/studio/" className="btn-primary lg">
                Create Your Zipper Lock Screen
              </Link>
              <Link href="#demo" className="btn-ghost lg">
                Try Zipper Simulator
              </Link>
            </div>
            <ul className="hero-points">
              <li>No sign-up</li>
              <li>Photos stay on your device</li>
              <li>Android & iPhone sizes</li>
              <li>Works offline as an app</li>
            </ul>
          </div>
          <div className="hero-phone">
            <ZipperDemo design={heroDesign} label="Gold zipper lock demo — drag the puller down" />
            <p className="hero-hint">↑ Drag the puller down</p>
          </div>
        </div>
      </section>

      {/* 2. Studio entry */}
      <section className="section">
        <div className="wrap studio-entry">
          <div>
            <p className="eyebrow">Zipper Lock Studio</p>
            <h2>A real editor, not a gallery</h2>
            <p className="muted">
              Upload a photo, crop and frame it with your fingers, fine-tune brightness, contrast, saturation and blur, then place a
              zipper exactly where you want it. Every change shows instantly on a life-size phone preview.
            </p>
          </div>
          <ul className="feature-list">
            <li>
              <b>Photo editing</b>
              <span>Zoom, rotate, reposition and adjust colours.</span>
            </li>
            <li>
              <b>12 metal finishes</b>
              <span>Gold, silver, rose gold, ruby, emerald, holographic and more.</span>
            </li>
            <li>
              <b>17 teeth × 22 pullers</b>
              <span>Hearts, diamonds, chains, bows, clovers; padlock, butterfly, key, teddy, crown.</span>
            </li>
            <li>
              <b>Clock & text</b>
              <span>Five fonts, metallic colours, English or Persian date.</span>
            </li>
            <li>
              <b>Exact sizes</b>
              <span>PNG or JPEG at native resolution for 9 device types.</span>
            </li>
          </ul>
          <Link href="/studio/" className="btn-primary">
            Open the Studio
          </Link>
        </div>
      </section>

      {/* Design library */}
      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">Wallpaper themes & designs</p>
            <h2>{LIBRARY.length} original zipper designs & themes</h2>
            <p className="muted">Ultra-realistic 3D metallic zippers, jewelry pullers, and trending lock screen wallpapers ready to customize.</p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href="/themes/" className="btn-primary sm">
                Explore 47 Wallpaper Themes →
              </Link>
              <Link href="/designs/" className="link">
                Explore full library →
              </Link>
            </div>
          </div>
          <div className="card-grid four">
            {FEATURED.map((id) => {
              const d = LIBRARY.find((x) => x.id === id)!;
              return (
                <Link key={id} href={`/designs/?design=${id}`} className="card compact">
                  <DesignThumb design={d.design} label={`${d.name} preview`} />
                  <h3>{d.name}</h3>
                </Link>
              );
            })}
          </div>
          <nav className="cat-links home-cats" aria-label="Design categories">
            {(Object.keys(CATEGORIES) as CatId[]).map((c) => (
              <Link key={c} href={`/designs/${c}/`}>
                {CATEGORIES[c].name}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {/* 3. Interactive demo */}
      <section className="section alt" id="demo">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">Unlock simulator</p>
            <h2>Feel the zip before you download</h2>
            <Link href="/simulator/" className="link">
              Full simulator with sound →
            </Link>
          </div>
          <DemoPlayground />
        </div>
      </section>

      {/* 4. Zipper styles */}
      <section className="section" id="styles">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">Featured zipper styles</p>
            <h2>Twelve metallic finishes</h2>
            <Link href="/styles/" className="link">
              Discover Zipper Styles →
            </Link>
          </div>
          <div className="card-grid six">
            {(Object.keys(METALS) as MetalId[]).map((m) => (
              <Link key={m} href={`/studio/?metal=${m}&tab=zipper`} className="card">
                <DesignThumb design={styleDesign(m)} label={`${METALS[m].name} zipper preview`} />
                <h3>{METALS[m].name}</h3>
                <p className="muted small">{METAL_NOTES[m]}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>



      {/* 7. Quick tools */}
      <section className="section alt">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">Quick tools</p>
            <h2>Jump straight to what you need</h2>
          </div>
          <div className="tool-grid">
            <Link href="/tools/wallpaper-cropper/" className="tool">
              <b>Photo cropper</b>
              <span>Frame, zoom and rotate your picture for a phone screen.</span>
            </Link>
            <Link href="/studio/?tab=zipper" className="tool">
              <b>Zipper designer</b>
              <span>Finish, teeth, puller, size and position.</span>
            </Link>
            <Link href="/studio/?tab=clock" className="tool">
              <b>Clock designer</b>
              <span>Fonts, metallic colours, date and your name.</span>
            </Link>
            <Link href="/tools/resolution-converter/" className="tool">
              <b>Resolution converter</b>
              <span>Resize one image for many phones at once.</span>
            </Link>
            <Link href="/tools/color-studio/" className="tool">
              <b>Zipper colour studio</b>
              <span>Turn any colour into a metal finish.</span>
            </Link>
            <Link href="/tools/background-effects/" className="tool">
              <b>Background effects</b>
              <span>Generate glows, gradients and grain.</span>
            </Link>
            <Link href="/tools/sound-preview/" className="tool">
              <b>Zipper sounds</b>
              <span>Hear metal, coil and chunky zips.</span>
            </Link>
            <Link href="/tools/" className="tool">
              <b>All 12 tools</b>
              <span>Cropper, background remover, device preview…</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. How it works */}
      <section className="section" id="how">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">How it works</p>
            <h2>Four steps, about a minute</h2>
          </div>
          <ol className="steps">
            <li>
              <b>Choose a photo</b>
              <span>Upload your own or start from a ready background.</span>
            </li>
            <li>
              <b>Style the zipper</b>
              <span>Pick a finish, teeth and puller, then drag it into place.</span>
            </li>
            <li>
              <b>Add the details</b>
              <span>Clock, date and a short name or message — or keep it clean.</span>
            </li>
            <li>
              <b>Download & set</b>
              <span>Save at your screen’s resolution and set it as your lock screen.</span>
            </li>
          </ol>
        </div>
      </section>

      {/* 9. Devices */}
      <section className="section alt" id="devices">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">Device compatibility</p>
            <h2>Works where your browser works</h2>
          </div>
          <div className="device-grid">
            <div>
              <b>Android phones</b>
              <span>Chrome, Samsung Internet, Firefox. FHD+, QHD+, Galaxy Ultra and Pixel sizes.</span>
            </div>
            <div>
              <b>iPhone</b>
              <span>Safari and Chrome on iOS. Standard, Pro Max and SE sizes, with Save to Photos.</span>
            </div>
            <div>
              <b>iPad & tablets</b>
              <span>Portrait tablet resolutions with a larger editing canvas.</span>
            </div>
            <div>
              <b>Windows & macOS</b>
              <span>Design on a big screen with mouse and scroll-to-zoom, then send the file to your phone.</span>
            </div>
          </div>
          <p className="note">
            ZipperLock creates wallpaper images and browser simulations. It can’t change how your phone unlocks — your system lock
            screen and its security stay exactly as they are.
          </p>
        </div>
      </section>

      {/* 10. Collections */}
      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">Design collections</p>
            <h2>Pick a mood</h2>
          </div>
          <div className="collections">
            <Link href="/studio/?theme=royal-gold" className="collection gold-c">
              <b>Luxury Gold</b>
              <span>Royal Gold · Silk & Gold · Rose Dust</span>
            </Link>
            <Link href="/studio/?theme=carbon-steel" className="collection silver-c">
              <b>Steel & Carbon</b>
              <span>Carbon Steel · Brushed Pro · Gunmetal Wave</span>
            </Link>
            <Link href="/studio/?theme=neon-violet" className="collection purple-c">
              <b>Dark & Electric</b>
              <span>Electric Violet · Stealth</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 11. Guides */}
      <section className="section alt" id="guides">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">Guides</p>
            <h2>Get the best result</h2>
            <Link href="/guides/" className="link">
              All guides →
            </Link>
          </div>
          <div className="guide-list three">
            {GUIDES.slice(0, 3).map((g) => (
              <Link key={g.slug} href={`/guides/${g.slug}/`} className="guide-card">
                <h3>{g.title}</h3>
                <p className="muted small">{g.description}</p>
              </Link>
            ))}
          </div>
          <h3 className="quick-h">Quick answers</h3>
          <div className="guides">
            <details>
              <summary>Setting a custom lock screen on Android</summary>
              <p>
                Open the downloaded image in Google Photos or your Gallery app, tap the menu (⋮) and choose <em>Set as wallpaper</em>.
                Pick <em>Lock screen</em>. On Samsung phones you can also go to <em>Settings → Wallpaper and style</em>. If the
                image looks shifted, turn off any “scrolling” or “parallax” option so it stays still.
              </p>
            </details>
            <details>
              <summary>Setting a custom lock screen on iPhone</summary>
              <p>
                Save the image to Photos, open it, tap Share and choose <em>Use as Wallpaper</em>. iOS places its clock near the
                top — if your design has its own clock, either turn it off in the studio or move it lower so the two don’t overlap.
                Turn off <em>Perspective Zoom</em> to keep the zipper exactly where you placed it.
              </p>
            </details>
            <details>
              <summary>Choosing a photo that suits a zipper</summary>
              <p>
                Photos with a clear subject on one side work best, because the zipper splits the image. Keep faces away from the
                zipper line, or slide the zipper to the left or right. Dark or slightly blurred backgrounds make metal teeth stand
                out — use the <em>Darken</em> and <em>Blur</em> sliders if your picture is busy.
              </p>
            </details>
            <details>
              <summary>Gold, silver or violet — which finish?</summary>
              <p>
                Gold suits warm photos (sunsets, skin tones, wood). Silver and gunmetal suit cool, blue or black-and-white images.
                Black nickel disappears into dark photos but looks sharp on bright ones. Violet is the boldest choice and pairs well
                with night shots and neon.
              </p>
            </details>
          </div>
        </div>
      </section>

      <div className="wrap">
        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME} />
      </div>

      {/* 12. FAQ */}
      <section className="section" id="faq">
        <div className="wrap narrow">
          <div className="section-head">
            <p className="eyebrow">FAQ</p>
            <h2>Questions, answered</h2>
          </div>
          <div className="faq">
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
          <div className="final-cta">
            <Link href="/studio/" className="btn-primary lg">
              Create Your Zipper Lock Screen
            </Link>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
          }),
        }}
      />
    </>
  );
}
