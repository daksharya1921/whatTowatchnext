import { Sparkles, TrendingUp, Activity, AlertTriangle, Fingerprint } from 'lucide-react';

interface SentimentData {
  classification: string;
  summary: string;
}

export default function AiInsights({ sentiment }: { sentiment: SentimentData }) {
  const cls = sentiment.classification.toLowerCase();
  const isPositive = cls === 'positive';
  const isMixed = cls === 'mixed';
  const isNegative = cls === 'negative';

  let statusText = 'Neutral Outcome';
  let accentColor = 'var(--gold-text)';
  let Icon = Fingerprint;

  if (isPositive) {
    statusText = 'Optimistic Reception';
    accentColor = 'var(--green)';
    Icon = TrendingUp;
  } else if (isMixed) {
    statusText = 'Ambivalent Signals';
    accentColor = 'var(--gold-hi)';
    Icon = Activity;
  } else if (isNegative) {
    statusText = 'Critical Resistance';
    accentColor = 'var(--red)';
    Icon = AlertTriangle;
  }

  return (
    <div className="panel p-6 md:p-8 space-y-8">
      {/* Top bar detail */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--border-hi)] to-transparent" />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-[0.4em] text-[var(--cream-30)] font-mono block mb-1">Intelligence Report</span>
          <h3 className="text-2xl font-serif italic text-[var(--cream)]">Audience Synthesis</h3>
        </div>
        <div className="w-10 h-10 border border-[var(--border)] flex items-center justify-center bg-[var(--cream-06)]">
          <Sparkles className="w-4 h-4" style={{ color: 'var(--gold-text)' }} />
        </div>
      </div>

      {/* Verdict */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: accentColor }} />
          <span className="text-[10px] uppercase tracking-widest text-[var(--cream-30)] font-mono">Archive Classification</span>
        </div>

        <div
          className="inline-flex items-center gap-4 px-6 py-3 border bg-[var(--void)]/40 backdrop-blur-sm"
          style={{ borderColor: `${accentColor}33` }}
        >
          <Icon className="w-5 h-5" style={{ color: accentColor }} />
          <div>
            <span
              className="block text-sm font-bold uppercase tracking-[0.2em] leading-none mb-1"
              style={{ color: accentColor }}
            >
              {sentiment.classification}
            </span>
            <span className="block text-[8px] uppercase tracking-widest text-[var(--cream-30)] font-mono">
              {statusText}
            </span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-4">
        <div className="h-px w-full bg-gradient-to-r from-[var(--border-hi)] to-transparent" />
        <p className="text-[var(--cream-60)] italic text-xl leading-relaxed font-serif relative">
          <span className="text-4xl absolute -top-4 -left-2 opacity-10 font-serif" style={{ color: 'var(--gold-hi)' }}>"</span>
          {sentiment.summary}
          <span className="text-4xl absolute -bottom-10 opacity-10 font-serif" style={{ color: 'var(--gold-hi)' }}>"</span>
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 bg-[var(--gold-lo)] rounded-full" />
          <span className="text-[8px] uppercase tracking-[0.5em] text-[var(--cream-30)] font-mono">Secure Node / AI-G 1.5</span>
        </div>
        <div className="text-[8px] uppercase tracking-[0.3em] text-[var(--cream-30)] font-mono opacity-30">
          ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
        </div>
      </div>
    </div>
  );
}

export type { SentimentData };
