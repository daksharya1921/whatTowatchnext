import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film } from 'lucide-react';
import MovieCardSkeletonRow from '@/components/MovieCardSkeletonRow';
import ScrollableRow from '@/components/ScrollableRow';
import { supabase } from '@/integrations/supabase/client';

interface PersonMovie {
  id: number;
  title: string;
  year: string;
  poster: string | null;
  rating: string;
  mediaType: string;
}

interface PersonMoviesRowProps {
  personName: string;
  role: 'director' | 'actor' | 'actress';
  label: string;
  excludeTitle?: string;
}

function PersonMoviesRow({ personName, role, label, excludeTitle }: PersonMoviesRowProps) {
  const [movies, setMovies] = useState<PersonMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvedName, setResolvedName] = useState(personName);

  useEffect(() => {
    if (!personName) {
      setLoading(false);
      return;
    }

    const fetchMovies = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('person-movies', {
          body: { personName, role, excludeTitle },
        });
        if (error) throw error;
        setMovies(data?.movies || []);
        if (data?.personName) setResolvedName(data.personName);
      } catch (err) {
        console.error(`Failed to fetch ${role} movies:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [personName, role]);

  if (!loading && movies.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 max-w-[40px] bg-[var(--border-hi)]" />
        <h3 className="text-xs uppercase tracking-[0.3em] text-[var(--gold-text)] font-mono">
          {label}
        </h3>
        <span className="text-[var(--cream-30)] text-[10px] font-mono italic">
          — {resolvedName}
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

interface PersonMoviesSectionProps {
  director: string;
  actors: string;
  actorName?: string;
  actressName?: string;
  currentTitle?: string;
}

export default function PersonMoviesSection({ director, actors, actorName, actressName, currentTitle }: PersonMoviesSectionProps) {
  // Fallback parse for older payloads
  const actorList = actors.split(',').map((a) => a.trim()).filter(Boolean);
  const mainActor = actorName || actorList[0] || '';
  const mainActress = actressName || actorList.find((name) => name !== mainActor) || '';

  return (
    <div className="space-y-8">
      {director && director !== 'N/A' && (
        <PersonMoviesRow
          personName={director}
          role="director"
          label="More by the Same Director"
          excludeTitle={currentTitle}
        />
      )}
      {mainActor && (
        <PersonMoviesRow
          personName={mainActor}
          role="actor"
          label="Movies with the Same Actor"
          excludeTitle={currentTitle}
        />
      )}
      {mainActress && mainActress !== mainActor && (
        <PersonMoviesRow
          personName={mainActress}
          role="actress"
          label="Movies with the Same Actress"
          excludeTitle={currentTitle}
        />
      )}
    </div>
  );
}
