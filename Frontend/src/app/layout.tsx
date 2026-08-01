import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
export const metadata: Metadata = { 
  title: "ANCHOR | Guidance for every earner", 
  description: "Cautious, practical guidance for ordinary earners in India.",
  icons: {
    icon: '/icon.svg?v=3'
  }
};
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { 
  return (
    <html lang="en-IN">
      <body>
        <a className="skip" href="#main">Skip to content</a>
        
        <div className="header-wrapper">
          <header>
            <Link href="/" className="brand">
              <span aria-hidden="true">⚓</span> ANCHOR
            </Link>
            <nav aria-label="Primary">
              <Link href="/#tools">Features</Link>
              <Link href="/about">How it works</Link>
              <Link href="/safety">Safety</Link>
              <Link href="/planner" className="nav-cta">Get guidance</Link>
            </nav>
          </header>
        </div>

        <div id="main">{children}</div>
        
        <footer>
          <span>ANCHOR · Demo mode</span>
          <span>Sources are checked and may change.</span>
          <Link href="/about">About</Link>
        </footer>
      </body>
    </html>
  );
}
