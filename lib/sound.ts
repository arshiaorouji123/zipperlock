/**
 * Synthesised zipper sound (Web Audio, no audio files).
 * Filtered noise is chopped by a square LFO whose rate follows drag speed,
 * which reads as teeth passing through the slider.
 */
export type SoundStyle = 'metal' | 'coil' | 'chunky';

export const SOUND_STYLES: Record<SoundStyle, { name: string; freq: number; q: number; teeth: number; level: number }> = {
  metal: { name: 'Metal zipper', freq: 3200, q: 1.1, teeth: 70, level: 0.55 },
  coil: { name: 'Soft coil', freq: 1900, q: 0.7, teeth: 110, level: 0.4 },
  chunky: { name: 'Chunky plastic', freq: 950, q: 1.4, teeth: 45, level: 0.7 },
};

export interface ZipSound {
  /** speed in "progress units per second" (0 = silent) */
  update: (speed: number) => void;
  click: () => void;
  setStyle: (s: SoundStyle) => void;
  setVolume: (v: number) => void;
  dispose: () => void;
}

type AC = typeof AudioContext;

export function createZipSound(style: SoundStyle = 'metal', volume = 0.8): ZipSound | null {
  if (typeof window === 'undefined') return null;
  const Ctor: AC | undefined = window.AudioContext ?? (window as unknown as { webkitAudioContext?: AC }).webkitAudioContext;
  if (!Ctor) return null;
  const ac = new Ctor();
  let st = SOUND_STYLES[style];
  let vol = volume;

  const len = ac.sampleRate * 1.5;
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const noise = ac.createBufferSource();
  noise.buffer = buf;
  noise.loop = true;

  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = st.freq;
  bp.Q.value = st.q;

  const am = ac.createGain();
  am.gain.value = 0.5;
  const lfo = ac.createOscillator();
  lfo.type = 'square';
  lfo.frequency.value = 20;
  const depth = ac.createGain();
  depth.gain.value = 0.5;
  lfo.connect(depth).connect(am.gain);

  const master = ac.createGain();
  master.gain.value = 0;
  noise.connect(bp).connect(am).connect(master).connect(ac.destination);
  noise.start();
  lfo.start();

  return {
    update(speed) {
      if (ac.state === 'suspended') ac.resume();
      const s = Math.min(3, Math.abs(speed));
      const t = ac.currentTime;
      lfo.frequency.setTargetAtTime(Math.max(4, s * st.teeth), t, 0.03);
      master.gain.setTargetAtTime(s < 0.02 ? 0 : Math.min(1, 0.25 + s * 0.6) * st.level * vol, t, 0.04);
    },
    click() {
      if (ac.state === 'suspended') ac.resume();
      const t = ac.currentTime;
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(1800, t);
      o.frequency.exponentialRampToValueAtTime(500, t + 0.08);
      g.gain.setValueAtTime(0.35 * vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      o.connect(g).connect(ac.destination);
      o.start(t);
      o.stop(t + 0.13);
    },
    setStyle(s) {
      st = SOUND_STYLES[s];
      bp.frequency.value = st.freq;
      bp.Q.value = st.q;
    },
    setVolume(v) {
      vol = v;
    },
    dispose() {
      try {
        noise.stop();
        lfo.stop();
      } catch {}
      ac.close();
    },
  };
}
