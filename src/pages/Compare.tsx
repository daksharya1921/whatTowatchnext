import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, Search, Scale, Trophy, Film, ArrowLeft } from 'lucide-react';
import UserMenu from '@/components/UserMenu';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import type { MovieData } from '@/components/MovieCard';
import type { SentimentData } from '@/components/AiInsights';

interface FullMovieData {
  movie: MovieData;
  sentiment: SentimentData;
}

function CompareSearch({ label, onSearch, isLoading }: { label: string; onSearch: (q: string) => void; isLoading: boolean }) {
  const [query, setQuery] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) onSearch(trimmed);
  };
  return (
    <form onSubmit={handleSubmit} className="w-full">
      <label className="block text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">{label}</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
            placeholder="Movie or series title..."
            className="w-full bg-[#2A2A2A] border border-[var(--border)] focus:border-white text-white placeholder-gray-500 text-sm py-3 pl-10 pr-4 outline-none transition-colors rounded"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-[var(--primary)] text-white px-6 py-3 font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50 rounded"
        >
          {isLoading ? '...' : 'Compare'}
        </button>
      </div>
    </form>
  );
}

function StatBar({ label, valueA, valueB, format = 'number' }: { label: string; valueA: number; valueB: number; format?: string }) {
  const max = Math.max(valueA, valueB, 1);
  const pctA = (valueA / max) * 100;
  const pctB = (valueB / max) * 100;
  const winner = valueA > valueB ? 'A' : valueB > valueA ? 'B' : 'tie';

  const formatVal = (v: number) => {
    if (format === 'currency') return v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${v.toLocaleString()}`;
    if (format === 'rating') return v.toFixed(1);
    return v.toLocaleString();
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <span className={`text-sm font-bold ${winner === 'A' ? 'text-[var(--primary)]' : 'text-gray-400'}`}>
          {formatVal(valueA)}
        </span>
        <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">{label}</span>
        <span className={`text-sm font-bold ${winner === 'B' ? 'text-[var(--primary)]' : 'text-gray-400'}`}>
          {formatVal(valueB)}
        </span>
      </div>
      <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-[var(--background)]">
        <div className="flex-1 flex justify-end">
          <div
            className={`h-full transition-all duration-700 rounded-l-full ${winner === 'A' ? 'bg-[var(--primary)]' : 'bg-[#3A3A3A]'}`}
            style={{ width: `${pctA}%` }}
          />
        </div>
        <div className="w-[2px] bg-[var(--background)]" />
        <div className="flex-1">
          <div
            className={`h-full transition-all duration-700 rounded-r-full ${winner === 'B' ? 'bg-[var(--primary)]' : 'bg-[#3A3A3A]'}`}
            style={{ width: `${pctB}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function SentimentBadge({ sentiment }: { sentiment: SentimentData }) {
  const isPositive = sentiment.classification === 'Positive';
  const isNegative = sentiment.classification === 'Negative';
  
  const bgColor = isPositive ? 'bg-green-500/20' : isNegative ? 'bg-red-500/20' : 'bg-gray-500/20';
  const textColor = isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-gray-400';
  
  return (
    <div className="space-y-3">
      <span className={`inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-widest ${bgColor} ${textColor}`}>
        {sentiment.classification}
      </span>
      <p className="text-gray-400 text-sm leading-relaxed">{sentiment.summary}</p>
    </div>
  );
}

function parseBoxOffice(val: string): number {
  if (!val || val === 'N/A' || val === 'Classified') return 0;
  const cleaned = val.replace(/[$,]/g, '');
  const match = cleaned.match(/([\d.]+)\s*M/i);
  if (match) return parseFloat(match[1]) * 1_000_000;
  return parseFloat(cleaned) || 0;
}

function parseRuntime(val: string): number {
  const match = val?.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

export default function Compare() {
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const [dataA, setDataA] = useState<FullMovieData | null>(null);
  const [dataB, setDataB] = useState<FullMovieData | null>(null);
  const [errorA, setErrorA] = useState<string | null>(null);
  const [errorB, setErrorB] = useState<string | null>(null);

  const searchMovie = async (query: string, side: 'A' | 'B') => {
    const setLoading = side === 'A' ? setLoadingA : setLoadingB;
    const setData = side === 'A' ? setDataA : setDataB;
    const setError = side === 'A' ? setErrorA : setErrorB;

    setLoading(true);
    setError(null);
    setData(null);
    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke('analyze-movie', {
        body: { query },
      });
      if (fnError) throw new Error(fnError.message);
      if (fnData.error) throw new Error(fnData.error);
      setData(fnData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const bothLoaded = dataA && dataB && !loadingA && !loadingB;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="relative min-h-screen bg-[var(--background)]"
    >
      <div className="relative z-10">
        <nav className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-center">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <UserMenu />
        </nav>

        <header className="pt-24 pb-12 px-6 text-center max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Scale className="w-5 h-5 text-[var(--primary)]" />
            <span className="text-sm font-bold uppercase tracking-widest text-gray-400">
              Comparative Analysis
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight mb-4">
            Head to Head
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Compare films and series across ratings, revenue, runtime, and audience sentiment to decide what to watch next.
          </p>
        </header>

        <main className="max-w-6xl mx-auto px-6 pb-20">
          {/* Search inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <CompareSearch label="Movie A" onSearch={(q) => searchMovie(q, 'A')} isLoading={loadingA} />
            <CompareSearch label="Movie B" onSearch={(q) => searchMovie(q, 'B')} isLoading={loadingB} />
          </div>

          {/* Loading states */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {[{ loading: loadingA, data: dataA, error: errorA, label: 'A' }, { loading: loadingB, data: dataB, error: errorB, label: 'B' }].map(({ loading, data, error, label }) => (
              <AnimatePresence key={label} mode="wait">
                {loading && (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-3 py-16 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" />
                    <span className="font-bold">Analyzing…</span>
                  </motion.div>
                )}
                {error && !loading && (
                  <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 text-center">
                    <AlertCircle className="w-8 h-8 mx-auto mb-3 text-[var(--primary)]" />
                    <p className="text-gray-300 text-sm">{error}</p>
                  </motion.div>
                )}
                {data && !loading && (
                  <motion.div key="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 flex flex-col gap-6">
                    <div className="flex gap-6">
                      {data.movie.poster ? (
                        <img src={data.movie.poster} alt={data.movie.title} className="w-28 h-40 object-cover rounded shadow-lg shrink-0" />
                      ) : (
                        <div className="w-28 h-40 rounded flex items-center justify-center bg-[var(--card)] shrink-0 shadow-lg">
                          <Film className="w-8 h-8 opacity-30 text-[var(--primary)]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h3 className="text-2xl font-bold text-white leading-tight mb-2 truncate">{data.movie.title}</h3>
                        <p className="text-gray-400 text-sm font-medium mb-1">{data.movie.year} · {data.movie.genre.split(', ')[0]}</p>
                        <p className="text-gray-500 text-sm mb-4">Dir. {data.movie.director}</p>
                        <div className="flex items-center gap-4 text-sm font-bold">
                          <span className="text-white bg-black/50 px-2 py-1 rounded">★ {data.movie.imdbRating}</span>
                          <span className="text-gray-400">{data.movie.runtime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-[#2A2A2A] rounded-lg">
                      <SentimentBadge sentiment={data.sentiment} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </div>

          {/* Comparison stats */}
          <AnimatePresence>
            {bothLoaded && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 space-y-8 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white w-1/3 truncate">{dataA.movie.title}</h3>
                  <span className="text-xs uppercase tracking-widest text-gray-500 font-bold flex items-center justify-center gap-2 w-1/3">
                    <Trophy className="w-4 h-4 text-[var(--primary)]" /> Metrics
                  </span>
                  <h3 className="text-xl font-bold text-white w-1/3 text-right truncate">{dataB.movie.title}</h3>
                </div>

                <div className="space-y-6">
                  <StatBar
                    label="Rating"
                    valueA={parseFloat(dataA.movie.imdbRating) || 0}
                    valueB={parseFloat(dataB.movie.imdbRating) || 0}
                    format="rating"
                  />
                  <StatBar
                    label="Box Office"
                    valueA={parseBoxOffice(dataA.movie.boxOffice)}
                    valueB={parseBoxOffice(dataB.movie.boxOffice)}
                    format="currency"
                  />
                  <StatBar
                    label="Runtime (min)"
                    valueA={parseRuntime(dataA.movie.runtime)}
                    valueB={parseRuntime(dataB.movie.runtime)}
                  />
                  <StatBar
                    label="Votes"
                    valueA={parseInt(dataA.movie.imdbVotes?.replace(/,/g, '') || '0')}
                    valueB={parseInt(dataB.movie.imdbVotes?.replace(/,/g, '') || '0')}
                  />
                </div>

                {/* Sentiment comparison */}
                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-[var(--border)]">
                  <div className="space-y-4">
                    <span className="text-xs uppercase tracking-widest text-gray-500 font-bold block mb-2">Audience Sentiment A</span>
                    <SentimentBadge sentiment={dataA.sentiment} />
                  </div>
                  <div className="space-y-4">
                    <span className="text-xs uppercase tracking-widest text-gray-500 font-bold block mb-2 text-right">Audience Sentiment B</span>
                    <div className="text-right flex flex-col items-end">
                      <SentimentBadge sentiment={dataB.sentiment} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="text-center py-8">
          <p className="text-gray-500 text-xs">
            © 2026 WhatToWatchNext
          </p>
        </footer>
      </div>
    </motion.div>
  );
}
