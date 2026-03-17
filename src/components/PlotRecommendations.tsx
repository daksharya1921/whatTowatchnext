import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film, Sparkles, Tv } from 'lucide-react';
import MovieCardSkeletonRow from '@/components/MovieCardSkeletonRow';
import ScrollableRow from '@/components/ScrollableRow';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PlotMovie {
  id: number;
  title: string;
  year: string;
  poster: string | null;
  rating: string;
  mediaType: string;
  reason: string;
}

interface PlotRecommendationsProps {
  title: string;
  plot: string;
  genre: string;
  year: string;
  mediaType?: 'movie' | 'tv';
  imdbId?: string;
}

export default function PlotRecommendations({ title, plot, genre, year, mediaType, imdbId }: PlotRecommendationsProps) {
  const [movies, setMovies] = useState<PlotMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  useEffect(() => {
    if (!title || !plot) {
      setLoading(false);
      return;
    }

    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('plot-recommendations', {
          body: { title, plot, genre, year, mediaType, imdbId },
        });
        if (error) throw error;
        if (data?.error) {
          if (data.error.includes('Rate limit')) toast.error(data.error);
          else if (data.error.includes('credits')) toast.error(data.error);
          throw new Error(data.error);
        }
        setMovies(data?.movies || []);
      } catch (err) {
        console.error('Plot recommendations failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [title, plot, genre, year, mediaType]);

  if (!loading && movies.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 max-w-[40px] bg-[var(--border-hi)]" />
        <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--gold-text)' }} />
        <h3 className="text-xs uppercase tracking-[0.3em] text-[var(--gold-text)] font-mono">
          More Like This
        </h3>
        <span className="text-[var(--cream-30)] text-[10px] font-mono italic">
          — AI Plot Analysis
        </span>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      {loading ? (
        <MovieCardSkeletonRow count={5} />
      ) : (
        <ScrollableRow>
          {movies.map((movie) => (
            <Link
              key={movie.id}
              to={`/movie/${encodeURIComponent(movie.title)}`}
              className="shrink-0 w-[140px] md:w-[160px] group/card"
              onMouseEnter={() => setHoveredId(movie.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="panel overflow-hidden hover:border-[var(--gold-lo)]/40 transition-colors relative">
                <div className="aspect-[2/3] relative">
                  {movie.poster ? (
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[var(--deep)]">
                      {movie.mediaType === 'tv' ? (
                        <Tv className="w-6 h-6 opacity-30" style={{ color: 'var(--gold-lo)' }} />
                      ) : (
                        <Film className="w-6 h-6 opacity-30" style={{ color: 'var(--gold-lo)' }} />
                      )}
                    </div>
                  )}
                  {movie.rating !== 'N/A' && (
                    <div className="absolute bottom-1.5 left-1.5 bg-[var(--void)]/80 px-1.5 py-0.5">
                      <span className="text-[var(--gold-text)] text-[9px] font-mono font-bold">★ {movie.rating}</span>
                    </div>
                  )}
                  {movie.mediaType === 'tv' && (
                    <div className="absolute top-1.5 left-1.5 bg-[var(--void)]/80 px-1.5 py-0.5 text-[8px] font-mono font-bold text-[var(--gold-text)] flex items-center gap-0.5">
                      <Tv className="w-2.5 h-2.5" /> TV
                    </div>
                  )}
                  {/* Reason tooltip overlay on hover */}
                  {hoveredId === movie.id && movie.reason && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-[var(--void)]/90 flex items-center justify-center p-3"
                    >
                      <p className="text-[var(--cream)] text-[10px] leading-relaxed text-center font-serif italic">
                        {movie.reason}
                      </p>
                    </motion.div>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-[var(--cream)] text-[11px] font-bold truncate group-hover/card:text-[var(--gold-text)] transition-colors">
                    {movie.title}
                  </p>
                  <p className="text-[var(--cream-30)] text-[9px] font-mono mt-0.5">{movie.year}</p>
                </div>
              </div>
            </Link>
          ))}
        </ScrollableRow>
      )}
    </motion.div>
  );
}
