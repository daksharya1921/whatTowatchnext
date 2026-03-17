import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Film, Trash2, ArrowLeft, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface WatchlistItem {
  id: string;
  imdb_id: string;
  title: string;
  year: string | null;
  poster_url: string | null;
  imdb_rating: string | null;
  genre: string | null;
  runtime: string | null;
  created_at: string;
}

export default function Watchlist() {
  const { user } = useAuth();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadWatchlist();
  }, [user]);

  const loadWatchlist = async () => {
    const { data, error } = await supabase
      .from('watchlist')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load watchlist');
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  const removeItem = async (id: string) => {
    const { error } = await supabase.from('watchlist').delete().eq('id', id);
    if (error) {
      toast.error('Failed to remove');
    } else {
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success('Removed from watchlist');
    }
  };

  if (!user) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
        className="relative min-h-screen bg-[var(--background)]"
      >
        <div className="relative z-10 flex items-center justify-center min-h-screen text-center px-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-10 max-w-sm w-full shadow-2xl">
            <Film className="w-12 h-12 mx-auto mb-6 text-[var(--primary)] opacity-50" />
            <p className="text-white text-lg font-bold mb-2">Sign in to view your Watchlist</p>
            <p className="text-gray-400 text-sm mb-6">Keep track of movies and shows you want to watch next.</p>
            <Link to="/auth" className="block w-full bg-[var(--primary)] text-white font-bold py-3 rounded hover:bg-red-700 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
      className="relative min-h-screen bg-[var(--background)]"
    >
      <div className="relative z-10">
        <header className="pt-12 pb-8 px-6">
          <div className="max-w-7xl mx-auto">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 font-bold text-sm">
              <ArrowLeft className="w-4 h-4" /> Back to Search
            </Link>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white">My List</h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 pb-20">
          {loading ? (
            <div className="text-gray-400 text-center py-20 font-medium">
              Loading watchlist…
            </div>
          ) : items.length === 0 ? (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-16 text-center max-w-2xl mx-auto mt-10">
              <Film className="w-16 h-16 mx-auto mb-6 text-[var(--primary)] opacity-40" />
              <h2 className="text-2xl font-bold text-white mb-2">Your watchlist is empty</h2>
              <p className="text-gray-400">Search for movies and series and add them to your collection to watch later.</p>
              <Link to="/" className="inline-block mt-8 bg-white hover:bg-gray-200 text-black font-bold px-8 py-3 rounded transition-colors">
                Explore Titles
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group relative rounded-md overflow-hidden bg-[var(--card)] hover:ring-2 hover:ring-[var(--primary)] transition-all cursor-pointer"
                  >
                    <Link to={`/movie/${encodeURIComponent(item.title)}`} className="block relative aspect-[2/3]">
                      {item.poster_url ? (
                        <img src={item.poster_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--surface)]">
                          <Film className="w-8 h-8 opacity-30 text-[var(--primary)] mb-2" />
                          <span className="text-xs text-gray-500 text-center px-2">{item.title}</span>
                        </div>
                      )}
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Bottom Info displayed on hover */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <p className="text-white text-sm font-bold truncate drop-shadow-md">{item.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-gray-300 text-xs font-medium">{item.year}</p>
                          {item.imdb_rating && (
                            <span className="text-[var(--primary)] text-xs font-bold">★ {item.imdb_rating}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={(e) => { e.preventDefault(); removeItem(item.id); }}
                      className="absolute top-2 right-2 bg-black/60 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--primary)] z-10 shadow-lg"
                      title="Remove from Watchlist"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>
    </motion.div>
  );
}
