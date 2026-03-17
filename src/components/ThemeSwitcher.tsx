import { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

type Theme = 'dark' | 'mid-dark' | 'light';

const themes: { value: Theme; label: string; icon: typeof Moon }[] = [
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'mid-dark', label: 'Mid Dark', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
];

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'dark';
    }
    return 'dark';
  });
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const current = themes.find((t) => t.value === theme)!;
  const CurrentIcon = current.icon;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[var(--theme-muted)] text-xs uppercase tracking-widest hover:text-[var(--gold-text)] transition-colors"
        aria-label="Switch theme"
      >
        <CurrentIcon className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 min-w-[140px] rounded-md border border-[var(--border)] bg-[var(--theme-surface)] shadow-lg z-50 overflow-hidden">
          {themes.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.value}
                onClick={() => { setTheme(t.value); setOpen(false); }}
                className={`flex items-center gap-2 w-full px-3 py-2 text-xs font-mono transition-colors ${
                  theme === t.value
                    ? 'text-[var(--gold-text)] bg-[var(--theme-bg)]'
                    : 'text-[var(--theme-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-bg)]'
                }`}
              >
                <Icon className="w-3 h-3" />
                {t.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
