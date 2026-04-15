import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Zap, Brain, Drama, Sword, Moon, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Movie {
  id: number;
  title: string;
  year: string;
  poster: string | null;
  rating: string;
  mediaType: string;
  reason: string;
}

interface MoodPickerProps {
  onSelect: (title: string) => void;
}

const MOODS = [
  { label: 'Feel-good', icon: Heart, gradient: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/25 hover:border-emerald-400/60', activeRing: 'ring-emerald-400/50', iconColor: 'text-emerald-400' },
  { label: 'Thrilling', icon: Zap, gradient: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/25 hover:border-amber-400/60', activeRing: 'ring-amber-400/50', iconColor: 'text-amber-400' },
  { label: 'Mind-bending', icon: Brain, gradient: 'from-violet-500/20 to-violet-600/5', border: 'border-violet-500/25 hover:border-violet-400/60', activeRing: 'ring-violet-400/50', iconColor: 'text-violet-400' },
  { label: 'Romantic', icon: Drama, gradient: 'from-pink-500/20 to-pink-600/5', border: 'border-pink-500/25 hover:border-pink-400/60', activeRing: 'ring-pink-400/50', iconColor: 'text-pink-400' },
  { label: 'Dark & Gritty', icon: Moon, gradient: 'from-red-500/20 to-red-600/5', border: 'border-red-500/25 hover:border-red-400/60', activeRing: 'ring-red-400/50', iconColor: 'text-red-400' },
  { label: 'Epic Adventure', icon: Sword, gradient: 'from-sky-500/20 to-sky-600/5', border: 'border-sky-500/25 hover:border-sky-400/60', activeRing: 'ring-sky-400/50', iconColor: 'text-sky-400' },
];

export default function MoodPicker({ onSelect }: MoodPickerProps) {
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMood = async (mood: string) => {
    if (loading) return;
    setActiveMood(mood);
    setMovies([]);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('mood-recommendations', {
        body: { mood },
      });
      if (error) {
        toast.error('Failed to get recommendations. Try again.');
        console.error(error);
        setLoading(false);
        return;
      }
      setMovies(data?.movies || []);
    } catch (err) {
      toast.error('Something went wrong.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="flex items-center gap-2.5 mb-6">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground tracking-tight">What's Your Mood?</h2>
        <span className="text-[11px] text-muted-foreground/60 font-medium ml-1 bg-muted/50 px-2 py-0.5 rounded-full">AI-powered</span>
      </div>

      {/* Mood Chips */}
      <div className="flex flex-wrap gap-2.5 mb-8">
        {MOODS.map(({ label, icon: Icon, gradient, border, activeRing, iconColor }) => (
          <motion.button
            key={label}
            onClick={() => fetchMood(label)}
            disabled={loading}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border backdrop-blur-sm transition-all duration-200 bg-gradient-to-br ${gradient} ${border} ${
              activeMood === label ? `ring-2 ring-offset-1 ring-offset-background ${activeRing} scale-105` : ''
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <Icon className={`w-4 h-4 ${iconColor}`} />
            <span className="text-foreground">{label}</span>
          </motion.button>
        ))}
      </div>

      {/* Loading */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-16 gap-3"
          >
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-muted-foreground/70 text-sm">Finding {activeMood} picks…</span>
          </motion.div>
        )}

        {/* Results */}
        {!loading && movies.length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex gap-3.5 overflow-x-auto pb-3 no-scrollbar">
              {movies.map((movie, idx) => (
                <motion.button
                  key={movie.id || idx}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => onSelect(movie.title)}
                  className="group relative flex-shrink-0 w-[140px] rounded-xl overflow-hidden bg-card border border-border hover:border-primary/40 transition-all duration-300 text-left hover:shadow-lg hover:shadow-primary/5"
                >
                  {movie.poster ? (
                    <img src={movie.poster} alt={movie.title} className="w-full h-[200px] object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  ) : (
                    <div className="w-full h-[200px] bg-muted flex items-center justify-center text-muted-foreground text-xs">No Poster</div>
                  )}
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-foreground truncate">{movie.title}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-muted-foreground">{movie.year}</span>
                      {movie.rating !== 'N/A' && (
                        <span className="text-[10px] text-amber-400 font-medium">⭐ {movie.rating}</span>
                      )}
                    </div>
                  </div>
                  {/* Reason overlay */}
                  <div className="absolute inset-0 bg-background/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center p-4">
                    <p className="text-xs text-foreground/90 text-center leading-relaxed">{movie.reason}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
