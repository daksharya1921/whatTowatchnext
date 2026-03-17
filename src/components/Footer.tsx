import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail, Send } from 'lucide-react';

const quickLinks = [
  { label: 'Home', to: '/' },
  { label: 'Trending', to: '/' },
  { label: 'Watchlist', to: '/watchlist' },
  { label: 'Compare', to: '/compare' },
  { label: 'Contact', to: '/contact' },
];

const socials = [
  { icon: Github, href: 'https://github.com/daksharya1921', label: 'GitHub' },
  { icon: Linkedin, href: 'https://www.linkedin.com/in/daksh-arya-32009b1aa/', label: 'LinkedIn' },
  { icon: Mail, href: 'mailto:arya.daksh.official@gmail.com', label: 'Email' },
];

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-display italic text-2xl text-[var(--theme-text)]">WhatToWatchNext</h3>
            <p className="font-serif text-sm text-[var(--theme-muted)] leading-relaxed">
              Discover movies, track watchlists, and explore trending cinema — powered by AI-driven sentiment analysis.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <span className="lbl block">Quick Links</span>
            <ul className="space-y-2">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-[var(--theme-muted)] hover:text-[var(--gold-text)] transition-colors duration-200 font-mono text-xs"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <span className="lbl block">Connect With Me</span>
            <ul className="space-y-3">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[var(--theme-muted)] hover:text-[var(--gold-text)] transition-colors duration-200 font-mono text-xs"
                  >
                    <s.icon size={16} />
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Get In Touch link */}
          <div className="space-y-4">
            <span className="lbl block">Get In Touch</span>
            <p className="font-serif text-sm text-[var(--theme-muted)] leading-relaxed">
              Have questions or feedback? We'd love to hear from you.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-md bg-[var(--gold)] hover:bg-[var(--gold-hi)] text-[var(--void)] px-4 py-2 text-xs font-mono font-bold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--gold-lo)]"
            >
              <Send size={14} />
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[var(--theme-muted)] text-xs font-mono">
            © 2026 WhatToWatchNext
          </p>
          <div className="flex items-center gap-4">
            {socials.slice(0, 2).map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--theme-muted)] hover:text-[var(--gold-text)] transition-colors duration-200"
                aria-label={s.label}
              >
                <s.icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
