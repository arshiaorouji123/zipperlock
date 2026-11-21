import Link from 'next/link';
import { InstallButton } from './Pwa';

export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="ZipperLock home">
      <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden>
        <defs>
          <linearGradient id="lg" x1="0" x2="1">
            <stop offset="0" stopColor="#7A5C0F" />
            <stop offset=".45" stopColor="#FFF4C4" />
            <stop offset=".7" stopColor="#D4AF37" />
            <stop offset="1" stopColor="#7A5C0F" />
          </linearGradient>
        </defs>
        <path d="M9 4h14l-3 9h-8z" fill="url(#lg)" />
        <rect x="12.5" y="12" width="7" height="17" rx="3" fill="url(#lg)" />
        <rect x="14.3" y="22" width="3.4" height="4.2" rx="1.6" fill="#0B0B0F" />
      </svg>
      <span>
        Zipper<b>Lock</b>
      </span>
    </Link>
  );
}

export function Header() {
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Logo />
        <nav aria-label="Main">
          <Link href="/studio/">Studio</Link>
          <Link href="/themes/">Themes</Link>
          <Link href="/designs/">Designs</Link>
          <Link href="/simulator/">Simulator</Link>
          <Link href="/styles/">Styles</Link>
          <Link href="/tools/">Tools</Link>
          <Link href="/projects/">My Projects</Link>
        </nav>
        <Link href="/studio/" className="btn-primary sm header-cta">
          <span className="hide-sm">Create Your Zipper Lock Screen</span>
          <span className="show-sm">Create</span>
        </Link>
        <details className="mnav">
          <summary aria-label="Menu">
            <span aria-hidden>☰</span>
          </summary>
          <nav aria-label="Mobile">
            <Link href="/studio/">Studio</Link>
            <Link href="/designs/">Design library</Link>
            <Link href="/simulator/">Simulator</Link>
            <Link href="/styles/">Zipper styles</Link>
            <Link href="/themes/">Themes</Link>
            <Link href="/tools/">Tools</Link>
            <Link href="/guides/">Guides</Link>
            <Link href="/projects/">My Projects</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div>
          <Logo />
          <p className="muted">
            Design zipper lock screen wallpapers in your browser. Your photos are processed on your device and never uploaded.
          </p>
          <InstallButton />
        </div>
        <nav aria-label="Create">
          <h4>Create</h4>
          <Link href="/studio/">Zipper Lock Studio</Link>
          <Link href="/studio/?tab=zipper">Zipper styles</Link>
          <Link href="/studio/?tab=clock">Clock designer</Link>
          <Link href="/tools/color-studio/">Zipper Color Studio</Link>
          <Link href="/tools/wallpaper-cropper/">Wallpaper Cropper</Link>
          <Link href="/tools/">All tools</Link>
        </nav>
        <nav aria-label="Explore">
          <h4>Explore</h4>
          <Link href="/designs/">Design library</Link>
          <Link href="/designs/love/">Love designs</Link>
          <Link href="/designs/sports/">Football designs</Link>
          <Link href="/simulator/">Unlock simulator</Link>
          <Link href="/styles/">Zipper style library</Link>
          <Link href="/themes/">Theme library</Link>
          <Link href="/projects/">My Projects</Link>
        </nav>
        <nav aria-label="Learn">
          <h4>Learn</h4>
          <Link href="/guides/">Guides</Link>
          <Link href="/#how">How it works</Link>
          <Link href="/#faq">FAQ</Link>
          <Link href="/about/">About</Link>
          <Link href="/contact/">Contact</Link>
        </nav>
      </div>
      <div className="wrap footer-bottom">
        <span>© {new Date().getFullYear()} ZipperLock.net</span>
        <nav className="legal-links" aria-label="Legal">
          <Link href="/privacy/">Privacy</Link>
          <Link href="/terms/">Terms</Link>
          <Link href="/disclaimer/">Disclaimer</Link>
          <Link href="/cookies/">Cookies</Link>
        </nav>
        <span className="muted">Wallpapers & simulations only — not a replacement for your device’s lock screen.</span>
      </div>
    </footer>
  );
}
