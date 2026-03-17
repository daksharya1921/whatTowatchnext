import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Film, Loader2, Tv } from 'lucide-react';

interface TrendingItem {
  title: string;
  year: string;
  tmdbId: number;
  poster: string | null;
  rating: string;
  genre: string;
  mediaType: 'movie' | 'tv';
  isAnime: boolean;
}

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w300';

const GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
  // TV genre IDs
  10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News', 10764: 'Reality',
  10765: 'Sci-Fi & Fantasy', 10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics',
};

interface TrendingMoviesProps {
  onSelect: (query: string) => void;
}

import ScrollableRow from './ScrollableRow';
import MovieCarouselSkeleton from './MovieCarouselSkeleton';

export default function TrendingMovies({ onSelect }: TrendingMoviesProps) {
  // ... (state and effect are the same)
  const [items, setItems] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/trending-movies`,
          {
            headers: {
              'Content-Type': 'application/json',
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
          }
        );
        const data = await res.json();
        if (data.results) {
          const mapped: TrendingItem[] = data.results.slice(0, 10).map((m: any) => {
            const isJp = (m.origin_country || []).includes('JP');
            const isAnimation = (m.genre_ids || []).includes(16);
            return {
              title: m.title || m.name,
              year: (m.release_date || m.first_air_date)?.split('-')[0] || 'N/A',
              tmdbId: m.id,
              poster: m.poster_path ? `${TMDB_IMAGE_BASE}${m.poster_path}` : null,
              rating: m.vote_average?.toFixed(1) || 'N/A',
              genre: m.genre_ids?.map((id: number) => GENRE_MAP[id]).filter(Boolean).join(', ') || 'N/A',
              mediaType: m.media_type === 'tv' ? 'tv' : 'movie',
              isAnime: isJp && isAnimation,
            };
          });
          setItems(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch trending:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  if (loading) {
    return (
      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-[var(--primary)]" />
          Trending This Week
        </h2>
        <MovieCarouselSkeleton />
      </section>
    );
  }

  if (!items.length) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-[var(--primary)]" />
        Trending This Week
      </h2>

      <ScrollableRow>
        {items.map((item, i) => (
          <motion.div
            key={item.tmdbId}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="shrink-0 w-[160px] md:w-[200px]"
          >
            <button
              onClick={() => onSelect(item.title)}
              className="relative w-full aspect-[2/3] rounded-md overflow-hidden group focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              {item.poster ? (
                <img
                  src={item.poster}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[var(--card)]">
                  {item.mediaType === 'tv' ? (
                    <Tv className="w-8 h-8 opacity-30 text-[var(--primary)]" />
                  ) : (
                    <Film className="w-8 h-8 opacity-30 text-[var(--primary)]" />
                  )}
                </div>
              )}
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Top Badge */}
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-y-2 group-hover:translate-y-0 shadow-lg">
                ★ {item.rating}
              </div>
              
              {/* Bottom Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 text-left">
                <p className="text-white text-sm font-bold leading-tight truncate drop-shadow-md mb-1">{item.title}</p>
                <div className="flex items-center justify-between">
                  <p className="text-gray-300 text-xs truncate drop-shadow-md">{item.year} · {item.genre.split(',')[0]}</p>
                  <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white shadow-lg hover:bg-white hover:text-[var(--primary)] transition-colors">
                    <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
              </div>
            </button>
          </motion.div>
        ))}
      </ScrollableRow>
    </section>
  );
}
