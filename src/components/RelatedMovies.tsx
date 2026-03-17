import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Film, Layers, Tv } from 'lucide-react';
import ScrollableRow from '@/components/ScrollableRow';
import { supabase } from '@/integrations/supabase/client';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w300';

const GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
  10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News', 10764: 'Reality',
  10765: 'Sci-Fi & Fantasy', 10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics',
};

interface SimilarItem {
  title: string;
  year: string;
  poster: string | null;
  rating: string;
  genre: string;
  mediaType: 'movie' | 'tv';
}

interface RelatedMoviesProps {
  imdbId: string;
  mediaType?: 'movie' | 'tv';
  onSelect: (query: string) => void;
}

export default function RelatedMovies({ imdbId, mediaType, onSelect }: RelatedMoviesProps) {
  const [items, setItems] = useState<SimilarItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!imdbId) return;
    setLoading(true);
    supabase.functions
      .invoke('similar-movies', { body: { imdb_id: imdbId, media_type: mediaType } })
      .then(({ data }) => {
        if (data?.results) {
          const mapped: SimilarItem[] = data.results.slice(0, 8).map((m: any) => ({
            title: m.title || m.name,
            year: (m.release_date || m.first_air_date)?.split('-')[0] || 'N/A',
            poster: m.poster_path ? `${TMDB_IMAGE_BASE}${m.poster_path}` : null,
            rating: m.vote_average?.toFixed(1) || 'N/A',
            genre: m.genre_ids?.map((id: number) => GENRE_MAP[id]).filter(Boolean).join(', ') || 'N/A',
            mediaType: m.media_type === 'tv' ? 'tv' : 'movie',
          }));
          setItems(mapped);
        }
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [imdbId, mediaType]);

  if (loading) return null;
  if (!items.length) return null;

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <Layers className="w-4 h-4" style={{ color: 'var(--gold-text)' }} />
        <span className="lbl">Similar Titles</span>
      </div>

      <ScrollableRow>
        {items.map((item, i) => (
          <motion.button
            key={`${item.title}-${i}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.4 }}
            onClick={() => onSelect(item.title)}
            className="shrink-0 w-[140px] md:w-[160px] group text-left focus:outline-none"
          >
            <div className="relative aspect-[2/3] overflow-hidden border border-[var(--border)] hover:border-[var(--border-hi)] transition-colors">
              {item.poster ? (
                <img
                  src={item.poster}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover grayscale-[0.4] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[var(--deep)]">
                  {item.mediaType === 'tv' ? (
                    <Tv className="w-8 h-8 opacity-30" style={{ color: 'var(--gold-lo)' }} />
                  ) : (
                    <Film className="w-8 h-8 opacity-30" style={{ color: 'var(--gold-lo)' }} />
                  )}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--void)] via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              <div className="absolute top-1.5 right-1.5 bg-[var(--void)]/80 px-1.5 py-0.5 text-[8px] font-mono font-bold text-[var(--gold-text)]">
                ★ {item.rating}
              </div>
              {item.mediaType === 'tv' && (
                <div className="absolute top-1.5 left-1.5 bg-[var(--void)]/80 px-1.5 py-0.5 text-[8px] font-mono font-bold text-[var(--gold-text)] flex items-center gap-0.5">
                  <Tv className="w-2.5 h-2.5" /> TV
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className="text-[var(--cream)] text-[10px] font-bold leading-tight truncate">{item.title}</p>
                <p className="text-[var(--cream-30)] text-[8px] font-mono mt-0.5">{item.year} · {item.genre.split(',')[0]}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </ScrollableRow>
    </section>
  );
}
