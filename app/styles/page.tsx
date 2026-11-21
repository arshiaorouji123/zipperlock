import type { Metadata } from 'next';
import Link from 'next/link';
import DesignThumb from '../../components/DesignThumb';
import { DEFAULT_DESIGN, type Design } from '../../lib/design';
import { METALS, PULLERS, TEETH, type MetalId, type PullerId, type TeethId, type ZipperOpts } from '../../lib/zipper';

export const metadata: Metadata = {
  title: 'Zipper Style Library — 12 Finishes, 17 Teeth, 22 Pullers',
  description:
    'Compare every zipper style: gold, silver, rose gold and holographic finishes; classic, coil, heart, diamond, chain, bow, clover, wave, flower, bubble and neon teeth; heart padlock, butterfly, diamond, teddy, bow, key, crown and skull pullers.',
  alternates: { canonical: '/styles/' },
};

/** One preview per genuinely different option — no repeated combinations. */
const make = (bg: string, z: Partial<ZipperOpts>): Design => ({
  ...DEFAULT_DESIGN,
  bg,
  art: null,
  zipper: { ...DEFAULT_DESIGN.zipper, size: 1.4, rest: 0.3, ...z },
  clock: { ...DEFAULT_DESIGN.clock, show: false },
});

const METAL_BG: Record<MetalId, string> = {
  gold: 'midnight',
  silver: 'carbon',
  rose: 'gold-dust',
  black: 'brushed',
  purple: 'aurora',
  gunmetal: 'silver-wave',
  white: 'velvet',
  pink: 'aurora',
  ruby: 'velvet',
  emerald: 'midnight',
  sapphire: 'carbon',
  holo: 'aurora',
};

const METAL_NOTE: Record<MetalId, string> = {
  gold: 'Warm polished gold — the classic.',
  silver: 'Mirror steel that suits any photo.',
  rose: 'Soft copper-pink for warm images.',
  black: 'Dark nickel, sharp on bright photos.',
  purple: 'Anodised violet, ZipperLock’s signature.',
  gunmetal: 'Smoky steel with an industrial feel.',
  white: 'Pearl white for light, airy designs.',
  pink: 'Baby pink for cute and pastel looks.',
  ruby: 'Deep red for love and bold themes.',
  emerald: 'Rich green for nature and luxury.',
  sapphire: 'Royal blue for sports and night skies.',
  holo: 'Iridescent rainbow, futuristic.',
};

const TEETH_NOTE: Record<TeethId, string> = {
  classic: 'Stamped metal teeth like jeans.',
  coil: 'Slim continuous coil, quiet and modern.',
  chunky: 'Wide moulded teeth, sporty.',
  minimal: 'Ultra-thin teeth for minimal designs.',
  pixel: 'Square, stepped-shade teeth for retro looks.',
  pearl: 'Round lustrous beads, jewellery-like.',
  crystal: 'Faceted translucent gems.',
  heart: 'Interlocking hearts for love themes.',
  star: 'Little stars for magic and kids’ designs.',
  neon: 'Glowing tubes for gaming and cyberpunk.',
  diamond: 'Sparkling diamond-cut interlocking gems.',
  chain: 'Interlocking Cuban curb chain links.',
  bow: 'Cute ribbon bows for coquette & kawaii styles.',
  clover: 'Four-leaf clovers for lucky & fresh looks.',
  wave: 'Geometric sawtooth zigzag teeth.',
  flower: 'Delicate floral petals for romantic nature designs.',
  bubble: 'Liquid bubble drops with glossy reflection.',
};

const TEETH_METAL: Record<TeethId, MetalId> = {
  classic: 'gold',
  coil: 'silver',
  chunky: 'gunmetal',
  minimal: 'white',
  pixel: 'sapphire',
  pearl: 'white',
  crystal: 'holo',
  heart: 'ruby',
  star: 'gold',
  neon: 'purple',
  diamond: 'silver',
  chain: 'gold',
  bow: 'pink',
  clover: 'emerald',
  wave: 'ruby',
  flower: 'rose',
  bubble: 'gold',
};

const PULLER_METAL: Record<PullerId, MetalId> = {
  classic: 'silver',
  ring: 'gunmetal',
  drop: 'rose',
  heart: 'pink',
  heartLock: 'ruby',
  star: 'gold',
  paw: 'white',
  ball: 'silver',
  crown: 'gold',
  gem: 'emerald',
  diamond: 'silver',
  bolt: 'sapphire',
  flower: 'pink',
  skull: 'black',
  butterfly: 'holo',
  bow: 'pink',
  padlock: 'gold',
  key: 'gold',
  moon: 'sapphire',
  teddy: 'white',
  cross: 'black',
  clover: 'emerald',
};

export default function StylesPage() {
  return (
    <div className="wrap page">
      <div className="page-head">
        <p className="eyebrow">Zipper style library</p>
        <h1>Compare every zipper part</h1>
        <p className="muted">
          12 finishes, 17 tooth styles and 22 pullers — any combination works with any design. Tap a style to open it in the Studio, or browse{' '}
          <Link href="/designs/">themed designs</Link> that already combine them.
        </p>
        <nav className="anchor-row" aria-label="Sections">
          <a href="#finishes" className="chip">
            Finishes
          </a>
          <a href="#teeth" className="chip">
            Teeth
          </a>
          <a href="#pullers" className="chip">
            Pullers
          </a>
        </nav>
      </div>

      <section id="finishes" className="style-block">
        <div className="style-block-head">
          <h2>Metallic finishes</h2>
          <p className="muted">Every finish uses a four-tone metal ramp, so it reflects light like real metal. Need another colour? Use the custom colour picker.</p>
        </div>
        <div className="card-grid six">
          {(Object.keys(METALS) as MetalId[]).map((m) => (
            <Link key={m} href={`/studio/?metal=${m}&tab=zipper`} className="card compact">
              <DesignThumb design={make(METAL_BG[m], { metal: m })} label={`${METALS[m].name} zipper`} />
              <h3>{METALS[m].name}</h3>
              <p className="muted small">{METAL_NOTE[m]}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="teeth" className="style-block">
        <div className="style-block-head">
          <h2>Tooth styles</h2>
          <p className="muted">The teeth are what make a zipper look like a zipper. Each style has its own shape, size and spacing.</p>
        </div>
        <div className="card-grid five">
          {(Object.keys(TEETH) as TeethId[]).map((t) => (
            <Link key={t} href={`/studio/?teeth=${t}&metal=${TEETH_METAL[t]}&tab=zipper`} className="card compact">
              <DesignThumb design={make('midnight', { teeth: t, metal: TEETH_METAL[t], size: 1.6 })} label={`${TEETH[t].name} teeth`} />
              <h3>{TEETH[t].name}</h3>
              <p className="muted small">{TEETH_NOTE[t]}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="pullers" className="style-block">
        <div className="style-block-head">
          <h2>Pullers</h2>
          <p className="muted">The part you grab to unzip. Size, swing, reflection and shadow are adjustable in the Studio.</p>
        </div>
        <div className="card-grid six">
          {(Object.keys(PULLERS) as PullerId[]).map((p) => (
            <Link key={p} href={`/studio/?puller=${p}&metal=${PULLER_METAL[p]}&tab=zipper`} className="card compact">
              <DesignThumb design={make('carbon', { puller: p, metal: PULLER_METAL[p], pullerScale: 1.3 })} label={`${PULLERS[p]} puller`} />
              <h3>{PULLERS[p]}</h3>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
