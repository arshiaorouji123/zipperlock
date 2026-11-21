/**
 * ZipperLock design library — original procedural designs.
 * Every entry is a full Design (artwork + zipper + clock), so it can be previewed,
 * unzipped in the simulator, customised in the Studio and exported.
 */
import { DEFAULT_ADJUST, DEFAULT_CLOCK, DEFAULT_LAYERS, type ClockOpts, type Design } from './design';
import { DEFAULT_ZIPPER, type MetalChoice, type PullerId, type TeethId, type ZipperOpts } from './zipper';
import { hexHsl, type ArtLayer, type ArtSpec, type BgKind, type LayoutId, type MotifId } from './art';
import { THEMES } from './presets';

export type CatId =
  | 'trending'
  | 'basic'
  | 'love'
  | 'sports'
  | 'cats'
  | 'dogs'
  | 'birds'
  | 'wildlife'
  | 'anime'
  | 'nature'
  | 'fantasy'
  | 'luxury'
  | 'gaming'
  | 'cars'
  | 'dark'
  | 'lifestyle'
  | 'seasonal'
  | 'art';

export const CATEGORIES: Record<CatId, { name: string; blurb: string; intro: string }> = {
  trending: {
    name: 'Wallpaper Themes',
    blurb: 'Original trending wallpapers & 3D luxury zippers.',
    intro: 'Exclusive lock screen wallpaper themes featuring bespoke artwork, luxury metallic sliders, gem teeth, and jewelry charms.',
  },
  basic: {
    name: 'Basic & Minimal',
    blurb: 'Clean classic zippers.',
    intro: 'Simple, elegant zipper designs: classic metal teeth, thin and thick zippers, matte, glossy and gradient finishes. A calm base that lets the zipper itself be the star.',
  },
  love: {
    name: 'Love & Romantic',
    blurb: 'Hearts, roses and butterflies.',
    intro: 'Romantic zipper lock screens with hearts, roses, butterflies and soft glows — with heart-shaped teeth and heart pullers. Change the heart colour, background and sparkle in the Studio.',
  },
  sports: {
    name: 'Football & Sports',
    blurb: 'Stadiums, balls and jerseys.',
    intro: 'Football stadiums, jerseys, balls and trophies, plus basketball, tennis, volleyball, racing and fitness. All artwork is original — pick your own team colours for jerseys and pitches.',
  },
  cats: {
    name: 'Cats & Kittens',
    blurb: 'Kawaii cats and paw prints.',
    intro: 'Cute cat faces, sitting cats and paw prints in every fur colour — black, white, orange, grey and more — with matching paw pullers.',
  },
  dogs: {
    name: 'Dogs & Puppies',
    blurb: 'Puppies and paws.',
    intro: 'Friendly puppy faces, paw trails and playful patterns. Change fur and ear colours to match your own dog.',
  },
  birds: {
    name: 'Birds',
    blurb: 'Owls, parrots and flying birds.',
    intro: 'Colourful parrots, wise owls, penguins and flocks of flying birds against skies and sunsets.',
  },
  wildlife: {
    name: 'Animals & Wildlife',
    blurb: 'Lions, pandas, foxes and sea life.',
    intro: 'Lions, pandas, foxes, bears, bunnies, whales, fish, dinosaurs, bees and ladybugs — cute, bright and fully customisable.',
  },
  anime: {
    name: 'Cartoon, Anime & Asian-inspired',
    blurb: 'Kawaii characters and lanterns.',
    intro: 'Original kawaii characters, chibi faces, cute monsters, sakura, paper lanterns, folding fans and wave patterns inspired by Japanese, Korean and Chinese art. No franchise characters — everything is original.',
  },
  nature: {
    name: 'Flowers & Nature',
    blurb: 'Roses, sakura, ocean and forest.',
    intro: 'Roses, sunflowers, tulips, daisies, lotus, cherry blossom, tropical palms, ocean waves, mountains and sunsets.',
  },
  fantasy: {
    name: 'Fantasy, Magic & Galaxy',
    blurb: 'Galaxies, unicorns and dragons.',
    intro: 'Galaxies, nebulae, moons and planets, unicorns, mermaids, dragons and magical glowing scenes.',
  },
  luxury: {
    name: 'Luxury & Fashion',
    blurb: 'Gold, diamonds and pearls.',
    intro: 'Gold, rose gold, diamonds, pearls, crystal teeth, crowns, marble and holographic finishes for a premium look.',
  },
  gaming: {
    name: 'Gaming & Technology',
    blurb: 'Neon, RGB and cyberpunk.',
    intro: 'Neon tube zippers, RGB glows, retro grids, pixel art, circuits, robots and cyberpunk palettes.',
  },
  cars: {
    name: 'Cars & Transport',
    blurb: 'Supercars, bikes and planes.',
    intro: 'Sports cars, superbikes, racing tracks, airplanes and rockets in bold racing colours.',
  },
  dark: {
    name: 'Dark & Gothic',
    blurb: 'Skulls, flames and shadows.',
    intro: 'Dark, moody designs: skulls, flames, bats, dragons and red-and-black palettes with black nickel and skull pullers.',
  },
  lifestyle: {
    name: 'Lifestyle, Music & Food',
    blurb: 'Music, coffee and sweets.',
    intro: 'Music notes, guitars, headphones, cameras, books, coffee, pizza, donuts, ice cream and cupcakes.',
  },
  seasonal: {
    name: 'Seasons & Holidays',
    blurb: 'Christmas, Halloween and more.',
    intro: 'Christmas, Halloween, Valentine’s Day, New Year, birthdays and the four seasons.',
  },
  art: {
    name: 'Artistic & Abstract',
    blurb: 'Marble, watercolour and pop art.',
    intro: 'Abstract and artistic backgrounds: marble, watercolour, halftone pop art, geometric stripes, liquid gradients and holographic colour.',
  },
};

export type StyleId = 'minimal' | 'cute' | 'elegant' | 'neon' | 'pastel' | 'bold' | 'dark' | 'nature' | 'retro' | 'realistic';
export const STYLES: Record<StyleId, string> = {
  minimal: 'Minimal',
  cute: 'Cute / Kawaii',
  elegant: 'Elegant',
  neon: 'Neon / Glow',
  pastel: 'Pastel',
  bold: 'Bold & Bright',
  dark: 'Dark',
  nature: 'Natural',
  retro: 'Retro / Pixel',
  realistic: 'Metallic',
};

export type ColorId = 'black' | 'white' | 'red' | 'pink' | 'purple' | 'blue' | 'green' | 'yellow' | 'orange' | 'brown' | 'gold' | 'silver' | 'pastel' | 'neon' | 'rainbow';
export const COLORS: Record<ColorId, { name: string; css: string }> = {
  black: { name: 'Black', css: '#111' },
  white: { name: 'White', css: '#fafafa' },
  red: { name: 'Red', css: '#e11d48' },
  pink: { name: 'Pink', css: '#f472b6' },
  purple: { name: 'Purple', css: '#8b5cf6' },
  blue: { name: 'Blue', css: '#3b82f6' },
  green: { name: 'Green', css: '#22c55e' },
  yellow: { name: 'Yellow', css: '#facc15' },
  orange: { name: 'Orange', css: '#fb923c' },
  brown: { name: 'Brown', css: '#92400e' },
  gold: { name: 'Gold', css: 'linear-gradient(135deg,#7a5c0f,#fff4c4,#d4af37)' },
  silver: { name: 'Silver', css: 'linear-gradient(135deg,#6a6a72,#fff,#c0c0c0)' },
  pastel: { name: 'Pastel', css: 'linear-gradient(135deg,#ffd1e8,#cde7ff,#e0d4ff)' },
  neon: { name: 'Neon', css: 'linear-gradient(135deg,#00f5ff,#ff00e5)' },
  rainbow: { name: 'Rainbow', css: 'linear-gradient(90deg,#ff5a5f,#ffd93d,#6bcb77,#4d96ff,#9b5de5)' },
};

export interface LibDesign {
  id: string;
  name: string;
  cat: CatId;
  level: 1 | 2 | 3 | 4 | 5;
  styles: StyleId[];
  colors: ColorId[];
  design: Design;
  order: number;
}

/* ------------------------------------------------------------------ */
/* Builders                                                            */
/* ------------------------------------------------------------------ */
type BgT = [BgKind, string, string, string, number?];
type LayerT = [MotifId, LayoutId, string, string, number, number, number?];
type ZipT = [MetalChoice, TeethId, PullerId, Partial<ZipperOpts>?];

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function colorFamilies(hexes: string[], metal: MetalChoice, layers: LayerT[], bg: BgT, neon = false): ColorId[] {
  const set = new Set<ColorId>();
  for (const h of hexes) {
    const [hue, s, l] = hexHsl(h);
    if (l < 0.13) set.add('black');
    else if (l > 0.9 && s < 0.35) set.add('white');
    else if (s < 0.14) set.add(l > 0.55 ? 'silver' : 'black');
    else {
      if (l > 0.78 && s > 0.3) set.add('pastel');
      if ((hue < 40 || hue > 340) && l < 0.32 && s < 0.75) set.add('brown');
      else if (hue < 14 || hue >= 345) set.add('red');
      else if (hue < 42) set.add('orange');
      else if (hue < 66) set.add('yellow');
      else if (hue < 170) set.add('green');
      else if (hue < 252) set.add('blue');
      else if (hue < 292) set.add('purple');
      else set.add('pink');
    }
  }
  if (metal === 'gold' || metal === 'rose') set.add('gold');
  if (metal === 'silver' || metal === 'white') set.add('silver');
  if (metal === 'holo' || bg[0] === 'holo' || layers.some((l) => l[0] === 'rainbow')) set.add('rainbow');
  if (neon) set.add('neon');
  return [...set];
}

const LIB: LibDesign[] = [];
let order = 0;
const usedIds = new Set<string>();

function add(
  cat: CatId,
  name: string,
  level: LibDesign['level'],
  styles: StyleId[],
  bg: BgT,
  layers: LayerT[],
  zip: ZipT,
  clock: Partial<ClockOpts> = {},
) {
  let id = slug(name);
  if (usedIds.has(id)) id = `${id}-${cat}`;
  usedIds.add(id);
  const art: ArtSpec = {
    bg: { kind: bg[0], c1: bg[1], c2: bg[2], c3: bg[3], angle: bg[4] },
    layers: layers.map(
      (l): ArtLayer => ({ motif: l[0], layout: l[1], c1: l[2], c2: l[3], count: l[4], size: l[5], glow: l[6] ?? 0 }),
    ),
    seed: 1000 + order * 37,
  };
  const [metal, teeth, puller, extra] = zip;
  const design: Design = {
    bg: 'midnight',
    art,
    designId: id,
    adj: { ...DEFAULT_ADJUST, dim: level <= 2 ? 10 : 6 },
    zipper: { ...DEFAULT_ZIPPER, metal, teeth, puller, ...extra },
    clock: { ...DEFAULT_CLOCK, ...clock },
    layers: DEFAULT_LAYERS,
  };
  const hexes = [bg[1], bg[2], bg[3], ...layers.flatMap((l) => [l[2], l[3]])];
  LIB.push({ id, name, cat, level, styles, colors: colorFamilies(hexes, metal, layers, bg, styles.includes('neon') || teeth === 'neon' || bg[0] === 'grid'), design, order: order++ });
}

const tape = (c: string, w = 1): Partial<ZipperOpts> => ({ tapeColor: c, tapeWidth: w });

/* ------------------------------------------------------------------ */
/* A. Basic & minimal                                                  */
/* ------------------------------------------------------------------ */
add('basic', 'Simple Zipper', 1, ['minimal', 'realistic'], ['linear', '#1c1c24', '#0b0b0f', '#0b0b0f'], [], ['silver', 'classic', 'classic']);
add('basic', 'Minimal Zipper', 1, ['minimal'], ['linear', '#f5f5f4', '#e7e5e4', '#d6d3d1'], [], ['black', 'minimal', 'classic', tape('#e7e5e4', 0.7)], { color: 'custom', custom: '#1c1917', font: 'thin' });
add('basic', 'Thick Zipper', 1, ['bold', 'realistic'], ['radial', '#0b0b0f', '#2a2a35', '#8B5CF6'], [], ['gunmetal', 'chunky', 'ring', { size: 1.5 }]);
add('basic', 'Thin Zipper', 1, ['minimal', 'elegant'], ['linear', '#0f172a', '#1e293b', '#0f172a'], [], ['silver', 'coil', 'drop', { size: 0.7 }], { font: 'thin', y: 0.18 });
add('basic', 'White Zipper', 1, ['minimal', 'pastel'], ['radial', '#fafaf9', '#e0e7ff', '#fde68a'], [], ['white', 'classic', 'classic', tape('#d6d3d1')], { color: 'custom', custom: '#334155' });
add('basic', 'Black Zipper', 1, ['minimal', 'dark'], ['linear', '#000000', '#111114', '#000000'], [['dot', 'corner', '#3f3f46', '#fff', 4, 2]], ['black', 'minimal', 'ring', { gloss: 0.6 }]);
add('basic', 'Matte Zipper', 2, ['minimal'], ['linear', '#3f3f46', '#27272a', '#18181b'], [], ['gunmetal', 'chunky', 'classic', { gloss: 0.15 }]);
add('basic', 'Glossy Zipper', 2, ['realistic'], ['radial', '#0b0b0f', '#1e3a8a', '#60a5fa'], [], ['sapphire', 'classic', 'drop', { gloss: 1.5 }]);
add('basic', 'Gradient Zipper', 2, ['bold'], ['linear', '#8B5CF6', '#ec4899', '#f59e0b', 120], [], ['white', 'classic', 'heart', tape('#1f1235')]);
add('basic', 'Double Stripe Zipper', 2, ['minimal', 'bold'], ['stripes', '#0b0b0f', '#1c1c24', '#26262f', 90], [], ['gold', 'chunky', 'classic', { pos: 0.35 }]);
add('basic', 'Colorful Zipper', 2, ['bold', 'cute'], ['polka', '#fef3c7', '#f472b6', '#38bdf8'], [], ['holo', 'classic', 'ring', tape('#ffffff')], { color: 'custom', custom: '#be185d' });
add('basic', 'Minimal Luxury Zipper', 2, ['elegant', 'minimal'], ['linear', '#0b0b0f', '#15151c', '#1c1917'], [], ['gold', 'minimal', 'drop', tape('#0b0b0f', 0.6)], { color: 'gold', font: 'elegant' });

/* ------------------------------------------------------------------ */
/* B. Love & romantic                                                  */
/* ------------------------------------------------------------------ */
add('love', 'Love Zipper', 3, ['cute', 'bold'], ['radial', '#2a0612', '#9f1239', '#fb7185'], [['heart', 'scatter', '#f43f5e', '#ffe4e6', 22, 0.9]], ['ruby', 'heart', 'heart', tape('#4c0519')]);
add('love', 'Pink Heart Zipper', 3, ['cute', 'pastel'], ['linear', '#fff1f2', '#fbcfe8', '#f9a8d4'], [['heart', 'float', '#ec4899', '#ffffff', 26, 0.8], ['sparkle', 'scatter', '#ffffff', '#fdf2f8', 16, 0.5]], ['pink', 'heart', 'heart', tape('#f9a8d4')], { color: 'custom', custom: '#9d174d' });
add('love', 'Red Heart Zipper', 4, ['bold', 'elegant'], ['radial', '#0b0b0f', '#7f1d1d', '#ef4444'], [['heart', 'hero', '#dc2626', '#fecaca', 3, 1], ['sparkle', 'scatter', '#fecaca', '#ffffff', 20, 0.4, 0.6]], ['ruby', 'classic', 'heart']);
add('love', 'Heart Rain Zipper', 3, ['cute'], ['night', '#1e1b4b', '#4c1d95', '#831843'], [['heart', 'rain', '#f472b6', '#ffffff', 40, 0.7, 0.5]], ['rose', 'heart', 'heart']);
add('love', 'Rose Zipper', 4, ['elegant', 'nature'], ['radial', '#1a0508', '#4c0519', '#9f1239'], [['rose', 'cluster', '#e11d48', '#166534', 9, 1.4], ['heart', 'scatter', '#fb7185', '#ffe4e6', 10, 0.4, 0.6]], ['gold', 'classic', 'heart', tape('#2a0a0f')], { color: 'gold', font: 'elegant' });
add('love', 'Couple Hearts Zipper', 4, ['cute', 'elegant'], ['sunset', '#4c1d95', '#db2777', '#fdba74'], [['heart', 'hero', '#f43f5e', '#ffffff', 2, 1.1], ['flyingBird', 'trail', '#1f1235', '#000', 6, 0.5]], ['rose', 'heart', 'heart']);
add('love', 'Valentine Zipper', 4, ['bold', 'cute'], ['polka', '#be123c', '#fda4af', '#fecdd3'], [['heartOutline', 'pattern', '#ffffff', '#fb7185', 14, 0.7]], ['white', 'heart', 'heart', tape('#881337')]);
add('love', 'Flower Love Zipper', 4, ['pastel', 'nature'], ['watercolor', '#fff7ed', '#fecdd3', '#e9d5ff'], [['daisy', 'border', '#ffffff', '#facc15', 26, 0.8], ['heart', 'scatter', '#fb7185', '#fff', 8, 0.5]], ['rose', 'pearl', 'flower', tape('#fbcfe8')], { color: 'custom', custom: '#9f1239' });
add('love', 'Angel Love Zipper', 5, ['pastel', 'elegant'], ['radial', '#e0e7ff', '#fdf2f8', '#fde68a'], [['cloud', 'bottom', '#ffffff', '#c7d2fe', 6, 1.6], ['heart', 'float', '#f9a8d4', '#fff', 14, 0.6, 0.4], ['sparkle', 'scatter', '#fde68a', '#fff', 18, 0.4, 0.5]], ['white', 'pearl', 'heart', tape('#e0e7ff')], { color: 'custom', custom: '#6d28d9' });
add('love', 'Butterfly Love Zipper', 4, ['cute', 'nature'], ['linear', '#fdf4ff', '#f5d0fe', '#c4b5fd'], [['butterfly', 'trail', '#d946ef', '#fde68a', 9, 0.9], ['heart', 'scatter', '#ec4899', '#fff', 10, 0.35]], ['purple', 'heart', 'heart', tape('#a78bfa')], { color: 'purple' });
add('love', 'Cute Love Zipper', 3, ['cute'], ['polka', '#ffe4e6', '#fda4af', '#ffffff'], [['bear', 'hero', '#c08457', '#f5deb3', 1, 0.9], ['heart', 'orbit', '#e11d48', '#fff', 10, 0.5]], ['pink', 'heart', 'heart', tape('#fb7185')], { color: 'custom', custom: '#881337' });
add('love', 'Forever Love Zipper', 5, ['elegant', 'realistic'], ['marble', '#fafaf9', '#d4af37', '#e7e5e4'], [['diamond', 'hero', '#e0f2fe', '#ffffff', 2, 0.9, 0.4], ['heart', 'border', '#d4af37', '#fff', 22, 0.5]], ['gold', 'crystal', 'heart', tape('#e7e5e4')], { color: 'gold', font: 'elegant' });
add('love', 'Wedding Zipper', 5, ['elegant', 'pastel'], ['radial', '#fffbeb', '#fef3c7', '#fde68a'], [['rose', 'corner', '#fff1f2', '#86efac', 10, 1.1], ['pearl', 'trail', '#ffffff', '#fffbeb', 18, 0.35]], ['white', 'pearl', 'gem', tape('#f5f5f4')], { color: 'gold', font: 'elegant', text: 'Forever' });
add('love', 'Romantic Pink Zipper', 3, ['pastel', 'cute'], ['bokeh', '#fbcfe8', '#ffffff', '#f9a8d4'], [['heart', 'scatter', '#f472b6', '#fff', 14, 0.6, 0.4]], ['pink', 'classic', 'drop']);
add('love', 'Romantic Red Zipper', 4, ['bold', 'dark'], ['bokeh', '#450a0a', '#ef4444', '#fca5a5'], [['rose', 'hero', '#b91c1c', '#14532d', 2, 1]], ['ruby', 'crystal', 'heart']);
add('love', 'Sweet Love Zipper', 3, ['cute', 'pastel'], ['checker', '#fce7f3', '#fbcfe8', '#ffffff'], [['cupcake', 'scatter', '#f9a8d4', '#fde68a', 8, 0.8], ['heart', 'scatter', '#ec4899', '#fff', 12, 0.4]], ['pink', 'pearl', 'heart', tape('#f472b6')], { color: 'custom', custom: '#9d174d' });

/* ------------------------------------------------------------------ */
/* C. Football & sports                                                */
/* ------------------------------------------------------------------ */
add('sports', 'Football Stadium Zipper', 5, ['bold', 'realistic'], ['stadium', '#15803d', '#ef4444', '#3b82f6'], [['soccer', 'hero', '#ffffff', '#111111', 1, 0.6]], ['silver', 'chunky', 'ball'], { font: 'bold' });
add('sports', 'Soccer Ball Zipper', 3, ['bold'], ['radial', '#052e16', '#16a34a', '#86efac'], [['soccer', 'scatter', '#ffffff', '#111111', 12, 0.9]], ['white', 'chunky', 'ball', tape('#14532d')]);
add('sports', 'Football Jersey Red Zipper', 4, ['bold'], ['jersey', '#b91c1c', '#ef4444', '#ffffff'], [], ['white', 'chunky', 'ball', tape('#7f1d1d')], { font: 'bold' });
add('sports', 'Football Jersey Blue Zipper', 4, ['bold'], ['jersey', '#1e3a8a', '#2563eb', '#facc15'], [['trophy', 'corner', '#facc15', '#1e3a8a', 2, 0.8], ['star', 'scatter', '#facc15', '#fff', 8, 0.35]], ['gold', 'classic', 'star', tape('#172554')], { font: 'bold', color: 'gold' });
add('sports', 'Football Club Colours Zipper', 4, ['bold'], ['stripes', '#111111', '#facc15', '#111111', 0], [['soccer', 'hero', '#ffffff', '#111111', 1, 0.7]], ['gold', 'chunky', 'ball']);
add('sports', 'World Cup Inspired Zipper', 5, ['elegant', 'bold'], ['radial', '#0b0b0f', '#14532d', '#d4af37'], [['trophy', 'hero', '#d4af37', '#14532d', 1, 0.9, 0.5], ['star', 'corner', '#fde68a', '#fff', 10, 0.4, 0.6]], ['gold', 'classic', 'ball'], { color: 'gold' });
add('sports', 'Champions Night Zipper', 5, ['dark', 'elegant'], ['night', '#020617', '#1e3a8a', '#0f172a'], [['star', 'orbit', '#e2e8f0', '#fff', 8, 0.8, 0.6], ['soccer', 'hero', '#f8fafc', '#1e293b', 1, 0.7]], ['silver', 'classic', 'star']);
add('sports', 'Goalkeeper Zipper', 3, ['bold'], ['checker', '#16a34a', '#15803d', '#ffffff'], [['soccer', 'trail', '#ffffff', '#111', 7, 0.7]], ['emerald', 'chunky', 'ball']);
add('sports', 'Jersey Wall Zipper', 4, ['bold'], ['linear', '#0f172a', '#1e293b', '#0f172a'], [['jersey', 'pattern', '#dc2626', '#ffffff', 10, 0.9]], ['silver', 'chunky', 'ball']);
add('sports', 'Basketball Zipper', 3, ['bold'], ['radial', '#1c0a00', '#9a3412', '#fb923c'], [['basketball', 'hero', '#ea580c', '#1c1917', 2, 1]], ['black', 'chunky', 'ring']);
add('sports', 'Volleyball Beach Zipper', 3, ['bold', 'nature'], ['sunset', '#0ea5e9', '#7dd3fc', '#fde68a'], [['volleyball', 'hero', '#facc15', '#2563eb', 1, 0.9], ['palm', 'corner', '#16a34a', '#92400e', 4, 1.4]], ['sapphire', 'classic', 'drop']);
add('sports', 'Tennis Zipper', 3, ['bold'], ['stripes', '#1d4ed8', '#2563eb', '#1e40af', 90], [['tennis', 'scatter', '#d9f99d', '#ffffff', 9, 0.8]], ['white', 'classic', 'ring', tape('#1e3a8a')]);
add('sports', 'Formula Racing Zipper', 4, ['bold', 'realistic'], ['checker', '#0a0a0a', '#e5e5e5', '#dc2626'], [['car', 'hero', '#dc2626', '#d4d4d8', 2, 0.9]], ['ruby', 'chunky', 'bolt']);
add('sports', 'Boxing Zipper', 3, ['dark', 'bold'], ['radial', '#0a0a0a', '#7f1d1d', '#dc2626'], [['star', 'scatter', '#fde68a', '#fff', 14, 0.5, 0.5], ['bolt', 'hero', '#facc15', '#fff', 2, 0.9]], ['ruby', 'chunky', 'classic'], { font: 'bold' });
add('sports', 'Gym Fitness Zipper', 2, ['bold', 'minimal'], ['linear', '#0a0a0a', '#18181b', '#3f3f46'], [['bolt', 'pattern', '#22c55e', '#fff', 12, 0.5]], ['emerald', 'chunky', 'bolt'], { font: 'bold', text: 'NO DAYS OFF' });
add('sports', 'Skate Zipper', 3, ['retro', 'bold'], ['halftone', '#f97316', '#facc15', '#1c1917'], [['star', 'scatter', '#ffffff', '#fff', 10, 0.6], ['flame', 'bottom', '#dc2626', '#facc15', 6, 1]], ['black', 'chunky', 'skull']);
add('sports', 'Extreme Sports Zipper', 4, ['bold'], ['mountains', '#0ea5e9', '#bae6fd', '#1e3a8a'], [['bolt', 'trail', '#facc15', '#fff', 6, 0.7, 0.5]], ['gunmetal', 'chunky', 'bolt']);

/* ------------------------------------------------------------------ */
/* D. Cats                                                             */
/* ------------------------------------------------------------------ */
add('cats', 'Cute Cat Zipper', 3, ['cute', 'pastel'], ['polka', '#fef3c7', '#fde68a', '#fbcfe8'], [['cat', 'hero', '#fb923c', '#fbcfe8', 1, 0.9], ['paw', 'scatter', '#f472b6', '#fff', 10, 0.4]], ['pink', 'pearl', 'paw', tape('#f9a8d4')], { color: 'custom', custom: '#9a3412' });
add('cats', 'Black Cat Zipper', 3, ['dark', 'cute'], ['night', '#0f172a', '#312e81', '#1e1b4b'], [['catSit', 'hero', '#0a0a0a', '#facc15', 1, 1], ['moon', 'corner', '#fef3c7', '#d6d3d1', 1, 1.4, 0.5]], ['black', 'classic', 'paw']);
add('cats', 'White Cat Zipper', 3, ['pastel', 'cute'], ['radial', '#e0f2fe', '#f8fafc', '#bae6fd'], [['cat', 'pattern', '#ffffff', '#fbcfe8', 9, 0.8]], ['white', 'pearl', 'paw', tape('#bae6fd')], { color: 'custom', custom: '#0c4a6e' });
add('cats', 'Orange Cat Zipper', 3, ['cute', 'bold'], ['linear', '#fff7ed', '#fed7aa', '#fdba74'], [['cat', 'hero', '#f97316', '#fecdd3', 2, 0.8], ['paw', 'trail', '#ea580c', '#fff', 8, 0.4]], ['gold', 'classic', 'paw', tape('#9a3412')], { color: 'custom', custom: '#7c2d12' });
add('cats', 'Persian Cat Zipper', 4, ['elegant', 'cute'], ['bokeh', '#4c1d95', '#f5d0fe', '#fde68a'], [['cat', 'hero', '#e7e5e4', '#fbcfe8', 1, 1.1], ['crown', 'hero', '#d4af37', '#ef4444', 1, 0.5]], ['gold', 'crystal', 'crown']);
add('cats', 'Kitten Pattern Zipper', 3, ['cute', 'pastel'], ['linear', '#ecfccb', '#d9f99d', '#bef264'], [['cat', 'pattern', '#a8a29e', '#fda4af', 12, 0.7]], ['emerald', 'pearl', 'paw', tape('#3f6212')], { color: 'custom', custom: '#365314' });
add('cats', 'Sleeping Cat Zipper', 4, ['cute', 'dark'], ['night', '#1e1b4b', '#3730a3', '#0f172a'], [['catSit', 'bottom', '#57534e', '#fde68a', 2, 1.2], ['star', 'scatter', '#fef08a', '#fff', 14, 0.35, 0.6], ['moon', 'corner', '#fef9c3', '#e7e5e4', 1, 1.2, 0.4]], ['silver', 'coil', 'star']);
add('cats', 'Paw Print Pink Zipper', 2, ['cute', 'minimal'], ['linear', '#fdf2f8', '#fce7f3', '#fbcfe8'], [['paw', 'trail', '#ec4899', '#fdf2f8', 12, 0.6]], ['pink', 'classic', 'paw', tape('#f9a8d4')], { color: 'custom', custom: '#831843' });
add('cats', 'Kawaii Cat Zipper', 4, ['cute', 'pastel'], ['watercolor', '#fdf4ff', '#bae6fd', '#fbcfe8'], [['cat', 'scatter', '#f5f5f4', '#f9a8d4', 8, 0.9], ['heart', 'scatter', '#f472b6', '#fff', 10, 0.35], ['sparkle', 'scatter', '#facc15', '#fff', 10, 0.3]], ['holo', 'heart', 'paw', tape('#e9d5ff')], { color: 'purple' });
add('cats', 'Cat Lover Zipper', 3, ['cute', 'bold'], ['checker', '#fef3c7', '#fde68a', '#f97316'], [['catSit', 'pattern', '#292524', '#facc15', 10, 0.8]], ['black', 'chunky', 'paw']);
add('cats', 'Fantasy Cat Zipper', 5, ['neon', 'cute'], ['galaxy', '#7c3aed', '#ec4899', '#22d3ee'], [['cat', 'hero', '#c4b5fd', '#f9a8d4', 1, 1], ['star', 'orbit', '#fde68a', '#fff', 9, 0.4, 0.8]], ['holo', 'star', 'star']);
add('cats', 'Grey Tabby Zipper', 3, ['cute', 'minimal'], ['radial', '#f5f5f4', '#e7e5e4', '#a8a29e'], [['cat', 'cluster', '#a8a29e', '#fecdd3', 6, 1], ['paw', 'corner', '#78716c', '#fff', 6, 0.4]], ['gunmetal', 'classic', 'paw', tape('#57534e')], { color: 'custom', custom: '#292524' });

/* ------------------------------------------------------------------ */
/* E. Dogs                                                             */
/* ------------------------------------------------------------------ */
add('dogs', 'Cute Dog Zipper', 3, ['cute'], ['polka', '#e0f2fe', '#7dd3fc', '#ffffff'], [['dog', 'hero', '#d6a35c', '#8b5a2b', 1, 0.9], ['paw', 'scatter', '#0ea5e9', '#fff', 8, 0.4]], ['sapphire', 'classic', 'paw', tape('#0c4a6e')], { color: 'custom', custom: '#0c4a6e' });
add('dogs', 'Puppy Zipper', 3, ['cute', 'pastel'], ['linear', '#fefce8', '#fef9c3', '#fde68a'], [['dog', 'pattern', '#f5f5f4', '#a16207', 9, 0.7]], ['gold', 'pearl', 'paw'], { color: 'custom', custom: '#713f12' });
add('dogs', 'Golden Retriever Zipper', 4, ['cute', 'nature'], ['meadow', '#bae6fd', '#e0f2fe', '#65a30d'], [['dog', 'hero', '#eab308', '#ca8a04', 1, 1], ['daisy', 'bottom', '#ffffff', '#facc15', 10, 0.6]], ['gold', 'classic', 'paw']);
add('dogs', 'Husky Zipper', 4, ['cute', 'dark'], ['snow', '#0f172a', '#334155', '#e2e8f0'], [['dog', 'hero', '#94a3b8', '#334155', 1, 1], ['snowflake', 'scatter', '#e0f2fe', '#fff', 12, 0.4, 0.5]], ['silver', 'coil', 'paw']);
add('dogs', 'Shepherd Zipper', 3, ['bold'], ['radial', '#1c1917', '#78350f', '#d97706'], [['dog', 'hero', '#b45309', '#1c1917', 2, 0.8]], ['black', 'chunky', 'paw']);
add('dogs', 'Bulldog Zipper', 3, ['cute', 'bold'], ['stripes', '#fef2f2', '#fecaca', '#fee2e2', 20], [['dog', 'scatter', '#e7e5e4', '#a8a29e', 7, 0.8]], ['ruby', 'chunky', 'paw']);
add('dogs', 'Poodle Zipper', 4, ['elegant', 'pastel'], ['radial', '#fdf2f8', '#fce7f3', '#e9d5ff'], [['dog', 'hero', '#ffffff', '#f9a8d4', 1, 0.9], ['pearl', 'border', '#ffffff', '#fdf2f8', 24, 0.4]], ['white', 'pearl', 'gem', tape('#f9a8d4')], { color: 'custom', custom: '#831843', font: 'elegant' });
add('dogs', 'Sleeping Puppy Zipper', 4, ['cute', 'dark'], ['night', '#172554', '#1e3a8a', '#0f172a'], [['dog', 'bottom', '#d6d3d1', '#78716c', 2, 1.2], ['moon', 'corner', '#fef3c7', '#e7e5e4', 1, 1.2, 0.4], ['star', 'scatter', '#fde68a', '#fff', 12, 0.3, 0.6]], ['silver', 'classic', 'star']);
add('dogs', 'Dog Paw Trail Zipper', 2, ['minimal'], ['linear', '#f5f5f4', '#e7e5e4', '#d6d3d1'], [['paw', 'trail', '#57534e', '#f5f5f4', 14, 0.5]], ['gunmetal', 'minimal', 'paw', tape('#a8a29e')], { color: 'custom', custom: '#1c1917' });
add('dogs', 'Kawaii Puppy Zipper', 4, ['cute', 'pastel'], ['watercolor', '#ecfeff', '#a5f3fc', '#fbcfe8'], [['dog', 'scatter', '#fde68a', '#f59e0b', 7, 0.9], ['heart', 'scatter', '#f472b6', '#fff', 10, 0.35], ['bone' as MotifId, 'scatter', '#fff', '#fff', 0, 0.4]], ['pink', 'heart', 'paw'], { color: 'custom', custom: '#0e7490' });
add('dogs', 'Dog Lover Zipper', 3, ['bold', 'cute'], ['checker', '#1e3a8a', '#1d4ed8', '#facc15'], [['dog', 'pattern', '#fcd34d', '#b45309', 10, 0.7]], ['gold', 'chunky', 'paw']);

/* ------------------------------------------------------------------ */
/* F. Birds                                                            */
/* ------------------------------------------------------------------ */
add('birds', 'Parrot Zipper', 4, ['bold', 'nature'], ['meadow', '#22d3ee', '#a5f3fc', '#16a34a'], [['bird', 'hero', '#ef4444', '#2563eb', 2, 0.9], ['leaf', 'corner', '#22c55e', '#14532d', 10, 0.9]], ['emerald', 'classic', 'flower']);
add('birds', 'Wise Owl Zipper', 4, ['cute', 'dark'], ['night', '#1e1b4b', '#312e81', '#0f172a'], [['owl', 'hero', '#92400e', '#fde68a', 1, 1], ['moon', 'corner', '#fef3c7', '#e7e5e4', 1, 1.3, 0.5], ['star', 'scatter', '#fde68a', '#fff', 12, 0.3, 0.6]], ['gold', 'classic', 'star']);
add('birds', 'Peacock Zipper', 5, ['elegant', 'bold'], ['radial', '#042f2e', '#0f766e', '#2563eb'], [['wave', 'pattern', '#0d9488', '#1d4ed8', 12, 0.9], ['diamond', 'scatter', '#22d3ee', '#fff', 8, 0.4, 0.6]], ['emerald', 'crystal', 'gem']);
add('birds', 'Flamingo Zipper', 3, ['pastel', 'bold'], ['sunset', '#fb7185', '#fda4af', '#fef3c7'], [['bird', 'scatter', '#f472b6', '#ec4899', 6, 0.9], ['palm', 'bottom', '#15803d', '#78350f', 3, 1.5]], ['pink', 'classic', 'drop']);
add('birds', 'Dove Peace Zipper', 3, ['minimal', 'pastel'], ['linear', '#e0f2fe', '#f0f9ff', '#ffffff'], [['flyingBird', 'trail', '#ffffff', '#fff', 8, 0.9], ['leaf', 'scatter', '#86efac', '#14532d', 5, 0.4]], ['white', 'minimal', 'drop', tape('#bae6fd')], { color: 'custom', custom: '#0c4a6e' });
add('birds', 'Swan Lake Zipper', 4, ['elegant'], ['waves', '#1e3a8a', '#0ea5e9', '#e0f2fe'], [['flyingBird', 'scatter', '#ffffff', '#fff', 6, 0.7], ['lotus', 'bottom', '#f9a8d4', '#38bdf8', 4, 0.9]], ['silver', 'pearl', 'drop']);
add('birds', 'Penguin Zipper', 3, ['cute'], ['snow', '#0c4a6e', '#38bdf8', '#f8fafc'], [['penguin', 'bottom', '#1e293b', '#ffffff', 4, 1.1]], ['sapphire', 'classic', 'ring']);
add('birds', 'Hummingbird Zipper', 4, ['nature', 'bold'], ['watercolor', '#f0fdf4', '#bbf7d0', '#fbcfe8'], [['bird', 'trail', '#10b981', '#6366f1', 5, 0.7], ['tulip', 'bottom', '#ec4899', '#16a34a', 7, 0.8]], ['emerald', 'coil', 'flower']);
add('birds', 'Colorful Birds Zipper', 4, ['bold', 'cute'], ['linear', '#fef9c3', '#fde68a', '#fdba74'], [['bird', 'pattern', '#3b82f6', '#f43f5e', 10, 0.7]], ['holo', 'classic', 'drop']);
add('birds', 'Flying Flock Zipper', 3, ['minimal', 'nature'], ['sunset', '#7c2d12', '#ea580c', '#fde68a'], [['flyingBird', 'scatter', '#1c1917', '#000', 18, 0.5]], ['black', 'minimal', 'drop', tape('#431407')]);
add('birds', 'Fantasy Bird Zipper', 5, ['neon'], ['galaxy', '#0891b2', '#7c3aed', '#db2777'], [['bird', 'hero', '#22d3ee', '#f472b6', 1, 1, 0.8], ['sparkle', 'trail', '#fde68a', '#fff', 14, 0.4, 0.8]], ['holo', 'crystal', 'star']);
add('birds', 'Eagle Sky Zipper', 4, ['bold', 'realistic'], ['mountains', '#1e3a8a', '#60a5fa', '#334155'], [['flyingBird', 'hero', '#1c1917', '#000', 2, 1.4]], ['gunmetal', 'chunky', 'bolt']);

/* ------------------------------------------------------------------ */
/* G. Wildlife                                                         */
/* ------------------------------------------------------------------ */
add('wildlife', 'Lion King Zipper', 4, ['bold', 'cute'], ['sunset', '#7c2d12', '#f97316', '#fde68a'], [['lion', 'hero', '#fbbf24', '#b45309', 1, 1]], ['gold', 'chunky', 'crown'], { color: 'gold' });
add('wildlife', 'Panda Bamboo Zipper', 4, ['cute', 'nature'], ['linear', '#ecfccb', '#d9f99d', '#bbf7d0'], [['bamboo', 'border', '#65a30d', '#4d7c0f', 12, 1.2], ['panda', 'hero', '#ffffff', '#1c1917', 1, 0.9]], ['black', 'classic', 'paw', tape('#3f6212')], { color: 'custom', custom: '#1a2e05' });
add('wildlife', 'Fox Forest Zipper', 4, ['cute', 'nature'], ['mountains', '#fed7aa', '#fef3c7', '#14532d'], [['fox', 'hero', '#ea580c', '#ffffff', 1, 0.9], ['leaf', 'scatter', '#f97316', '#7c2d12', 12, 0.5]], ['rose', 'classic', 'paw']);
add('wildlife', 'Teddy Bear Zipper', 3, ['cute', 'pastel'], ['polka', '#fef3c7', '#fcd34d', '#fde68a'], [['bear', 'pattern', '#b45309', '#fde68a', 9, 0.7]], ['gold', 'pearl', 'heart'], { color: 'custom', custom: '#78350f' });
add('wildlife', 'Bunny Zipper', 3, ['cute', 'pastel'], ['watercolor', '#fdf2f8', '#e9d5ff', '#bae6fd'], [['bunny', 'hero', '#ffffff', '#fbcfe8', 2, 0.9], ['daisy', 'scatter', '#ffffff', '#facc15', 10, 0.4]], ['white', 'pearl', 'flower'], { color: 'custom', custom: '#6d28d9' });
add('wildlife', 'Dolphin Ocean Zipper', 4, ['nature', 'bold'], ['waves', '#0c4a6e', '#0ea5e9', '#bae6fd'], [['fish', 'scatter', '#38bdf8', '#e0f2fe', 9, 0.8], ['bubble', 'float', '#e0f2fe', '#fff', 18, 0.5]], ['sapphire', 'coil', 'drop']);
add('wildlife', 'Whale Dream Zipper', 4, ['cute', 'pastel'], ['linear', '#1e3a8a', '#2563eb', '#7dd3fc'], [['whale', 'hero', '#93c5fd', '#e0f2fe', 2, 1], ['bubble', 'float', '#bfdbfe', '#fff', 16, 0.4]], ['sapphire', 'pearl', 'drop']);
add('wildlife', 'Shark Zipper', 3, ['bold', 'dark'], ['waves', '#082f49', '#0369a1', '#38bdf8'], [['fish', 'hero', '#64748b', '#e2e8f0', 2, 1.1]], ['gunmetal', 'chunky', 'bolt']);
add('wildlife', 'Tropical Fish Zipper', 4, ['bold', 'cute'], ['waves', '#0e7490', '#22d3ee', '#a5f3fc'], [['fish', 'pattern', '#f97316', '#facc15', 12, 0.7]], ['gold', 'classic', 'drop']);
add('wildlife', 'Dinosaur Zipper', 3, ['cute', 'bold'], ['meadow', '#a7f3d0', '#ecfccb', '#65a30d'], [['dino', 'hero', '#22c55e', '#facc15', 2, 0.9], ['palm', 'corner', '#16a34a', '#78350f', 3, 1.3]], ['emerald', 'chunky', 'star']);
add('wildlife', 'Butterfly Garden Zipper', 4, ['nature', 'pastel'], ['meadow', '#e0f2fe', '#f0f9ff', '#86efac'], [['butterfly', 'scatter', '#a855f7', '#fde68a', 10, 0.7], ['tulip', 'bottom', '#f43f5e', '#16a34a', 9, 0.8]], ['purple', 'classic', 'flower']);
add('wildlife', 'Busy Bee Zipper', 3, ['cute', 'bold'], ['polka', '#fef9c3', '#facc15', '#ffffff'], [['bee', 'trail', '#facc15', '#1c1917', 6, 0.8], ['sunflower', 'corner', '#facc15', '#78350f', 4, 1.1]], ['gold', 'chunky', 'flower']);
add('wildlife', 'Ladybug Zipper', 3, ['cute'], ['linear', '#dcfce7', '#bbf7d0', '#86efac'], [['ladybug', 'scatter', '#dc2626', '#111111', 9, 0.7], ['leaf', 'scatter', '#16a34a', '#14532d', 8, 0.8]], ['ruby', 'classic', 'heart']);
add('wildlife', 'Unicorn Zipper', 4, ['cute', 'pastel'], ['holo', '#fbcfe8', '#ffffff', '#ffffff'], [['unicorn', 'hero', '#ffffff', '#c084fc', 1, 1], ['star', 'scatter', '#fde68a', '#fff', 12, 0.35]], ['holo', 'star', 'star'], { color: 'purple' });
add('wildlife', 'Tiger Stripes Zipper', 4, ['bold'], ['stripes', '#ea580c', '#1c1917', '#f97316', 70], [['lion', 'hero', '#f97316', '#1c1917', 1, 0.8]], ['gold', 'chunky', 'paw']);
add('wildlife', 'Wolf Moon Zipper', 4, ['dark'], ['night', '#020617', '#1e293b', '#0f172a'], [['moon', 'hero', '#f1f5f9', '#cbd5e1', 1, 1.1, 0.6], ['dog', 'bottom', '#64748b', '#1e293b', 1, 1.3]], ['silver', 'classic', 'paw']);

/* ------------------------------------------------------------------ */
/* H. Cartoon, anime & Asian-inspired                                  */
/* ------------------------------------------------------------------ */
add('anime', 'Kawaii Girl Zipper', 4, ['cute', 'pastel'], ['watercolor', '#fdf2f8', '#fbcfe8', '#ddd6fe'], [['kawaiiGirl', 'hero', '#7c3aed', '#f472b6', 1, 0.9], ['sparkle', 'scatter', '#facc15', '#fff', 12, 0.35]], ['pink', 'heart', 'heart'], { color: 'purple' });
add('anime', 'Chibi Boy Zipper', 4, ['cute', 'bold'], ['radial', '#e0f2fe', '#7dd3fc', '#fde68a'], [['kawaiiBoy', 'hero', '#1c1917', '#2563eb', 1, 0.9], ['star', 'scatter', '#facc15', '#fff', 10, 0.35]], ['sapphire', 'classic', 'star'], { color: 'custom', custom: '#1e3a8a' });
add('anime', 'Anime Friends Zipper', 5, ['cute', 'bold'], ['bokeh', '#fdf4ff', '#f0abfc', '#93c5fd'], [['kawaiiGirl', 'hero', '#f472b6', '#facc15', 1, 0.8], ['kawaiiBoy', 'hero', '#0ea5e9', '#f43f5e', 2, 0.6], ['heart', 'scatter', '#ec4899', '#fff', 10, 0.35]], ['holo', 'heart', 'star'], { color: 'purple' });
add('anime', 'Cute Monster Zipper', 3, ['cute', 'bold'], ['polka', '#ede9fe', '#a78bfa', '#c4b5fd'], [['monster', 'scatter', '#22c55e', '#facc15', 7, 0.9]], ['purple', 'chunky', 'star']);
add('anime', 'Sakura Zipper', 4, ['pastel', 'elegant'], ['radial', '#fdf2f8', '#fbcfe8', '#fce7f3'], [['sakura', 'rain', '#f9a8d4', '#be185d', 30, 0.8], ['sakura', 'corner', '#f472b6', '#9d174d', 8, 1.3]], ['rose', 'pearl', 'flower'], { color: 'custom', custom: '#9d174d' });
add('anime', 'Japanese Wave Zipper', 4, ['elegant', 'retro'], ['linear', '#f5f5f4', '#e7e5e4', '#d6d3d1'], [['wave', 'pattern', '#1e3a8a', '#e0f2fe', 14, 1.1]], ['white', 'classic', 'drop', tape('#1e3a8a')], { color: 'custom', custom: '#1e3a8a', font: 'elegant' });
add('anime', 'Paper Lantern Zipper', 4, ['elegant', 'dark'], ['night', '#1c0a00', '#450a0a', '#0f172a'], [['lantern', 'scatter', '#dc2626', '#facc15', 7, 1, 0.8]], ['gold', 'classic', 'drop'], { color: 'gold', font: 'elegant' });
add('anime', 'Folding Fan Zipper', 4, ['elegant'], ['marble', '#fef2f2', '#fecaca', '#d4af37'], [['fan', 'hero', '#dc2626', '#facc15', 2, 0.9], ['sakura', 'scatter', '#f9a8d4', '#be185d', 10, 0.4]], ['gold', 'classic', 'flower'], { color: 'custom', custom: '#7f1d1d', font: 'elegant' });
add('anime', 'Bamboo Garden Zipper', 3, ['nature', 'minimal'], ['linear', '#f0fdf4', '#dcfce7', '#bbf7d0'], [['bamboo', 'bottom', '#16a34a', '#15803d', 7, 1.6]], ['emerald', 'minimal', 'drop'], { color: 'custom', custom: '#14532d' });
add('anime', 'Magic Girl Zipper', 5, ['cute', 'neon'], ['galaxy', '#db2777', '#7c3aed', '#38bdf8'], [['kawaiiGirl', 'hero', '#f9a8d4', '#facc15', 1, 0.9], ['star', 'orbit', '#fde68a', '#fff', 10, 0.4, 0.8]], ['holo', 'star', 'star'], { color: 'white' });
add('anime', 'Cartoon Animals Zipper', 4, ['cute', 'bold'], ['checker', '#fef3c7', '#fde68a', '#fb923c'], [['bear', 'scatter', '#b45309', '#fde68a', 4, 0.8], ['bunny', 'scatter', '#ffffff', '#fbcfe8', 4, 0.7], ['cat', 'scatter', '#fb923c', '#fecdd3', 4, 0.7]], ['gold', 'chunky', 'paw']);
add('anime', 'Kawaii Food Zipper', 3, ['cute', 'pastel'], ['polka', '#fdf2f8', '#f9a8d4', '#bae6fd'], [['donut', 'scatter', '#f472b6', '#38bdf8', 6, 0.8], ['iceCream', 'scatter', '#a5f3fc', '#fcd34d', 5, 0.8]], ['pink', 'pearl', 'heart']);
add('anime', 'Robot Pal Zipper', 3, ['cute', 'neon'], ['circuit', '#0f172a', '#22d3ee', '#f472b6'], [['robot', 'hero', '#94a3b8', '#22d3ee', 1, 1]], ['silver', 'pixel', 'bolt']);
add('anime', 'Mount Fuji Dawn Zipper', 4, ['nature', 'elegant'], ['mountains', '#fecdd3', '#fff1f2', '#475569'], [['sun', 'hero', '#ef4444', '#fca5a5', 1, 0.7], ['sakura', 'corner', '#f9a8d4', '#be185d', 6, 0.8]], ['white', 'classic', 'drop', tape('#475569')], { color: 'custom', custom: '#7f1d1d' });

/* ------------------------------------------------------------------ */
/* I. Flowers & nature                                                 */
/* ------------------------------------------------------------------ */
add('nature', 'Rose Garden Zipper', 4, ['elegant', 'nature'], ['radial', '#14532d', '#166534', '#4ade80'], [['rose', 'pattern', '#e11d48', '#15803d', 9, 0.9]], ['gold', 'classic', 'flower']);
add('nature', 'Sunflower Zipper', 4, ['bold', 'nature'], ['meadow', '#38bdf8', '#bae6fd', '#4d7c0f'], [['sunflower', 'bottom', '#facc15', '#78350f', 6, 1.4], ['cloud', 'corner', '#ffffff', '#bae6fd', 3, 1.2]], ['gold', 'chunky', 'flower']);
add('nature', 'Tulip Field Zipper', 4, ['bold', 'nature'], ['meadow', '#bfdbfe', '#eff6ff', '#16a34a'], [['tulip', 'bottom', '#ef4444', '#15803d', 12, 0.9], ['tulip', 'bottom', '#f9a8d4', '#15803d', 10, 0.7]], ['ruby', 'classic', 'flower']);
add('nature', 'Daisy Zipper', 3, ['minimal', 'pastel'], ['linear', '#fefce8', '#fef9c3', '#fef08a'], [['daisy', 'scatter', '#ffffff', '#facc15', 14, 0.8]], ['white', 'pearl', 'flower', tape('#ca8a04')], { color: 'custom', custom: '#713f12' });
add('nature', 'Cherry Blossom Zipper', 4, ['pastel', 'elegant'], ['linear', '#bae6fd', '#e0f2fe', '#fce7f3'], [['sakura', 'corner', '#fbcfe8', '#db2777', 14, 1], ['sakura', 'rain', '#f9a8d4', '#db2777', 18, 0.5]], ['rose', 'pearl', 'flower'], { color: 'custom', custom: '#9d174d' });
add('nature', 'Lavender Zipper', 3, ['pastel'], ['watercolor', '#f5f3ff', '#ddd6fe', '#c4b5fd'], [['leaf', 'bottom', '#8b5cf6', '#c4b5fd', 16, 0.9]], ['purple', 'coil', 'flower'], { color: 'purple' });
add('nature', 'Lotus Pond Zipper', 4, ['elegant', 'nature'], ['waves', '#134e4a', '#0d9488', '#99f6e4'], [['lotus', 'scatter', '#f9a8d4', '#14b8a6', 5, 1]], ['emerald', 'pearl', 'flower']);
add('nature', 'Tropical Zipper', 4, ['bold', 'nature'], ['sunset', '#0891b2', '#22d3ee', '#fde68a'], [['palm', 'corner', '#15803d', '#78350f', 4, 2], ['leaf', 'border', '#22c55e', '#14532d', 20, 1]], ['emerald', 'chunky', 'flower']);
add('nature', 'Forest Zipper', 3, ['nature', 'dark'], ['mountains', '#052e16', '#166534', '#14532d'], [['leaf', 'rain', '#4ade80', '#14532d', 20, 0.6]], ['emerald', 'classic', 'drop']);
add('nature', 'Ocean Zipper', 3, ['nature', 'bold'], ['waves', '#083344', '#0e7490', '#67e8f9'], [['bubble', 'float', '#a5f3fc', '#fff', 20, 0.6]], ['sapphire', 'coil', 'drop']);
add('nature', 'Sunset Zipper', 3, ['bold', 'nature'], ['sunset', '#4c1d95', '#f97316', '#fde68a'], [['flyingBird', 'scatter', '#1c1917', '#000', 7, 0.5], ['palm', 'bottom', '#0a0a0a', '#0a0a0a', 2, 2]], ['gold', 'classic', 'drop']);
add('nature', 'Mountain Dawn Zipper', 3, ['nature', 'minimal'], ['mountains', '#fdba74', '#fef3c7', '#334155'], [], ['gunmetal', 'classic', 'drop']);
add('nature', 'Rainbow Nature Zipper', 4, ['bold', 'cute'], ['meadow', '#7dd3fc', '#e0f2fe', '#4ade80'], [['rainbow', 'hero', '#ffffff', '#fff', 1, 1.1], ['daisy', 'bottom', '#ffffff', '#facc15', 12, 0.6]], ['holo', 'classic', 'flower']);
add('nature', 'Wildflower Zipper', 4, ['nature', 'pastel'], ['watercolor', '#fefce8', '#fde68a', '#bbf7d0'], [['daisy', 'cluster', '#ffffff', '#f59e0b', 10, 0.9], ['tulip', 'cluster', '#f472b6', '#16a34a', 8, 0.8], ['butterfly', 'scatter', '#38bdf8', '#fde68a', 3, 0.6]], ['gold', 'pearl', 'flower']);
add('nature', 'Waterfall Mist Zipper', 4, ['nature'], ['linear', '#164e63', '#0e7490', '#cffafe', 90], [['bubble', 'rain', '#e0f2fe', '#fff', 26, 0.5], ['leaf', 'corner', '#16a34a', '#14532d', 10, 1]], ['silver', 'coil', 'drop']);

/* ------------------------------------------------------------------ */
/* J. Fantasy, magic & galaxy                                          */
/* ------------------------------------------------------------------ */
add('fantasy', 'Galaxy Zipper', 4, ['neon', 'dark'], ['galaxy', '#7c3aed', '#2563eb', '#db2777'], [['sparkle', 'scatter', '#ffffff', '#fff', 14, 0.4, 0.8]], ['holo', 'crystal', 'star']);
add('fantasy', 'Planet Ring Zipper', 4, ['dark', 'bold'], ['galaxy', '#1e3a8a', '#0f172a', '#7c3aed'], [['planet', 'hero', '#f59e0b', '#fde68a', 2, 1]], ['gold', 'classic', 'ring']);
add('fantasy', 'Moon Zipper', 3, ['dark', 'elegant'], ['night', '#020617', '#1e1b4b', '#0f172a'], [['moon', 'hero', '#fef9c3', '#d6d3d1', 1, 1.2, 0.7], ['star', 'scatter', '#fef08a', '#fff', 12, 0.3, 0.6]], ['silver', 'classic', 'star']);
add('fantasy', 'Starry Night Zipper', 3, ['dark'], ['night', '#0f172a', '#312e81', '#4c1d95'], [['star', 'scatter', '#fde68a', '#fff', 24, 0.35, 0.8]], ['gold', 'star', 'star']);
add('fantasy', 'Rocket Space Zipper', 4, ['bold', 'cute'], ['galaxy', '#0891b2', '#1e3a8a', '#7c3aed'], [['rocket', 'hero', '#f8fafc', '#f97316', 1, 1], ['planet', 'corner', '#a855f7', '#fde68a', 2, 0.8]], ['silver', 'chunky', 'bolt']);
add('fantasy', 'Nebula Zipper', 5, ['neon'], ['galaxy', '#db2777', '#f97316', '#7c3aed'], [['dot', 'scatter', '#fde68a', '#fff', 30, 0.5]], ['holo', 'neon', 'gem']);
add('fantasy', 'Fairy Dust Zipper', 5, ['pastel', 'neon'], ['bokeh', '#4c1d95', '#f0abfc', '#fde68a'], [['butterfly', 'trail', '#f0abfc', '#fde68a', 6, 0.7, 0.6], ['sparkle', 'scatter', '#fef08a', '#fff', 24, 0.35, 0.8]], ['holo', 'pearl', 'star']);
add('fantasy', 'Mermaid Zipper', 5, ['pastel', 'bold'], ['waves', '#0e7490', '#2dd4bf', '#a5f3fc'], [['mermaid', 'hero', '#14b8a6', '#a78bfa', 1, 1], ['bubble', 'float', '#e0f2fe', '#fff', 16, 0.4], ['pearl', 'scatter', '#ffffff', '#fdf4ff', 6, 0.3]], ['emerald', 'pearl', 'gem']);
add('fantasy', 'Dragon Fire Zipper', 5, ['dark', 'bold'], ['fire', '#7f1d1d', '#f97316', '#facc15'], [['dragon', 'hero', '#dc2626', '#7f1d1d', 1, 1.1], ['flame', 'bottom', '#f97316', '#fde047', 7, 1]], ['ruby', 'crystal', 'skull']);
add('fantasy', 'Unicorn Dream Zipper', 5, ['cute', 'pastel'], ['holo', '#e9d5ff', '#ffffff', '#ffffff'], [['unicorn', 'hero', '#ffffff', '#f472b6', 1, 1], ['rainbow', 'corner', '#ffffff', '#fff', 1, 0.9], ['star', 'scatter', '#fde68a', '#fff', 10, 0.35]], ['holo', 'heart', 'star'], { color: 'purple' });
add('fantasy', 'Magic Glow Zipper', 4, ['neon'], ['radial', '#0b0b0f', '#7c3aed', '#22d3ee'], [['sparkle', 'orbit', '#e9d5ff', '#fff', 14, 0.6, 1]], ['purple', 'neon', 'star']);
add('fantasy', 'Dream World Zipper', 5, ['pastel', 'cute'], ['sunset', '#c4b5fd', '#f9a8d4', '#fde68a'], [['cloud', 'bottom', '#ffffff', '#ddd6fe', 6, 1.6], ['balloon', 'float', '#f472b6', '#ffffff', 7, 0.7], ['star', 'scatter', '#fde68a', '#fff', 8, 0.3]], ['white', 'pearl', 'star']);
add('fantasy', 'Cosmic Cat Zipper', 5, ['neon', 'cute'], ['galaxy', '#0891b2', '#7c3aed', '#f472b6'], [['catSit', 'hero', '#0f172a', '#22d3ee', 1, 1], ['planet', 'scatter', '#f472b6', '#fde68a', 3, 0.5]], ['holo', 'star', 'paw']);
add('fantasy', 'Fantasy Kingdom Zipper', 5, ['elegant', 'pastel'], ['mountains', '#c4b5fd', '#fdf4ff', '#7c3aed'], [['crown', 'hero', '#d4af37', '#ef4444', 1, 0.9, 0.4], ['star', 'corner', '#fde68a', '#fff', 10, 0.4, 0.6]], ['gold', 'crystal', 'crown'], { color: 'gold', font: 'elegant' });

/* ------------------------------------------------------------------ */
/* K. Luxury & fashion                                                 */
/* ------------------------------------------------------------------ */
add('luxury', 'Diamond Zipper', 5, ['elegant', 'realistic'], ['radial', '#0b0b0f', '#1e293b', '#e0f2fe'], [['diamond', 'scatter', '#e0f2fe', '#ffffff', 10, 0.8, 0.5]], ['silver', 'crystal', 'gem']);
add('luxury', 'Crystal Zipper', 5, ['elegant', 'realistic'], ['marble', '#f8fafc', '#cbd5e1', '#a5b4fc'], [['diamond', 'border', '#c7d2fe', '#ffffff', 18, 0.6, 0.4]], ['white', 'crystal', 'gem', tape('#e2e8f0')], { color: 'custom', custom: '#312e81', font: 'elegant' });
add('luxury', 'Pearl Necklace Zipper', 5, ['elegant', 'pastel'], ['radial', '#1c1917', '#44403c', '#fef3c7'], [['pearl', 'orbit', '#fafaf9', '#ffffff', 22, 0.5]], ['white', 'pearl', 'drop'], { color: 'custom', custom: '#fef3c7', font: 'elegant' });
add('luxury', 'Gold Marble Zipper', 4, ['elegant', 'realistic'], ['marble', '#fafaf9', '#d4af37', '#a8a29e'], [], ['gold', 'classic', 'classic', tape('#d6d3d1')], { color: 'gold', font: 'elegant' });
add('luxury', 'Black Marble Zipper', 4, ['elegant', 'dark'], ['marble', '#0a0a0a', '#d4af37', '#525252'], [], ['gold', 'chunky', 'crown'], { color: 'gold', font: 'elegant' });
add('luxury', 'Rose Gold Glitter Zipper', 4, ['elegant', 'pastel'], ['bokeh', '#7a4636', '#f5c6b3', '#fde2d6'], [['sparkle', 'scatter', '#ffe4d6', '#fff', 26, 0.35, 0.8]], ['rose', 'classic', 'heart'], { color: 'custom', custom: '#ffe4d6', font: 'elegant' });
add('luxury', 'Royal Crown Zipper', 5, ['elegant', 'bold'], ['radial', '#1e1b4b', '#4c1d95', '#d4af37'], [['crown', 'hero', '#d4af37', '#dc2626', 1, 1, 0.5], ['diamond', 'corner', '#e0e7ff', '#fff', 6, 0.5, 0.5]], ['gold', 'crystal', 'crown'], { color: 'gold', font: 'elegant' });
add('luxury', 'Holographic Zipper', 4, ['neon', 'pastel'], ['holo', '#ffffff', '#ffffff', '#ffffff'], [], ['holo', 'crystal', 'gem', tape('#c4b5fd')], { color: 'custom', custom: '#4c1d95' });
add('luxury', 'Jewel Box Zipper', 5, ['elegant', 'bold'], ['radial', '#042f2e', '#0f766e', '#d4af37'], [['diamond', 'scatter', '#10b981', '#d1fae5', 5, 0.6], ['diamond', 'scatter', '#e11d48', '#ffe4e6', 5, 0.6], ['diamond', 'scatter', '#2563eb', '#dbeafe', 5, 0.6]], ['gold', 'crystal', 'gem']);
add('luxury', 'Pink Luxury Zipper', 4, ['elegant', 'pastel'], ['marble', '#fdf2f8', '#f9a8d4', '#d4af37'], [['pearl', 'trail', '#ffffff', '#fdf2f8', 14, 0.4]], ['rose', 'pearl', 'heart', tape('#fbcfe8')], { color: 'custom', custom: '#9d174d', font: 'elegant' });
add('luxury', 'Elegant Fashion Zipper', 4, ['elegant', 'minimal'], ['stripes', '#0a0a0a', '#171717', '#0a0a0a', 0], [['diamond', 'hero', '#f5f5f4', '#ffffff', 1, 0.6]], ['silver', 'minimal', 'drop', tape('#262626', 0.7)], { font: 'elegant' });
add('luxury', 'Emerald Luxe Zipper', 4, ['elegant'], ['radial', '#022c22', '#065f46', '#34d399'], [['diamond', 'pattern', '#10b981', '#d1fae5', 12, 0.4]], ['gold', 'crystal', 'gem'], { color: 'gold', font: 'elegant' });

/* ------------------------------------------------------------------ */
/* L. Gaming & technology                                              */
/* ------------------------------------------------------------------ */
add('gaming', 'Neon Gamer Zipper', 4, ['neon', 'dark'], ['grid', '#0b0016', '#ec4899', '#22d3ee'], [], ['purple', 'neon', 'bolt', tape('#0b0016')], { color: 'custom', custom: '#22d3ee', font: 'mono' });
add('gaming', 'RGB Zipper', 4, ['neon', 'bold'], ['radial', '#030712', '#7c3aed', '#22d3ee'], [['dot', 'scatter', '#22d3ee', '#fff', 12, 1], ['dot', 'scatter', '#f472b6', '#fff', 12, 1], ['dot', 'scatter', '#a3e635', '#fff', 10, 1]], ['holo', 'neon', 'gem'], { font: 'mono' });
add('gaming', 'Cyberpunk Zipper', 5, ['neon', 'dark'], ['grid', '#120024', '#f0abfc', '#facc15'], [['bolt', 'scatter', '#facc15', '#fff', 6, 0.5, 0.8]], ['pink', 'neon', 'bolt'], { color: 'custom', custom: '#facc15', font: 'mono' });
add('gaming', 'Pixel Hearts Zipper', 3, ['retro', 'cute'], ['checker', '#1e1b4b', '#312e81', '#ec4899'], [['pixelHeart', 'pattern', '#f43f5e', '#fecdd3', 12, 0.6]], ['ruby', 'pixel', 'heart'], { font: 'mono' });
add('gaming', 'Retro Arcade Zipper', 4, ['retro', 'neon'], ['grid', '#0c0a1e', '#22d3ee', '#f97316'], [['gamepad', 'hero', '#1e293b', '#f43f5e', 1, 0.8, 0.4]], ['sapphire', 'pixel', 'star'], { font: 'mono' });
add('gaming', 'Gamer Controller Zipper', 3, ['bold'], ['circuit', '#020617', '#8b5cf6', '#22d3ee'], [['gamepad', 'scatter', '#334155', '#22d3ee', 6, 0.9]], ['gunmetal', 'chunky', 'bolt'], { font: 'mono' });
add('gaming', 'Circuit Board Zipper', 4, ['neon', 'dark'], ['circuit', '#022c22', '#10b981', '#a7f3d0'], [], ['emerald', 'pixel', 'bolt'], { color: 'custom', custom: '#34d399', font: 'mono' });
add('gaming', 'Glitch Zipper', 4, ['neon', 'retro'], ['stripes', '#0a0a0a', '#22d3ee', '#f43f5e', 0], [['pixelHeart', 'scatter', '#22d3ee', '#f43f5e', 6, 0.4]], ['black', 'pixel', 'bolt'], { font: 'mono' });
add('gaming', 'Robot Tech Zipper', 4, ['bold', 'neon'], ['circuit', '#0f172a', '#38bdf8', '#f472b6'], [['robot', 'scatter', '#94a3b8', '#22d3ee', 5, 0.9]], ['silver', 'chunky', 'bolt'], { font: 'mono' });
add('gaming', 'Space Gaming Zipper', 5, ['neon', 'dark'], ['galaxy', '#4338ca', '#0891b2', '#be185d'], [['rocket', 'trail', '#e2e8f0', '#f97316', 4, 0.6], ['pixelHeart', 'scatter', '#f472b6', '#fff', 6, 0.35, 0.6]], ['holo', 'neon', 'star'], { font: 'mono' });
add('gaming', 'Electric Zipper', 4, ['neon', 'bold'], ['radial', '#020617', '#1e3a8a', '#facc15'], [['bolt', 'hero', '#facc15', '#fff', 3, 0.9, 1]], ['gold', 'neon', 'bolt']);
add('gaming', 'Sci-Fi Zipper', 5, ['neon', 'dark'], ['grid', '#020617', '#38bdf8', '#a5f3fc'], [['planet', 'corner', '#38bdf8', '#e0f2fe', 2, 0.9, 0.5]], ['silver', 'neon', 'gem', tape('#020617')], { color: 'custom', custom: '#7dd3fc', font: 'mono' });

/* ------------------------------------------------------------------ */
/* M. Cars & transport                                                 */
/* ------------------------------------------------------------------ */
add('cars', 'Supercar Zipper', 4, ['bold', 'realistic'], ['sunset', '#111827', '#dc2626', '#f97316'], [['car', 'hero', '#facc15', '#111827', 1, 1.1]], ['gold', 'chunky', 'bolt']);
add('cars', 'Racing Car Zipper', 4, ['bold'], ['checker', '#0a0a0a', '#fafafa', '#dc2626'], [['car', 'trail', '#2563eb', '#e5e7eb', 4, 0.8]], ['sapphire', 'chunky', 'bolt']);
add('cars', 'Drift Night Zipper', 5, ['neon', 'dark'], ['grid', '#09090b', '#f43f5e', '#22d3ee'], [['car', 'hero', '#f43f5e', '#22d3ee', 1, 1, 0.6]], ['black', 'neon', 'bolt'], { font: 'mono' });
add('cars', 'Superbike Zipper', 4, ['bold', 'dark'], ['radial', '#0a0a0a', '#7f1d1d', '#f97316'], [['motorbike', 'hero', '#dc2626', '#a1a1aa', 1, 1.1]], ['ruby', 'chunky', 'skull']);
add('cars', 'Luxury Car Zipper', 4, ['elegant'], ['marble', '#0a0a0a', '#a8a29e', '#292524'], [['car', 'hero', '#e7e5e4', '#d4af37', 1, 1]], ['gold', 'classic', 'crown'], { color: 'gold', font: 'elegant' });
add('cars', 'Off-Road Zipper', 3, ['nature', 'bold'], ['mountains', '#fed7aa', '#fef3c7', '#78350f'], [['car', 'bottom', '#16a34a', '#1c1917', 2, 1]], ['gunmetal', 'chunky', 'bolt']);
add('cars', 'Airplane Sky Zipper', 3, ['minimal', 'bold'], ['linear', '#0284c7', '#7dd3fc', '#e0f2fe'], [['plane', 'trail', '#f8fafc', '#94a3b8', 3, 0.9], ['cloud', 'scatter', '#ffffff', '#bae6fd', 6, 1]], ['silver', 'classic', 'ring']);
add('cars', 'Spacecraft Zipper', 4, ['dark', 'bold'], ['galaxy', '#1e3a8a', '#312e81', '#0e7490'], [['rocket', 'hero', '#e2e8f0', '#38bdf8', 2, 0.9]], ['silver', 'crystal', 'bolt']);
add('cars', 'Race Track Zipper', 3, ['bold'], ['stripes', '#18181b', '#27272a', '#fafafa', 0], [['flame', 'bottom', '#f97316', '#facc15', 6, 1]], ['ruby', 'chunky', 'bolt']);
add('cars', 'Motorbike Sunset Zipper', 4, ['nature', 'bold'], ['sunset', '#581c87', '#f43f5e', '#fdba74'], [['motorbike', 'bottom', '#0a0a0a', '#f43f5e', 1, 1.4]], ['black', 'classic', 'skull']);

/* ------------------------------------------------------------------ */
/* N. Dark & gothic                                                    */
/* ------------------------------------------------------------------ */
add('dark', 'Skull Zipper', 4, ['dark', 'bold'], ['radial', '#0a0a0a', '#262626', '#7f1d1d'], [['skull', 'hero', '#e7e5e4', '#1c1917', 1, 1]], ['black', 'chunky', 'skull']);
add('dark', 'Skull Pattern Zipper', 3, ['dark'], ['linear', '#0a0a0a', '#171717', '#0a0a0a'], [['skull', 'pattern', '#3f3f46', '#000', 12, 0.6]], ['gunmetal', 'classic', 'skull']);
add('dark', 'Fire Zipper', 4, ['bold', 'dark'], ['fire', '#991b1b', '#f97316', '#facc15'], [['flame', 'bottom', '#f97316', '#fde047', 9, 1.2]], ['ruby', 'chunky', 'bolt']);
add('dark', 'Blue Flame Zipper', 4, ['neon', 'dark'], ['fire', '#1e3a8a', '#38bdf8', '#e0f2fe'], [['flame', 'bottom', '#38bdf8', '#e0f2fe', 9, 1.2, 0.5]], ['sapphire', 'neon', 'bolt']);
add('dark', 'Smoke Zipper', 3, ['dark', 'minimal'], ['watercolor', '#0a0a0a', '#3f3f46', '#52525b'], [['dot', 'float', '#a1a1aa', '#fff', 14, 1.4]], ['silver', 'coil', 'skull']);
add('dark', 'Shadow Bat Zipper', 4, ['dark'], ['night', '#0a0a0a', '#1e1b4b', '#0a0a0a'], [['bat', 'scatter', '#000000', '#ef4444', 10, 0.8], ['moon', 'corner', '#fef3c7', '#d6d3d1', 1, 1.3, 0.6]], ['black', 'classic', 'skull']);
add('dark', 'Gothic Rose Zipper', 5, ['dark', 'elegant'], ['radial', '#0a0a0a', '#18181b', '#7f1d1d'], [['rose', 'cluster', '#450a0a', '#14532d', 7, 1.3], ['skull', 'hero', '#d6d3d1', '#000', 1, 0.6]], ['black', 'crystal', 'skull'], { font: 'elegant', color: 'custom', custom: '#dc2626' });
add('dark', 'Vampire Zipper', 4, ['dark', 'bold'], ['night', '#0a0a0a', '#450a0a', '#0a0a0a'], [['bat', 'trail', '#18181b', '#dc2626', 7, 0.8], ['heart', 'scatter', '#7f1d1d', '#000', 6, 0.4]], ['ruby', 'crystal', 'skull'], { font: 'elegant', color: 'custom', custom: '#ef4444' });
add('dark', 'Red And Black Zipper', 3, ['dark', 'bold'], ['stripes', '#0a0a0a', '#7f1d1d', '#0a0a0a', 45], [['skull', 'corner', '#7f1d1d', '#000', 4, 0.6]], ['ruby', 'crystal', 'skull']);
add('dark', 'Dark Dragon Zipper', 5, ['dark'], ['radial', '#0a0a0a', '#14532d', '#22c55e'], [['dragon', 'hero', '#14532d', '#052e16', 1, 1.1, 0.4]], ['emerald', 'crystal', 'skull']);
add('dark', 'Mystery Zipper', 4, ['dark', 'neon'], ['galaxy', '#4c1d95', '#0a0a0a', '#1e1b4b'], [['sparkle', 'scatter', '#c4b5fd', '#fff', 12, 0.3, 0.8]], ['purple', 'classic', 'gem']);
add('dark', 'Ghost Night Zipper', 3, ['dark', 'cute'], ['night', '#0f172a', '#334155', '#0f172a'], [['ghost', 'float', '#f1f5f9', '#0f172a', 6, 0.8, 0.3]], ['silver', 'classic', 'skull']);

/* ------------------------------------------------------------------ */
/* O. Lifestyle, music & food                                          */
/* ------------------------------------------------------------------ */
add('lifestyle', 'Music Zipper', 3, ['bold', 'neon'], ['radial', '#0b0b0f', '#4c1d95', '#ec4899'], [['note', 'trail', '#f0abfc', '#fff', 9, 0.8, 0.6]], ['purple', 'classic', 'star']);
add('lifestyle', 'Guitar Zipper', 4, ['bold', 'retro'], ['sunset', '#7c2d12', '#ea580c', '#fde68a'], [['guitar', 'hero', '#b45309', '#3f2a14', 1, 1.1], ['note', 'scatter', '#fff7ed', '#fff', 6, 0.5]], ['gold', 'chunky', 'classic']);
add('lifestyle', 'Headphones Zipper', 3, ['bold', 'minimal'], ['linear', '#0f172a', '#1e293b', '#0f172a'], [['headphones', 'hero', '#e2e8f0', '#22d3ee', 1, 1]], ['silver', 'classic', 'ring']);
add('lifestyle', 'Coffee Lover Zipper', 3, ['cute', 'nature'], ['linear', '#fef3c7', '#fde68a', '#d6a35c'], [['coffee', 'pattern', '#ffffff', '#6b3f1f', 10, 0.7]], ['rose', 'classic', 'heart'], { color: 'custom', custom: '#451a03' });
add('lifestyle', 'Pizza Party Zipper', 3, ['bold', 'cute'], ['checker', '#dc2626', '#fafafa', '#fde68a'], [['pizza', 'scatter', '#facc15', '#b91c1c', 8, 0.8]], ['white', 'chunky', 'star']);
add('lifestyle', 'Donut Zipper', 3, ['cute', 'pastel'], ['polka', '#fdf2f8', '#f9a8d4', '#a5f3fc'], [['donut', 'pattern', '#f472b6', '#38bdf8', 10, 0.7]], ['pink', 'pearl', 'heart']);
add('lifestyle', 'Ice Cream Zipper', 3, ['cute', 'pastel'], ['stripes', '#fdf2f8', '#fbcfe8', '#ffffff', 90], [['iceCream', 'scatter', '#a5f3fc', '#f59e0b', 8, 0.9]], ['white', 'pearl', 'heart']);
add('lifestyle', 'Cupcake Zipper', 3, ['cute', 'pastel'], ['polka', '#fef3c7', '#fbcfe8', '#ddd6fe'], [['cupcake', 'scatter', '#f472b6', '#a78bfa', 8, 0.9]], ['pink', 'pearl', 'heart']);
add('lifestyle', 'Photography Zipper', 3, ['minimal'], ['linear', '#18181b', '#27272a', '#09090b'], [['camera', 'hero', '#3f3f46', '#38bdf8', 1, 1]], ['silver', 'classic', 'ring']);
add('lifestyle', 'Book Lover Zipper', 3, ['elegant', 'nature'], ['linear', '#fef3c7', '#fde68a', '#d97706'], [['book', 'scatter', '#92400e', '#fffbeb', 6, 0.9], ['coffee', 'scatter', '#ffffff', '#6b3f1f', 2, 0.6]], ['gold', 'classic', 'drop'], { color: 'custom', custom: '#451a03', font: 'elegant' });
add('lifestyle', 'Travel Zipper', 4, ['nature', 'bold'], ['sunset', '#0ea5e9', '#7dd3fc', '#fde68a'], [['plane', 'trail', '#ffffff', '#0369a1', 2, 0.9], ['palm', 'corner', '#16a34a', '#78350f', 2, 1.6], ['cloud', 'scatter', '#ffffff', '#e0f2fe', 4, 0.9]], ['sapphire', 'classic', 'ring']);
add('lifestyle', 'Dance Party Zipper', 4, ['neon', 'bold'], ['bokeh', '#1e1b4b', '#ec4899', '#22d3ee'], [['note', 'scatter', '#fde68a', '#fff', 10, 0.6, 0.6], ['star', 'scatter', '#f0abfc', '#fff', 8, 0.4, 0.6]], ['holo', 'neon', 'star']);
add('lifestyle', 'Cherry Sweet Zipper', 3, ['cute', 'bold'], ['polka', '#fff1f2', '#fda4af', '#ffffff'], [['cherry', 'scatter', '#dc2626', '#15803d', 10, 0.8]], ['ruby', 'heart', 'heart']);

/* ------------------------------------------------------------------ */
/* P. Seasonal & holidays                                              */
/* ------------------------------------------------------------------ */
add('seasonal', 'Christmas Zipper', 4, ['bold', 'cute'], ['snow', '#7f1d1d', '#b91c1c', '#f8fafc'], [['xmasTree', 'bottom', '#15803d', '#facc15', 3, 1.4], ['snowflake', 'scatter', '#ffffff', '#fff', 14, 0.4]], ['ruby', 'star', 'star'], { color: 'white' });
add('seasonal', 'Candy Cane Zipper', 3, ['cute', 'bold'], ['stripes', '#ffffff', '#fecaca', '#ffffff', 45], [['candy', 'scatter', '#dc2626', '#ffffff', 9, 0.9]], ['ruby', 'classic', 'star']);
add('seasonal', 'Gift Box Zipper', 3, ['bold'], ['polka', '#14532d', '#22c55e', '#fde68a'], [['gift', 'scatter', '#dc2626', '#facc15', 8, 0.8]], ['gold', 'classic', 'star']);
add('seasonal', 'Snowflake Zipper', 3, ['minimal', 'pastel'], ['linear', '#0c4a6e', '#38bdf8', '#e0f2fe'], [['snowflake', 'scatter', '#ffffff', '#fff', 18, 0.6, 0.4]], ['silver', 'crystal', 'star']);
add('seasonal', 'Halloween Zipper', 4, ['dark', 'bold'], ['night', '#1c0a00', '#431407', '#0a0a0a'], [['pumpkin', 'bottom', '#f97316', '#fde047', 3, 1.3], ['bat', 'scatter', '#0a0a0a', '#f97316', 7, 0.6], ['moon', 'corner', '#fde68a', '#f59e0b', 1, 1.2, 0.6]], ['black', 'chunky', 'skull'], { color: 'custom', custom: '#fb923c' });
add('seasonal', 'Spooky Ghost Zipper', 3, ['cute', 'dark'], ['radial', '#1e1b4b', '#4c1d95', '#f97316'], [['ghost', 'scatter', '#f8fafc', '#1e1b4b', 7, 0.8], ['pumpkin', 'corner', '#f97316', '#fde047', 2, 0.8]], ['purple', 'classic', 'skull']);
add('seasonal', 'Valentine’s Day Zipper', 4, ['cute', 'bold'], ['radial', '#881337', '#e11d48', '#fecdd3'], [['heart', 'border', '#ffffff', '#fecdd3', 26, 0.7], ['heart', 'hero', '#fb7185', '#ffffff', 1, 0.9]], ['ruby', 'heart', 'heart']);
add('seasonal', 'New Year Zipper', 4, ['elegant', 'neon'], ['night', '#020617', '#1e1b4b', '#0f172a'], [['sparkle', 'scatter', '#facc15', '#fff', 22, 0.6, 0.8], ['star', 'scatter', '#e2e8f0', '#fff', 10, 0.4, 0.6]], ['gold', 'star', 'star'], { color: 'gold', text: 'Happy New Year' });
add('seasonal', 'Birthday Zipper', 3, ['bold', 'cute'], ['polka', '#fef3c7', '#f472b6', '#38bdf8'], [['balloon', 'float', '#ef4444', '#334155', 8, 0.8], ['cupcake', 'bottom', '#f9a8d4', '#38bdf8', 3, 0.9]], ['holo', 'classic', 'star'], { color: 'custom', custom: '#be185d', text: 'Happy Birthday' });
add('seasonal', 'Easter Zipper', 3, ['pastel', 'cute'], ['meadow', '#e0f2fe', '#fdf4ff', '#a7f3d0'], [['bunny', 'bottom', '#ffffff', '#fbcfe8', 3, 1], ['daisy', 'scatter', '#fde68a', '#f97316', 8, 0.4]], ['pink', 'pearl', 'flower']);
add('seasonal', 'Spring Zipper', 3, ['pastel', 'nature'], ['linear', '#ecfccb', '#fdf2f8', '#fce7f3'], [['sakura', 'scatter', '#f9a8d4', '#be185d', 14, 0.6], ['butterfly', 'scatter', '#a78bfa', '#fde68a', 4, 0.5]], ['rose', 'coil', 'flower']);
add('seasonal', 'Summer Zipper', 3, ['bold', 'nature'], ['sunset', '#0891b2', '#fde68a', '#fb923c'], [['sun', 'corner', '#facc15', '#fb923c', 1, 1.6], ['palm', 'bottom', '#15803d', '#78350f', 3, 1.3]], ['gold', 'classic', 'flower']);
add('seasonal', 'Autumn Zipper', 3, ['nature'], ['linear', '#7c2d12', '#c2410c', '#fbbf24'], [['leaf', 'rain', '#f97316', '#7c2d12', 22, 0.6], ['leaf', 'rain', '#facc15', '#78350f', 12, 0.5]], ['rose', 'classic', 'drop']);
add('seasonal', 'Winter Zipper', 3, ['minimal', 'nature'], ['snow', '#1e3a8a', '#93c5fd', '#f8fafc'], [['snowflake', 'rain', '#ffffff', '#fff', 20, 0.4]], ['white', 'crystal', 'star']);

/* ------------------------------------------------------------------ */
/* Q. Artistic & abstract                                              */
/* ------------------------------------------------------------------ */
add('art', 'Abstract Zipper', 3, ['bold'], ['watercolor', '#0b0b0f', '#8b5cf6', '#f59e0b'], [['wave', 'scatter', '#8b5cf6', '#f59e0b', 5, 1.2]], ['gold', 'classic', 'drop']);
add('art', 'Geometric Zipper', 3, ['bold', 'minimal'], ['checker', '#0f172a', '#1e293b', '#8b5cf6'], [['diamond', 'pattern', '#8b5cf6', '#e9d5ff', 10, 0.5]], ['silver', 'pixel', 'gem']);
add('art', 'Marble Zipper', 3, ['elegant', 'minimal'], ['marble', '#f5f5f4', '#78716c', '#d6d3d1'], [['diamond', 'scatter', '#a8a29e', '#fff', 4, 0.5]], ['black', 'minimal', 'drop', tape('#a8a29e')], { color: 'custom', custom: '#1c1917', font: 'elegant' });
add('art', 'Watercolor Zipper', 3, ['pastel'], ['watercolor', '#fff7ed', '#fbcfe8', '#a5f3fc'], [], ['rose', 'coil', 'drop'], { color: 'custom', custom: '#9d174d' });
add('art', 'Pop Art Zipper', 4, ['retro', 'bold'], ['halftone', '#facc15', '#f97316', '#dc2626'], [['bolt', 'hero', '#ffffff', '#fff', 2, 0.9]], ['black', 'chunky', 'bolt']);
add('art', 'Liquid Gradient Zipper', 3, ['bold'], ['radial', '#1e1b4b', '#db2777', '#22d3ee'], [], ['holo', 'coil', 'drop']);
add('art', 'Color Splash Zipper', 4, ['bold'], ['watercolor', '#ffffff', '#f43f5e', '#3b82f6'], [['dot', 'scatter', '#facc15', '#fff', 10, 1.4]], ['black', 'chunky', 'drop']);
add('art', 'Psychedelic Zipper', 5, ['neon', 'bold'], ['holo', '#7c3aed', '#ffffff', '#ffffff'], [['wave', 'pattern', '#f43f5e', '#facc15', 12, 0.9]], ['holo', 'neon', 'flower']);
add('art', 'Optical Illusion Zipper', 4, ['minimal', 'bold'], ['stripes', '#0a0a0a', '#fafafa', '#0a0a0a', 15], [], ['silver', 'classic', 'ring']);
add('art', 'Graffiti Zipper', 4, ['bold', 'retro'], ['halftone', '#1c1917', '#44403c', '#facc15'], [['star', 'scatter', '#22d3ee', '#fff', 8, 0.6], ['heart', 'scatter', '#f43f5e', '#fff', 6, 0.5], ['bolt', 'scatter', '#a3e635', '#fff', 5, 0.6]], ['gunmetal', 'chunky', 'skull']);
add('art', 'Vintage Art Zipper', 3, ['retro', 'elegant'], ['halftone', '#fef3c7', '#d6a35c', '#78350f'], [['sun', 'hero', '#ea580c', '#fbbf24', 1, 0.9]], ['rose', 'classic', 'classic'], { color: 'custom', custom: '#451a03', font: 'elegant' });
add('art', 'Neon Art Zipper', 4, ['neon', 'dark'], ['radial', '#0a0a0a', '#be185d', '#0891b2'], [['heartOutline', 'scatter', '#f472b6', '#22d3ee', 6, 0.9, 0.8]], ['pink', 'neon', 'heart']);
add('art', '3D Sphere Zipper', 4, ['realistic', 'bold'], ['radial', '#0f172a', '#334155', '#94a3b8'], [['pearl', 'scatter', '#8b5cf6', '#e9d5ff', 9, 1.1]], ['purple', 'classic', 'ring']);

/* ------------------------------------------------------------------ */
/* Themes as premier library designs                                   */
/* ------------------------------------------------------------------ */
const themeItems: LibDesign[] = [];
let tOrder = 1;
for (const t of THEMES) {
  const styles: StyleId[] =
    t.collection === 'love'
      ? ['cute', 'elegant']
      : t.collection === 'luxury'
      ? ['elegant', 'realistic']
      : t.collection === 'neon'
      ? ['neon', 'bold']
      : t.collection === 'cute'
      ? ['cute', 'pastel']
      : t.collection === 'dark'
      ? ['dark', 'bold']
      : ['minimal', 'realistic'];
  themeItems.push({
    id: `theme-${t.id}`,
    name: t.name,
    cat: 'trending',
    level: 2,
    styles,
    colors: colorFamilies(['#0b0b0f'], t.design.zipper.metal, [], ['linear', '#0b0b0f', '#0b0b0f', '#0b0b0f']),
    design: { ...t.design, designId: `theme-${t.id}` },
    order: tOrder++,
  });
}

const ALL_DESIGNS: LibDesign[] = [...themeItems, ...LIB];

/* remove helper-only placeholders (e.g. layers with count 0) */
for (const d of ALL_DESIGNS) if (d.design.art) d.design.art.layers = d.design.art.layers.filter((l) => l.count > 0 && MOTIF_OK(l.motif));
function MOTIF_OK(m: string) {
  return m !== 'bone';
}

export const LIBRARY: LibDesign[] = ALL_DESIGNS;
export const getLibDesign = (id: string | null | undefined) => ALL_DESIGNS.find((d) => d.id === id);
export const byCategory = (c: CatId) => ALL_DESIGNS.filter((d) => d.cat === c);
