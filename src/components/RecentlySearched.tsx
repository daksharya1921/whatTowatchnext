import { useEffect, useState } from 'react';
import { Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SearchItem {
  id: string;
  query: string;
  movie_title: string | null;
  poster_url: string | null;
  imdb_rating: string | null;
  movie_year: string | null;
}

interface RecentlySearchedProps {
  onSelect: (query: string) => void;
}

export default function RecentlySearched({ onSelect }: RecentlySearchedProps) {
  const { user } = useAuth();
  const [searches, setSearches] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const fetch = async () => {
      const { data } = await supabase
        .from('search_history')
        .select('id, query, movie_title, poster_url, imdb_rating, movie_year')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      setSearches(data || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const remove = async (id: string) => {
    setSearches((prev) => prev.filter((s) => s.id !== id));
    await supabase.from('search_history').delete().eq('id', id);
  };

  if (!user || loading || searches.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center gap-2.5 mb-5">
        <Clock className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground tracking-tight">Recently Searched</h2>
      </div>

      <div className="flex gap-3.5 overflow-x-auto pb-3 no-scrollbar">
        <AnimatePresence>
          {searches.map((s, idx) => (
            <motion.button
              key={s.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onSelect(s.movie_title || s.query)}
              className="group relative flex-shrink-0 w-[130px] rounded-xl overflow-hidden bg-card border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            >
              <button
                onClick={(e) => { e.stopPropagation(); remove(s.id); }}
                className="absolute top-1.5 right-1.5 z-10 p-1 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
              {s.poster_url && s.poster_url !== 'N/A' ? (
                <img src={s.poster_url} alt={s.movie_title || s.query} className="w-full h-[180px] object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="w-full h-[180px] bg-muted flex items-center justify-center text-muted-foreground text-xs">No Poster</div>
              )}
              <div className="p-2.5">
                <p className="text-xs font-semibold text-foreground truncate">{s.movie_title || s.query}</p>
                <div className="flex items-center justify-between mt-1">
                  {s.movie_year && <span className="text-[10px] text-muted-foreground">{s.movie_year}</span>}
                  {s.imdb_rating && s.imdb_rating !== 'N/A' && <span className="text-[10px] text-amber-400 font-medium">⭐ {s.imdb_rating}</span>}
                </div>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
