import type { Metadata } from 'next';
import SimulatorApp from '../../components/SimulatorApp';

export const metadata: Metadata = {
  title: 'Zipper Unlock Simulator — Drag to Unzip',
  description:
    'Try an interactive zipper lock screen in your browser: drag the puller to unzip, with realistic metal teeth, zipper sounds and vibration. Pick finishes, pullers and themes.',
  alternates: { canonical: '/simulator/' },
};

export default function SimulatorPage() {
  return (
    <div className="wrap page">
      <div className="page-head">
        <p className="eyebrow">Unlock simulator</p>
        <h1>Drag the puller. Hear the zip.</h1>
        <p className="muted">Pull past halfway to unlock. Change the metal, teeth and sound to find your favourite feel.</p>
      </div>
      <SimulatorApp />
    </div>
  );
}
