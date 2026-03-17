import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film, Tags } from 'lucide-react';
import MovieCardSkeletonRow from '@/components/MovieCardSkeletonRow';
import ScrollableRow from '@/components/ScrollableRow';
import { supabase } from '@/integrations/supabase/client';

// TMDB genre name → ID mapping
const GENRE_NAME_TO_ID: Record<string, number> = {
  action: 28, adventure: 12, animation: 16, comedy: 35, crime: 80,
  documentary: 99, drama: 18, family: 10751, fantasy: 14, history: 36,
  horror: 27, music: 10402, mystery: 9648, romance: 10749,
  'science fiction': 878, 'sci-fi': 878, thriller: 53, war: 10752, western: 37,
  // TV genres
  'action & adventure': 10759, kids: 10762, reality: 10764,
  'sci-fi & fantasy': 10765, soap: 10766, talk: 10767, 'war & politics': 10768,
};

interface GenreMovie {
  id: number;
  title: string;
  year: string;
  poster: string | null;
  rating: string;
  mediaType: string;
}

interface GenreMoviesSectionProps {
  genre: string;
  mediaType?: 'movie' | 'tv';
  excludeId?: number;
  excludeTitle?: string;
}

export default function GenreMoviesSection({ genre, mediaType, excludeId, excludeTitle }: GenreMoviesSectionProps) {
  const [movies, setMovies] = useState<GenreMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!genre || genre === 'N/A') {
      setLoading(false);
      return;
    }

    const fetchMovies = async () => {
      setLoading(true);
      try {
        // Parse genre string like "Action, Sci-Fi, Adventure"
        const genreNames = genre.split(',').map(g => g.trim().toLowerCase());
        const genreIds = genreNames
          .map(g => GENRE_NAME_TO_ID[g])
          .filter(Boolean);

        if (genreIds.length === 0) {
          setMovies([]);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.functions.invoke('genre-movies', {
          body: { genreIds, mediaType: mediaType || 'movie', excludeId, excludeTitle },
        });
        if (error) throw error;
        setMovies(data?.movies || []);
      } catch (err) {
        console.error('Failed to fetch genre movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [genre, mediaType, excludeId]);

  if (!loading && movies.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 max-w-[40px] bg-[var(--border-hi)]" />
        <Tags className="w-3.5 h-3.5" style={{ color: 'var(--gold-text)' }} />
        <h3 className="text-xs uppercase tracking-[0.3em] text-[var(--gold-text)] font-mono">
          Top Rated in Same Genre
        </h3>
        <span className="text-[var(--cream-30)] text-[10px] font-mono italic">
          — {genre}
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
              >
                <div className="panel overflow-hidden hover:border-[var(--gold-lo)]/40 transition-colors">
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
                        <Film className="w-6 h-6 opacity-30" style={{ color: 'var(--gold-lo)' }} />
                      </div>
                    )}
                    {movie.rating !== 'N/A' && (
                      <div className="absolute bottom-1.5 left-1.5 bg-[var(--void)]/80 px-1.5 py-0.5">
                        <span className="text-[var(--gold-text)] text-[9px] font-mono font-bold">★ {movie.rating}</span>
                      </div>
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
