import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import MovieCard from '@/components/MovieCard';
import AiInsights from '@/components/AiInsights';
import WhereToWatch from '@/components/WhereToWatch';

import PersonMoviesSection from '@/components/PersonMoviesSection';
import GenreMoviesSection from '@/components/GenreMoviesSection';
import PlotRecommendations from '@/components/PlotRecommendations';
import type { MovieData } from '@/components/MovieCard';
import type { SentimentData } from '@/components/AiInsights';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Suggestion {
  title: string;
  year: string;
  tmdbId: number;
}

interface FullMovieData {
  movie: MovieData;
  sentiment: SentimentData;
  suggestions?: Suggestion[];
}

export default function MovieDetail() {
  const { query } = useParams<{ query: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FullMovieData | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loadingRegion, setLoadingRegion] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('US');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch movie data
  useEffect(() => {
    if (query) {
      fetchMovie(decodeURIComponent(query));
    }
  }, [query]);

  // Check watchlist status
  useEffect(() => {
    if (!user || !data?.movie.imdbID) {
      setIsInWatchlist(false);
      return;
    }
    supabase
      .from('watchlist')
      .select('id')
      .eq('imdb_id', data.movie.imdbID)
      .maybeSingle()
      .then(({ data: wl }) => {
        setIsInWatchlist(!!wl);
      });
  }, [user, data?.movie.imdbID]);

  const fetchMovie = async (q: string) => {
    setLoading(true);
    setError(null);
    setData(null);
    setSuggestions([]);
    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke('analyze-movie', {
        body: { query: q, region: selectedRegion },
      });
      if (fnError) throw new Error(fnError.message);
      if (fnData.error) throw new Error(fnData.error);
      setData(fnData);
      setSuggestions(fnData.suggestions || []);

      // Save to search history if logged in
      if (user && fnData.movie) {
        await supabase.from('search_history').insert({
          user_id: user.id,
          query: q,
          movie_title: fnData.movie.title,
          movie_year: fnData.movie.year,
          imdb_rating: fnData.movie.imdbRating,
          poster_url: fnData.movie.poster,
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleWatchlist = async () => {
    if (!user) {
      toast.error('Sign in to use your watchlist');
      return;
    }
    if (!data?.movie) return;

    if (isInWatchlist) {
      await supabase.from('watchlist').delete().eq('imdb_id', data.movie.imdbID!);
      setIsInWatchlist(false);
      toast.success('Removed from watchlist');
    } else {
      const { error } = await supabase.from('watchlist').insert({
        user_id: user.id,
        imdb_id: data.movie.imdbID!,
        title: data.movie.title,
        year: data.movie.year,
        poster_url: data.movie.poster,
        imdb_rating: data.movie.imdbRating,
        genre: data.movie.genre,
        runtime: data.movie.runtime,
      });
      if (error) {
        toast.error('Failed to add to watchlist');
      } else {
        setIsInWatchlist(true);
        toast.success('Added to watchlist');
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    navigate(`/movie/${encodeURIComponent(trimmed)}`);
    setSearchQuery('');
  };

  const handleSelectMovie = (title: string) => {
    navigate(`/movie/${encodeURIComponent(title)}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="relative min-h-screen"
    >
      <div className="grain" />
      <div className="dot-grid" />
      <div className="bg-glow" />
      <div className="vignette" />

      <div className="relative z-10">
        {/* Top Bar */}
        <nav className="sticky top-0 z-30 bg-[var(--void)]/80 backdrop-blur-md border-b border-[var(--border)]">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
            {/* Home button */}
            <Link
              to="/"
              className="flex items-center gap-2 text-[var(--gold-text)] hover:text-[var(--gold-hi)] transition-colors shrink-0"
            >
              <Home className="w-5 h-5" />
              <span className="text-xs uppercase tracking-widest font-bold hidden sm:inline">Home</span>
            </Link>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex items-center gap-2 w-full max-w-sm">
              <div className="relative flex items-center w-full bg-[var(--deep)] border border-[var(--border)] focus-within:border-[var(--gold-hi)]/30 transition-colors overflow-hidden">
                <Search className="w-4 h-4 ml-3 shrink-0" style={{ color: 'var(--gold-lo)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies..."
                  className="flex-1 bg-transparent border-none outline-none text-[var(--cream)] placeholder-[var(--cream-12)] text-sm py-2.5 px-3 font-mono"
                />
                <button
                  type="submit"
                  className="bg-[var(--gold-hi)] text-[var(--void)] px-4 py-2.5 hover:bg-[var(--cream)] transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </nav>

        {/* Content */}
        <main className="max-w-6xl mx-auto px-4 py-8 pb-20">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-3 py-20 text-[var(--cream-30)]"
              >
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gold-text)' }} />
                <span className="lbl">Analyzing Archives…</span>
              </motion.div>
            )}

            {error && !loading && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="panel p-6 text-center max-w-md mx-auto"
              >
                <AlertCircle className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--red)' }} />
                <p className="text-[var(--cream)] font-bold mb-1">Fetch Failed</p>
                <p className="text-[var(--cream-30)] text-sm">{error}</p>
                <Link to="/" className="inline-block mt-4 text-[var(--gold-text)] text-xs uppercase tracking-widest hover:text-[var(--gold-hi)]">
                  ← Back to Home
                </Link>
              </motion.div>
            )}

            {data && !loading && !error && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {suggestions.length > 0 && (
                  <div className="panel p-4 flex flex-wrap items-center gap-3">
                    <span className="text-[var(--cream-30)] text-sm font-mono">Did you mean:</span>
                    {suggestions.map((s) => (
                      <button
                        key={s.tmdbId}
                        onClick={() => handleSelectMovie(s.title)}
                        className="text-[var(--gold-text)] hover:text-[var(--cream)] text-sm font-serif italic underline underline-offset-4 decoration-[var(--border)] hover:decoration-[var(--gold-text)] transition-colors"
                      >
                        {s.title} ({s.year})
                      </button>
                    ))}
                  </div>
                )}
                <MovieCard
                  data={data.movie}
                  isInWatchlist={isInWatchlist}
                  onToggleWatchlist={user ? toggleWatchlist : undefined}
                />
                <AiInsights sentiment={data.sentiment} />
                <WhereToWatch
                  providers={data.movie.watchProviders || []}
                  movieTitle={data.movie.title}
                  imdbId={data.movie.imdbID}
                  selectedRegion={selectedRegion}
                  isLoadingRegion={loadingRegion}
                  onRegionChange={async (region) => {
                    if (!data) return;
                    setSelectedRegion(region);
                    setLoadingRegion(true);
                    try {
                      const { data: fnData } = await supabase.functions.invoke('analyze-movie', {
                        body: { query: data.movie.imdbID || data.movie.title, region },
                      });
                      if (fnData?.movie) {
                        setData(prev => prev ? {
                          ...prev,
                          movie: { ...prev.movie, watchProviders: fnData.movie.watchProviders || [] }
                        } : prev);
                      }
                    } catch (err) {
                      console.error('Region fetch failed:', err);
                    } finally {
                      setLoadingRegion(false);
                    }
                  }}
                />
                <PersonMoviesSection
                  director={data.movie.director}
                  actors={data.movie.actors}
                  actorName={data.movie.actorName}
                  actressName={data.movie.actressName}
                  currentTitle={data.movie.title}
                />
                <GenreMoviesSection
                  genre={data.movie.genre}
                  mediaType={data.movie.mediaType}
                  excludeTitle={data.movie.title}
                />
                <PlotRecommendations
                  title={data.movie.title}
                  plot={data.movie.plot}
                  genre={data.movie.genre}
                  year={data.movie.year}
                  mediaType={data.movie.mediaType}
                  imdbId={data.movie.imdbID}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="text-center py-8 border-t border-[var(--border)]">
          <p className="text-[var(--cream-30)] text-xs font-mono">
            © 2026 WhatToWatchNext · Powered by Lovable Cloud
          </p>
        </footer>
      </div>
    </motion.div>
  );
}
