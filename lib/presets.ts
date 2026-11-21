import { DEFAULT_ADJUST, DEFAULT_CLOCK, DEFAULT_DESIGN, DEFAULT_LAYERS, type Design } from './design';
import { DEFAULT_ZIPPER } from './zipper';

export interface Device {
  id: string;
  name: string;
  group: 'Android' | 'iPhone' | 'Tablet';
  w: number;
  h: number;
}

/** Common native screen resolutions (portrait). */
export const DEVICES: Device[] = [
  { id: 'android-fhd', name: 'Android FHD+ (20:9)', group: 'Android', w: 1080, h: 2400 },
  { id: 'android-qhd', name: 'Android QHD+ (20:9)', group: 'Android', w: 1440, h: 3200 },
  { id: 'galaxy-ultra', name: 'Galaxy S Ultra', group: 'Android', w: 1440, h: 3120 },
  { id: 'pixel-pro', name: 'Pixel Pro', group: 'Android', w: 1344, h: 2992 },
  { id: 'iphone-std', name: 'iPhone 15 / 16', group: 'iPhone', w: 1179, h: 2556 },
  { id: 'iphone-max', name: 'iPhone Pro Max', group: 'iPhone', w: 1320, h: 2868 },
  { id: 'iphone-se', name: 'iPhone SE', group: 'iPhone', w: 750, h: 1334 },
  { id: 'ipad', name: 'iPad (10th gen)', group: 'Tablet', w: 1640, h: 2360 },
  { id: 'android-tab', name: 'Android tablet', group: 'Tablet', w: 1600, h: 2560 },
];

export const getDevice = (id: string | null | undefined) => DEVICES.find((d) => d.id === id) ?? DEVICES[0];

export type Collection = 'love' | 'luxury' | 'neon' | 'cute' | 'dark' | 'steel';
export const COLLECTIONS: Record<Collection, { name: string; blurb: string }> = {
  love: { name: 'Love & Romance', blurb: 'Hearts, roses, sweet charms and romantic glows.' },
  luxury: { name: 'Luxury & Diamond', blurb: 'Gilded gold, diamond crystals, rose marble and quilted leather.' },
  neon: { name: 'Cyber & Neon', blurb: 'Synthwave grids, electric aurora and luminous tubes.' },
  cute: { name: 'Kawaii & Aesthetic', blurb: 'Pastel ribbons, butterflies, teddy bears and starlight.' },
  dark: { name: 'Gothic & Dark', blurb: 'Black nickel, crimson embers, skulls and velvet.' },
  steel: { name: 'Steel & Minimal', blurb: 'Silver, carbon weave and precision brushed metal.' },
};

export interface Theme {
  id: string;
  name: string;
  tagline: string;
  collection: Collection;
  design: Design;
}

const mk = (p: {
  bg: string;
  zipper?: Partial<Design['zipper']>;
  clock?: Partial<Design['clock']>;
  adj?: Partial<Design['adj']>;
}): Design => ({
  bg: p.bg,
  adj: { ...DEFAULT_ADJUST, ...p.adj },
  zipper: { ...DEFAULT_ZIPPER, ...p.zipper },
  clock: { ...DEFAULT_CLOCK, ...p.clock },
  layers: DEFAULT_LAYERS,
});

export const THEMES: Theme[] = [
  // 47 Exclusive Wallpaper Themes (From Theme Gallery)
  // =====================================================================
  {
    id: 'cute-kitty-hat',
    collection: 'cute',
    name: 'Cute Kitty Hat',
    tagline: 'Pink pearl zipper with cat paw puller on adorable beanie kitty',
    design: mk({
      bg: 'bg-cute-kitty',
      zipper: { metal: 'pink', teeth: 'pearl', puller: 'paw', size: 1.15, tapeColor: '#4A1530' },
      clock: { color: 'white', font: 'modern', y: 0.18, align: 'left' },
    }),
  },
  {
    id: 'aesthetic-fawn',
    collection: 'cute',
    name: 'Aesthetic Fawn',
    tagline: 'Rose gold floral teeth with lucky clover charm in magical woods',
    design: mk({
      bg: 'bg-aesthetic-fawn',
      zipper: { metal: 'rose', teeth: 'flower', puller: 'clover', size: 1.1 },
      clock: { color: 'custom', custom: '#FFE6DA', font: 'elegant', y: 0.2, align: 'center' },
    }),
  },
  {
    id: 'ai-fantasy-boy',
    collection: 'neon',
    name: 'AI Fantasy Hero',
    tagline: 'Silver minimal zipper with diamond prism on anime fantasy warrior',
    design: mk({
      bg: 'bg-ai-fantasy-boy',
      zipper: { metal: 'silver', teeth: 'minimal', puller: 'diamond', size: 1.15 },
      clock: { color: 'silver', font: 'thin', y: 0.18, align: 'left' },
    }),
  },
  {
    id: 'black-purple-rose',
    collection: 'luxury',
    name: 'Royal Black Rose',
    tagline: 'Gilded diamond teeth with luxury jewel pendant on black & purple roses',
    design: mk({
      bg: 'bg-black-rose',
      zipper: { metal: 'gold', teeth: 'diamond', puller: 'diamond', size: 1.25, gloss: 1.3, tapeColor: '#1A0826' },
      clock: { color: 'gold', font: 'elegant', y: 0.2, align: 'left' },
    }),
  },
  {
    id: 'blue-fantasy-portal',
    collection: 'neon',
    name: 'Blue Fantasy Dream',
    tagline: 'Sapphire crystal zipper with faceted gemstone on deep mystic blue',
    design: mk({
      bg: 'bg-blue-fantasy',
      zipper: { metal: 'sapphire', teeth: 'crystal', puller: 'gem', size: 1.15 },
      clock: { color: 'white', font: 'modern', y: 0.2, align: 'right' },
    }),
  },
  {
    id: 'bone-and-zip',
    collection: 'dark',
    name: 'Bone & Skull Zip',
    tagline: 'Black nickel wave teeth with gothic skull on dark bone texture',
    design: mk({
      bg: 'bg-bone-and-zip',
      zipper: { metal: 'black', teeth: 'wave', puller: 'skull', size: 1.25, tapeColor: '#0E0E14' },
      clock: { color: 'white', font: 'mono', y: 0.2, align: 'center' },
    }),
  },
  {
    id: 'candy-wonderland',
    collection: 'cute',
    name: 'Candy Wonderland',
    tagline: 'Holographic bubble drop zipper with sweet teddy charm on gummy sweets',
    design: mk({
      bg: 'bg-candy-wonderland',
      zipper: { metal: 'holo', teeth: 'bubble', puller: 'teddy', size: 1.2 },
      clock: { color: 'white', font: 'bold', y: 0.18, align: 'center' },
    }),
  },
  {
    id: 'cherry-blossom-sakura',
    collection: 'cute',
    name: 'Cherry Blossom Sakura',
    tagline: 'Rose gold floral petal teeth with butterfly charm on Japanese sakura',
    design: mk({
      bg: 'bg-cherry-blossom',
      zipper: { metal: 'rose', teeth: 'flower', puller: 'butterfly', size: 1.15 },
      clock: { color: 'white', font: 'elegant', y: 0.2, align: 'left' },
    }),
  },
  {
    id: 'cosmic-portal-abyss',
    collection: 'neon',
    name: 'Cosmic Portal Abyss',
    tagline: 'Electric purple star teeth with crescent moon charm across stardust abyss',
    design: mk({
      bg: 'bg-cosmic-portal',
      zipper: { metal: 'purple', teeth: 'star', puller: 'moon', size: 1.15 },
      clock: { color: 'white', font: 'thin', y: 0.18, align: 'center' },
    }),
  },
  {
    id: 'crimson-storm-rider',
    collection: 'dark',
    name: 'Crimson Storm Rider',
    tagline: 'Ruby sawtooth wave zipper with lightning bolt on crimson rider',
    design: mk({
      bg: 'bg-crimson-storm',
      zipper: { metal: 'ruby', teeth: 'wave', puller: 'bolt', size: 1.2, tapeColor: '#200508' },
      clock: { color: 'custom', custom: '#FFD3D3', font: 'bold', y: 0.2, align: 'left' },
    }),
  },
  {
    id: 'crystal-butterfly-cyan',
    collection: 'neon',
    name: 'Crystal Butterfly Cyan',
    tagline: 'Holographic crystal teeth with butterfly pendant on glowing cyan',
    design: mk({
      bg: 'bg-crystal-butterfly-blue',
      zipper: { metal: 'holo', teeth: 'crystal', puller: 'butterfly', size: 1.2 },
      clock: { color: 'white', font: 'thin', y: 0.2, align: 'left' },
    }),
  },
  {
    id: 'crystal-butterfly-luxury',
    collection: 'luxury',
    name: 'Crystal Butterfly Luxury',
    tagline: 'Silver diamond gems with butterfly charm on dark satin velvet',
    design: mk({
      bg: 'bg-crystal-butterfly-luxury',
      zipper: { metal: 'silver', teeth: 'diamond', puller: 'butterfly', size: 1.15 },
      clock: { color: 'silver', font: 'elegant', y: 0.18, align: 'center' },
    }),
  },
  {
    id: 'crystal-dimension-gem',
    collection: 'luxury',
    name: 'Crystal Dimension',
    tagline: 'Faceted diamond teeth with brilliant solitaire diamond pendant',
    design: mk({
      bg: 'bg-crystal-dimension',
      zipper: { metal: 'silver', teeth: 'diamond', puller: 'diamond', size: 1.2 },
      clock: { color: 'silver', font: 'modern', y: 0.2, align: 'left' },
    }),
  },
  {
    id: 'cute-animals-gathering',
    collection: 'cute',
    name: 'Cute Animals Gathering',
    tagline: 'Gold four-leaf clover teeth with paw charm on woodland animals',
    design: mk({
      bg: 'bg-cute-animals-gathering',
      zipper: { metal: 'gold', teeth: 'clover', puller: 'paw', size: 1.1 },
      clock: { color: 'gold', font: 'modern', y: 0.2, align: 'center' },
    }),
  },
  {
    id: 'cute-baby-animal',
    collection: 'cute',
    name: 'Cute Baby Animal',
    tagline: 'Baby pink heart teeth with paw puller on sweet fluffy baby pet',
    design: mk({
      bg: 'bg-cute-baby-animal',
      zipper: { metal: 'pink', teeth: 'heart', puller: 'paw', size: 1.15 },
      clock: { color: 'white', font: 'modern', y: 0.18, align: 'right' },
    }),
  },
  {
    id: 'cute-animal-duo',
    collection: 'cute',
    name: 'Cute Fluffy Companion',
    tagline: 'Pearl white bead teeth with teddy bear head on fluffy duo',
    design: mk({
      bg: 'bg-cute-animal-duo',
      zipper: { metal: 'white', teeth: 'pearl', puller: 'teddy', size: 1.15 },
      clock: { color: 'white', font: 'elegant', y: 0.2, align: 'center' },
    }),
  },
  {
    id: 'dark-king-royalty',
    collection: 'dark',
    name: 'Dark King Royalty',
    tagline: 'Black nickel chunky teeth with golden royal crown on shadow king',
    design: mk({
      bg: 'bg-dark-king',
      zipper: { metal: 'black', teeth: 'chunky', puller: 'crown', size: 1.25 },
      clock: { color: 'gold', font: 'bold', y: 0.18, align: 'center' },
    }),
  },
  {
    id: 'dark-romance-xoxo',
    collection: 'love',
    name: 'Dark Romance XOXO',
    tagline: 'Ruby interlocking heart teeth with heart padlock on dark romantic art',
    design: mk({
      bg: 'bg-dark-romance',
      zipper: { metal: 'ruby', teeth: 'heart', puller: 'heartLock', size: 1.2 },
      clock: { color: 'white', font: 'elegant', y: 0.2, align: 'left' },
    }),
  },
  {
    id: 'dream-unicorn-pastel',
    collection: 'cute',
    name: 'Dream Unicorn Pastel',
    tagline: 'Holographic star teeth with crescent moon charm on dream unicorn',
    design: mk({
      bg: 'bg-dream-unicorn',
      zipper: { metal: 'holo', teeth: 'star', puller: 'moon', size: 1.15 },
      clock: { color: 'white', font: 'thin', y: 0.18, align: 'left' },
    }),
  },
  {
    id: 'electric-pulse-neon',
    collection: 'neon',
    name: 'Electric Pulse Energy',
    tagline: 'Electric violet neon tube zipper with lightning bolt on energy vortex',
    design: mk({
      bg: 'bg-electric-pulse',
      zipper: { metal: 'purple', teeth: 'neon', puller: 'bolt', size: 1.25 },
      clock: { color: 'white', font: 'mono', y: 0.2, align: 'center' },
    }),
  },
  {
    id: 'fantasy-nature-sunset',
    collection: 'steel',
    name: 'Fantasy Nature Blue Jay',
    tagline: 'Gold floral teeth with lucky clover puller on magical twilight landscape',
    design: mk({
      bg: 'bg-fantasy-nature-sunset',
      zipper: { metal: 'gold', teeth: 'flower', puller: 'clover', size: 1.1 },
      clock: { color: 'gold', font: 'elegant', y: 0.18, align: 'left' },
    }),
  },
  {
    id: 'fire-wolf-flame',
    collection: 'dark',
    name: 'Fire Wolf Flame',
    tagline: 'Ruby sawtooth wave zipper with lightning bolt on blazing flame wolf',
    design: mk({
      bg: 'bg-fire-wolf',
      zipper: { metal: 'ruby', teeth: 'wave', puller: 'bolt', size: 1.25, tapeColor: '#280602' },
      clock: { color: 'gold', font: 'bold', y: 0.2, align: 'center' },
    }),
  },
  {
    id: 'galaxy-cookie-dreams',
    collection: 'cute',
    name: 'Galaxy Cookie Dreams',
    tagline: 'Gold bubble drop teeth with star charm on cosmic galaxy cookies',
    design: mk({
      bg: 'bg-galaxy-cookie-dreams',
      zipper: { metal: 'gold', teeth: 'bubble', puller: 'star', size: 1.15 },
      clock: { color: 'white', font: 'modern', y: 0.2, align: 'center' },
    }),
  },
  {
    id: 'galaxy-portal-starlight',
    collection: 'neon',
    name: 'Galaxy Portal Starlight',
    tagline: 'Sapphire star teeth with diamond charm on swirling stellar portal',
    design: mk({
      bg: 'bg-galaxy-portal',
      zipper: { metal: 'sapphire', teeth: 'star', puller: 'diamond', size: 1.15 },
      clock: { color: 'white', font: 'thin', y: 0.18, align: 'left' },
    }),
  },
  {
    id: 'gaming-cyber-setup',
    collection: 'neon',
    name: 'Cyber Gaming Station',
    tagline: 'Gunmetal pixel stepped teeth with lightning bolt on RGB battle station',
    design: mk({
      bg: 'bg-gaming-setup',
      zipper: { metal: 'gunmetal', teeth: 'pixel', puller: 'bolt', size: 1.2 },
      clock: { color: 'white', font: 'mono', y: 0.2, align: 'right' },
    }),
  },
  {
    id: 'ice-tiger-frost',
    collection: 'steel',
    name: 'Frost Ice Tiger',
    tagline: 'Silver crystal teeth with animal paw puller on mystic frost tiger',
    design: mk({
      bg: 'bg-ice-tiger',
      zipper: { metal: 'silver', teeth: 'crystal', puller: 'paw', size: 1.2 },
      clock: { color: 'silver', font: 'bold', y: 0.2, align: 'center' },
    }),
  },
  {
    id: 'ice-wolf-blizzard',
    collection: 'steel',
    name: 'Blizzard Ice Wolf',
    tagline: 'Fine silver coil zipper with crescent moon on arctic snow wolf',
    design: mk({
      bg: 'bg-ice-wolf',
      zipper: { metal: 'silver', teeth: 'coil', puller: 'moon', size: 1.15 },
      clock: { color: 'silver', font: 'thin', y: 0.18, align: 'left' },
    }),
  },
  {
    id: 'liquid-chrome-mercury',
    collection: 'steel',
    name: 'Liquid Chrome Mercury',
    tagline: 'Silver Cuban chain teeth with teardrop puller on liquid chrome mirror',
    design: mk({
      bg: 'bg-liquid-chrome',
      zipper: { metal: 'silver', teeth: 'chain', puller: 'drop', size: 1.2 },
      clock: { color: 'silver', font: 'modern', y: 0.2, align: 'center' },
    }),
  },
  {
    id: 'luxury-diamond-pave',
    collection: 'luxury',
    name: 'Luxury Diamond Solitaire',
    tagline: 'Diamond gem teeth with brilliant diamond pendant on platinum velvet',
    design: mk({
      bg: 'bg-luxury-diamond',
      zipper: { metal: 'silver', teeth: 'diamond', puller: 'diamond', size: 1.25, gloss: 1.3 },
      clock: { color: 'silver', font: 'elegant', y: 0.18, align: 'center' },
    }),
  },
  {
    id: 'moonlight-night-water',
    collection: 'neon',
    name: 'Moonlight Night Waters',
    tagline: 'Pearl white bead teeth with crescent moon charm on serene night sea',
    design: mk({
      bg: 'bg-moonlight-water',
      zipper: { metal: 'white', teeth: 'pearl', puller: 'moon', size: 1.15 },
      clock: { color: 'white', font: 'thin', y: 0.2, align: 'left' },
    }),
  },
  {
    id: 'neon-energy-vortex',
    collection: 'neon',
    name: 'Neon Energy Vortex',
    tagline: 'Luminous neon tube zipper with lightning bolt on laser conduit',
    design: mk({
      bg: 'bg-neon-energy',
      zipper: { metal: 'holo', teeth: 'neon', puller: 'bolt', size: 1.25 },
      clock: { color: 'white', font: 'mono', y: 0.2, align: 'center' },
    }),
  },
  {
    id: 'neon-racing-highway',
    collection: 'steel',
    name: 'Neon Highway Racing',
    tagline: 'Chunky gunmetal zipper with ring puller on midnight supercar speedway',
    design: mk({
      bg: 'bg-neon-racing',
      zipper: { metal: 'gunmetal', teeth: 'chunky', puller: 'ring', size: 1.2 },
      clock: { color: 'white', font: 'bold', y: 0.18, align: 'right' },
    }),
  },
  {
    id: 'panther-purple-eyes',
    collection: 'dark',
    name: 'Black Panther Purple Eyes',
    tagline: 'Black nickel chunky teeth with violet gem on midnight predator',
    design: mk({
      bg: 'bg-panther-purple-eyes',
      zipper: { metal: 'black', teeth: 'chunky', puller: 'gem', size: 1.2 },
      clock: { color: 'purple', font: 'bold', y: 0.2, align: 'center' },
    }),
  },
  {
    id: 'pink-kitty-kawaii',
    collection: 'cute',
    name: 'Pink Kitty Kawaii',
    tagline: 'Cute ribbon bow teeth with animal paw charm on sweet pink kitten',
    design: mk({
      bg: 'bg-pink-kitty',
      zipper: { metal: 'pink', teeth: 'bow', puller: 'paw', size: 1.15 },
      clock: { color: 'white', font: 'modern', y: 0.18, align: 'left' },
    }),
  },
  {
    id: 'pink-moonlight-sakura',
    collection: 'cute',
    name: 'Pink Moonlight Sakura',
    tagline: 'Rose gold floral teeth with butterfly charm on illuminated sakura',
    design: mk({
      bg: 'bg-pink-moonlight-cherry',
      zipper: { metal: 'rose', teeth: 'flower', puller: 'butterfly', size: 1.15 },
      clock: { color: 'white', font: 'elegant', y: 0.2, align: 'center' },
    }),
  },
  {
    id: 'purple-butterfly-starlight',
    collection: 'cute',
    name: 'Purple Butterfly Starlight',
    tagline: 'Purple crystal teeth with butterfly charm on sparkling night aura',
    design: mk({
      bg: 'bg-purple-butterfly',
      zipper: { metal: 'purple', teeth: 'crystal', puller: 'butterfly', size: 1.2 },
      clock: { color: 'purple', font: 'thin', y: 0.18, align: 'center' },
    }),
  },
  {
    id: 'royal-gold-crown-gilded',
    collection: 'luxury',
    name: 'Imperial Gold Crown',
    tagline: 'Gold Cuban chain teeth with royal crown pendant on gilded damask',
    design: mk({
      bg: 'bg-royal-gold-crown',
      zipper: { metal: 'gold', teeth: 'chain', puller: 'crown', size: 1.25, gloss: 1.2 },
      clock: { color: 'gold', font: 'elegant', y: 0.2, align: 'center' },
    }),
  },
  {
    id: 'royal-queen-emerald',
    collection: 'luxury',
    name: 'Royal Queen Emerald',
    tagline: 'Emerald diamond teeth with royal crown on imperial velvet',
    design: mk({
      bg: 'bg-royal-queen',
      zipper: { metal: 'emerald', teeth: 'diamond', puller: 'crown', size: 1.2 },
      clock: { color: 'gold', font: 'elegant', y: 0.2, align: 'left' },
    }),
  },
  {
    id: 'seam-of-the-dead',
    collection: 'dark',
    name: 'Seam of the Dead',
    tagline: 'Black nickel wave teeth with gothic cross on dark fantasy underworld',
    design: mk({
      bg: 'bg-seam-of-the-dead',
      zipper: { metal: 'black', teeth: 'wave', puller: 'cross', size: 1.25 },
      clock: { color: 'white', font: 'mono', y: 0.2, align: 'center' },
    }),
  },
  {
    id: 'seam-of-the-wild',
    collection: 'steel',
    name: 'Seam of the Wild',
    tagline: 'Gunmetal chunky teeth with classic tab on African wildlife savanna',
    design: mk({
      bg: 'bg-seam-of-the-wild',
      zipper: { metal: 'gunmetal', teeth: 'chunky', puller: 'classic', size: 1.15 },
      clock: { color: 'gold', font: 'bold', y: 0.18, align: 'left' },
    }),
  },
  {
    id: 'split-fawn-fairytale',
    collection: 'cute',
    name: 'Split Fawn Fairytale',
    tagline: 'Rose gold four-leaf clover teeth with flower charm on fantasy deer',
    design: mk({
      bg: 'bg-split-fawn',
      zipper: { metal: 'rose', teeth: 'clover', puller: 'flower', size: 1.1 },
      clock: { color: 'white', font: 'thin', y: 0.2, align: 'center' },
    }),
  },
  {
    id: 'storm-rider-thunder',
    collection: 'steel',
    name: 'Thunder Storm Rider',
    tagline: 'Silver sawtooth wave zipper with lightning bolt on storm rider',
    design: mk({
      bg: 'bg-storm-rider',
      zipper: { metal: 'silver', teeth: 'wave', puller: 'bolt', size: 1.2 },
      clock: { color: 'silver', font: 'bold', y: 0.2, align: 'right' },
    }),
  },
  {
    id: 'supercar-gold-velocity',
    collection: 'luxury',
    name: 'Gold Supercar Track',
    tagline: 'Gold Cuban chain zipper with designer padlock on golden hypercar',
    design: mk({
      bg: 'bg-supercar-gold',
      zipper: { metal: 'gold', teeth: 'chain', puller: 'padlock', size: 1.2 },
      clock: { color: 'gold', font: 'bold', y: 0.18, align: 'center' },
    }),
  },
  {
    id: 'supercar-red-racing',
    collection: 'steel',
    name: 'Red Supercar Velocity',
    tagline: 'Ruby red chunky teeth with lightning bolt on high-speed track',
    design: mk({
      bg: 'bg-supercar-red',
      zipper: { metal: 'ruby', teeth: 'chunky', puller: 'bolt', size: 1.2 },
      clock: { color: 'white', font: 'bold', y: 0.2, align: 'left' },
    }),
  },
  {
    id: 'teddy-bear-warm',
    collection: 'cute',
    name: 'Warm Teddy Bear Plush',
    tagline: 'Gold bubble drop teeth with teddy bear puller on warm plush bear',
    design: mk({
      bg: 'bg-teddy-bear',
      zipper: { metal: 'gold', teeth: 'bubble', puller: 'teddy', size: 1.2 },
      clock: { color: 'gold', font: 'modern', y: 0.2, align: 'center' },
    }),
  },
  {
    id: 'pizza-surprise-delicious',
    collection: 'cute',
    name: 'Ultimate Pizza Surprise',
    tagline: 'Gold chunky zipper with star charm on melting cheesy pizza',
    design: mk({
      bg: 'bg-pizza-surprise',
      zipper: { metal: 'gold', teeth: 'chunky', puller: 'star', size: 1.2 },
      clock: { color: 'white', font: 'bold', y: 0.18, align: 'center' },
    }),
  },
  {
    id: 'unzipped-wild-safari',
    collection: 'steel',
    name: 'Unzipped Wild Safari',
    tagline: 'Gold Cuban chain teeth with animal paw puller on African savanna',
    design: mk({
      bg: 'bg-unzipped-wild',
      zipper: { metal: 'gold', teeth: 'chain', puller: 'paw', size: 1.2 },
      clock: { color: 'gold', font: 'bold', y: 0.2, align: 'left' },
    }),
  },
  // --- Love & Romance ---
  {
    id: 'sweet-heart',
    collection: 'love',
    name: 'Sweet Heart Lock',
    tagline: 'Ruby heart teeth & heart padlock on glowing hearts',
    design: mk({
      bg: 'romantic-hearts',
      zipper: { metal: 'ruby', teeth: 'heart', puller: 'heartLock', size: 1.15 },
      clock: { color: 'white', font: 'elegant' },
    }),
  },
  {
    id: 'rose-dust',
    collection: 'love',
    name: 'Rose Dust',
    tagline: 'Rose gold zipper over gold stardust',
    design: mk({
      bg: 'gold-dust',
      zipper: { metal: 'rose', teeth: 'coil', puller: 'drop', size: 1.05 },
      clock: { font: 'elegant', color: 'white' },
    }),
  },

  // --- Luxury & Diamond ---
  {
    id: 'royal-gold',
    collection: 'luxury',
    name: 'Royal Gold',
    tagline: 'Gold teeth on midnight, gilded crown',
    design: mk({
      bg: 'midnight',
      zipper: { metal: 'gold', teeth: 'classic', puller: 'crown', size: 1.1 },
      clock: { color: 'gold', font: 'elegant' },
    }),
  },
  {
    id: 'diamond-solitaire',
    collection: 'luxury',
    name: 'Diamond Solitaire',
    tagline: 'Faceted diamond teeth & brilliant diamond pendant',
    design: mk({
      bg: 'diamond-luxury',
      zipper: { metal: 'silver', teeth: 'diamond', puller: 'diamond', size: 1.15, gloss: 1.25 },
      clock: { color: 'silver', font: 'modern' },
    }),
  },
  {
    id: 'rose-marble',
    collection: 'luxury',
    name: 'Rose Gold Marble',
    tagline: 'Rose gold chain teeth with designer padlock',
    design: mk({
      bg: 'rose-marble',
      zipper: { metal: 'rose', teeth: 'chain', puller: 'padlock', size: 1.1 },
      clock: { color: 'custom', custom: '#CB8A6E', font: 'thin' },
    }),
  },
  {
    id: 'quilted-couture',
    collection: 'luxury',
    name: 'Quilted Couture',
    tagline: 'Cuban chain with vintage key on quilted leather',
    design: mk({
      bg: 'quilted-leather',
      zipper: { metal: 'gold', teeth: 'chain', puller: 'key', size: 1.18, tapeColor: '#16161E' },
      clock: { color: 'gold', font: 'bold' },
    }),
  },
  {
    id: 'imperial-emerald',
    collection: 'luxury',
    name: 'Imperial Emerald',
    tagline: 'Emerald clover teeth & lucky clover pendant',
    design: mk({
      bg: 'emerald-abyss',
      zipper: { metal: 'emerald', teeth: 'clover', puller: 'clover', size: 1.1 },
      clock: { color: 'gold', font: 'elegant' },
    }),
  },
  {
    id: 'silk-gold',
    collection: 'luxury',
    name: 'Silk & Gold',
    tagline: 'Liquid gold silk with droplet bubble teeth',
    design: mk({
      bg: 'gold-silk',
      zipper: { metal: 'gold', teeth: 'bubble', puller: 'gem', size: 1.05 },
      clock: { color: 'gold', font: 'thin' },
    }),
  },

  // --- Cyber & Neon ---
  {
    id: 'cyber-synthwave',
    collection: 'neon',
    name: 'Cyber Synthwave',
    tagline: 'Holographic neon tube with lightning bolt over neon grid',
    design: mk({
      bg: 'cyber-grid',
      zipper: { metal: 'holo', teeth: 'neon', puller: 'bolt', size: 1.2 },
      clock: { color: 'white', font: 'mono' },
    }),
  },
  {
    id: 'neon-violet',
    collection: 'neon',
    name: 'Electric Aurora',
    tagline: 'Purple anodised zipper over glowing aurora',
    design: mk({
      bg: 'aurora',
      zipper: { metal: 'purple', teeth: 'neon', puller: 'drop', tapeColor: '#0B0B0F' },
      clock: { font: 'thin', color: 'purple' },
    }),
  },
  {
    id: 'cosmic-nebula',
    collection: 'neon',
    name: 'Cosmic Nebula',
    tagline: 'Star teeth with crescent moon charm across stardust',
    design: mk({
      bg: 'galaxy-nebula',
      zipper: { metal: 'sapphire', teeth: 'star', puller: 'moon', size: 1.15 },
      clock: { color: 'white', font: 'modern' },
    }),
  },

  // --- Kawaii & Aesthetic ---
  {
    id: 'coquette-bow',
    collection: 'cute',
    name: 'Pastel Coquette',
    tagline: 'Baby pink ribbon bow teeth & bow charm',
    design: mk({
      bg: 'coquette-pink',
      zipper: { metal: 'pink', teeth: 'bow', puller: 'bow', size: 1.15 },
      clock: { color: 'white', font: 'elegant' },
    }),
  },
  {
    id: 'butterfly-dream',
    collection: 'cute',
    name: 'Butterfly Twilight',
    tagline: 'Floral blossom teeth & butterfly charm on sunset sky',
    design: mk({
      bg: 'anime-sunset',
      zipper: { metal: 'holo', teeth: 'flower', puller: 'butterfly', size: 1.15 },
      clock: { color: 'white', font: 'thin' },
    }),
  },
  {
    id: 'kawaii-teddy',
    collection: 'cute',
    name: 'Kawaii Teddy',
    tagline: 'Pearl bead teeth with cute teddy bear head',
    design: mk({
      bg: 'coquette-pink',
      zipper: { metal: 'white', teeth: 'pearl', puller: 'teddy', size: 1.1 },
      clock: { color: 'custom', custom: '#B8577F', font: 'modern' },
    }),
  },

  // --- Dark & Gothic ---
  {
    id: 'gothic-crimson',
    collection: 'dark',
    name: 'Crimson Ember',
    tagline: 'Sawtooth wave teeth with gothic skull on embers',
    design: mk({
      bg: 'gothic-crimson',
      zipper: { metal: 'ruby', teeth: 'wave', puller: 'skull', size: 1.25, tapeColor: '#1A0508' },
      clock: { color: 'custom', custom: '#F06A6A', font: 'bold' },
    }),
  },
  {
    id: 'stealth-cross',
    collection: 'dark',
    name: 'Gothic Obsidian',
    tagline: 'Black nickel teeth with gothic cross on black velvet',
    design: mk({
      bg: 'velvet',
      zipper: { metal: 'black', pos: 0.5, teeth: 'chunky', puller: 'cross', size: 1.2 },
      clock: { font: 'mono', color: 'white', y: 0.2, align: 'center' },
    }),
  },

  // --- Steel & Minimal ---
  {
    id: 'carbon-steel',
    collection: 'steel',
    name: 'Carbon Steel',
    tagline: 'Chunky silver zipper over carbon weave',
    design: mk({
      bg: 'carbon',
      zipper: { metal: 'silver', teeth: 'chunky', puller: 'ring', size: 1.15 },
      clock: { color: 'silver', font: 'bold' },
    }),
  },
  {
    id: 'brushed-titanium',
    collection: 'steel',
    name: 'Brushed Titanium',
    tagline: 'Gunmetal coil zipper on brushed steel',
    design: mk({
      bg: 'brushed',
      zipper: { metal: 'gunmetal', teeth: 'coil', puller: 'classic', size: 1.1 },
      clock: { font: 'bold', color: 'silver' },
    }),
  },
  {
    id: 'gunmetal-wave',
    collection: 'steel',
    name: 'Silver Wave',
    tagline: 'Horizontal silver zipper over metallic wave',
    design: mk({
      bg: 'silver-wave',
      zipper: { metal: 'silver', orientation: 'horizontal', pos: 0.62, rest: 0.08, teeth: 'classic', puller: 'drop', size: 1.1 },
      clock: { y: 0.24, align: 'center', color: 'silver' },
    }),
  },

  // =====================================================================
];

export const getTheme = (id: string | null | undefined) => THEMES.find((t) => t.id === id);

export { DEFAULT_DESIGN };
