import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import ScrollableRow from '@/components/ScrollableRow';
import MovieCardSkeletonRow from '@/components/MovieCardSkeletonRow';

interface Movie {
  id: number;
  title: string;
  year: string;
  poster: string;
  rating: string;
  mediaType: string;
}

interface PickedForYouProps {
  onSelect: (title: string) => void;
}

// TMDB genre name → ID map (movies). Covers the genres used during onboarding.
const GENRE_NAME_TO_ID: Record<string, number> = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Family: 10751,
  Fantasy: 14,
  History: 36,
  Horror: 27,
  Music: 10402,
  Mystery: 9648,
  Romance: 10749,
  'Sci-Fi': 878,
  'Science Fiction': 878,
  Thriller: 53,
  War: 10752,
  Western: 37,
};

export default function PickedForYou({ onSelect }: PickedForYouProps) {
  const { user } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [genreLabel, setGenreLabel] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('favorite_genres')
          .eq('user_id', user.id)
          .maybeSingle();

        const genres: string[] = profile?.favorite_genres || [];
        if (!genres.length) {
          if (!cancelled) setLoading(false);
          return;
        }

        // Pick up to 3 genres, map to IDs
        const ids = genres
          .slice(0, 3)
          .map((g) => GENRE_NAME_TO_ID[g])
          .filter(Boolean);

        if (!ids.length) {
          if (!cancelled) setLoading(false);
          return;
        }

        if (!cancelled) setGenreLabel(genres.slice(0, 3).join(' · '));

        const { data, error } = await supabase.functions.invoke('genre-movies', {
          body: { genreIds: ids, mediaType: 'movie' },
        });
        if (error) throw error;
        if (!cancelled) setMovies(data?.movies || []);
      } catch (err) {
        console.error('PickedForYou error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) return null;
  if (!loading && movies.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-2.5 mb-6 flex-wrap">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground tracking-tight">Picked For You</h2>
        {genreLabel && (
          <span className="text-[11px] text-muted-foreground/70 font-medium ml-1 bg-muted/50 px-2 py-0.5 rounded-full">
            {genreLabel}
          </span>
        )}
      </div>

      {loading ? (
        <MovieCardSkeletonRow />
      ) : (
        <ScrollableRow>
          {movies.map((movie, idx) => (
            <motion.button
              key={movie.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => onSelect(movie.title)}
              className="group relative flex-shrink-0 w-[140px] rounded-xl overflow-hidden bg-card border border-border hover:border-primary/40 transition-all duration-300 text-left hover:shadow-lg hover:shadow-primary/5"
            >
              <img
                src={movie.poster}
                alt={movie.title}
                loading="lazy"
                className="w-full h-[200px] object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="p-2.5">
                <p className="text-xs font-semibold text-foreground truncate">{movie.title}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground">{movie.year}</span>
                  {movie.rating !== 'N/A' && (
                    <span className="text-[10px] text-amber-400 font-medium flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      {movie.rating}
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </ScrollableRow>
      )}
    </motion.section>
  );
}
