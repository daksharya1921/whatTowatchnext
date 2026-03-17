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
  { label: 'Feel-good', icon: Heart, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20 hover:border-green-400/50' },
  { label: 'Thrilling', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20 hover:border-yellow-400/50' },
  { label: 'Mind-bending', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20 hover:border-purple-400/50' },
  { label: 'Romantic', icon: Drama, color: 'text-pink-400', bg: 'bg-pink-400/10 border-pink-400/20 hover:border-pink-400/50' },
  { label: 'Dark & Gritty', icon: Moon, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20 hover:border-red-400/50' },
  { label: 'Epic Adventure', icon: Sword, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20 hover:border-blue-400/50' },
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
      <div className="flex items-center gap-2 mb-5">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">What's Your Mood?</h2>
        <span className="text-xs text-muted-foreground ml-1">AI-powered picks</span>
      </div>

      {/* Mood Chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {MOODS.map(({ label, icon: Icon, color, bg }) => (
          <button
            key={label}
            onClick={() => fetchMood(label)}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${bg} ${
              activeMood === label ? 'ring-2 ring-offset-1 ring-offset-background ring-primary scale-105' : ''
            } disabled:opacity-50`}
          >
            <Icon className={`w-4 h-4 ${color}`} />
            <span className="text-foreground">{label}</span>
          </button>
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
            className="flex items-center justify-center py-12 gap-3"
          >
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-muted-foreground text-sm">Finding {activeMood} picks…</span>
          </motion.div>
        )}

        {/* Results */}
        {!loading && movies.length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {movies.map((movie, idx) => (
                <motion.button
                  key={movie.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => onSelect(movie.title)}
                  className="group relative flex-shrink-0 w-36 rounded-lg overflow-hidden bg-card border border-border hover:border-primary/50 transition-all duration-200 text-left"
                >
                  {movie.poster ? (
                    <img src={movie.poster} alt={movie.title} className="w-full h-48 object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-48 bg-muted flex items-center justify-center text-muted-foreground text-xs">No Poster</div>
                  )}
                  <div className="p-2">
                    <p className="text-xs font-semibold text-foreground truncate">{movie.title}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-muted-foreground">{movie.year}</span>
                      {movie.rating !== 'N/A' && (
                        <span className="text-[10px] text-yellow-400">⭐ {movie.rating}</span>
                      )}
                    </div>
                  </div>
                  {/* Reason tooltip on hover */}
                  <div className="absolute inset-0 bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3">
                    <p className="text-xs text-foreground text-center leading-relaxed">{movie.reason}</p>
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
