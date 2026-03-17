import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, Film, Tv, RefreshCw } from 'lucide-react';
import ScrollableRow from './ScrollableRow';
import MovieCarouselSkeleton from './MovieCarouselSkeleton';

interface DiscoverItem {
  id: number;
  title: string;
  year: string;
  poster: string | null;
  rating: string;
  mediaType: 'movie' | 'tv';
  overview: string;
}

const MOODS = [
  { key: 'happy', emoji: '😊', label: 'Happy' },
  { key: 'sad', emoji: '😢', label: 'Sad' },
  { key: 'mind-bending', emoji: '🤯', label: 'Mind-Bending' },
  { key: 'thriller', emoji: '😱', label: 'Thriller' },
  { key: 'funny', emoji: '😂', label: 'Funny' },
  { key: 'romantic', emoji: '😍', label: 'Romantic' },
  { key: 'chill', emoji: '😴', label: 'Chill' },
  { key: 'action', emoji: '🔥', label: 'Action' },
];

const QUICK_BUTTONS = [
  { key: 'surprise', emoji: '🎲', label: 'Surprise Me' },
  { key: 'tonight', emoji: '🌙', label: 'Movie for Tonight' },
  { key: 'binge', emoji: '🍿', label: 'Weekend Binge' },
];

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  items: DiscoverItem[];
  timestamp: number;
}

interface WhatToWatchProps {
  onSelect: (title: string) => void;
}

export default function WhatToWatch({ onSelect }: WhatToWatchProps) {
  const [results, setResults] = useState<DiscoverItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [resultLabel, setResultLabel] = useState('');
  const cacheRef = useRef<Record<string, CacheEntry>>({});

  const fetchDiscover = useCallback(async (mode: string, mood?: string, forceRefresh = false) => {
    const key = mood || mode;

    // Check cache (skip for surprise since it should always be random)
    if (!forceRefresh && mode !== 'surprise') {
      const cached = cacheRef.current[key];
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setResults(cached.items);
        setActiveKey(key);
        setLabel(mode, mood);
        return;
      }
    }

    setLoading(true);
    setActiveKey(key);
    setResults([]);

    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/discover-movies`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ mode, mood }),
        }
      );
      const data = await res.json();
      const items = data.items || [];
      setResults(items);

      // Cache the result (except surprise)
      if (mode !== 'surprise') {
        cacheRef.current[key] = { items, timestamp: Date.now() };
      }

      setLabel(mode, mood);
    } catch (err) {
      console.error('Discover fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const setLabel = (mode: string, mood?: string) => {
    if (mode === 'surprise') setResultLabel('🎲 Your Random Pick');
    else if (mode === 'tonight') setResultLabel('🌙 Tonight\'s Pick');
    else if (mode === 'binge') setResultLabel('🍿 Binge-Worthy Series');
    else {
      const m = MOODS.find((m) => m.key === mood);
      setResultLabel(`${m?.emoji || ''} ${m?.label || 'Mood'} Picks`);
    }
  };

  // Auto-fetch trending mood on page load
  useEffect(() => {
    fetchDiscover('mood', 'action');
  }, [fetchDiscover]);

  const handleRefresh = () => {
    if (!activeKey || loading) return;
    // Determine original mode/mood
    const quickBtn = QUICK_BUTTONS.find((b) => b.key === activeKey);
    if (quickBtn) {
      fetchDiscover(quickBtn.key, undefined, true);
    } else {
      fetchDiscover('mood', activeKey, true);
    }
  };

  const handleQuickClick = (key: string) => {
    // Always fetch fresh for surprise; toggle off if same key clicked
    if (key === 'surprise') {
      fetchDiscover(key, undefined, true);
      return;
    }
    if (activeKey === key && results.length > 0) {
      setActiveKey(null);
      setResults([]);
      return;
    }
    fetchDiscover(key);
  };

  const handleMoodClick = (moodKey: string) => {
    // Always fetch fresh for mood clicks
    fetchDiscover('mood', moodKey, true);
  };

  return (
    <section className="space-y-6">
      {/* Section heading */}
      <div className="flex items-center gap-3">
        <Sparkles className="w-6 h-6 text-[var(--primary)]" />
        <h2 className="text-xl md:text-2xl font-bold text-white">What Should I Watch?</h2>
      </div>

      {/* Quick discovery buttons */}
      <div className="flex flex-wrap gap-2">
        {QUICK_BUTTONS.map((btn) => (
          <button
            key={btn.key}
            onClick={() => handleQuickClick(btn.key)}
            disabled={loading}
            className={`
              flex items-center gap-2 px-4 py-2 border rounded-full text-xs font-bold transition-all duration-300
              ${activeKey === btn.key
                ? 'bg-white text-black border-transparent'
                : 'bg-transparent border-[var(--border)] text-gray-300 hover:border-white hover:text-white'
              }
              disabled:opacity-50
            `}
          >
            <span className="text-base">{btn.emoji}</span>
            {btn.label}
          </button>
        ))}
      </div>

      {/* Mood chips */}
      <div className="flex flex-wrap gap-2">
        {MOODS.map((mood) => (
          <button
            key={mood.key}
            onClick={() => handleMoodClick(mood.key)}
            disabled={loading}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs font-bold transition-all duration-300
              ${activeKey === mood.key
                ? 'bg-white text-black border-transparent'
                : 'bg-transparent border-[var(--border)] text-gray-400 hover:border-white hover:text-white'
              }
              disabled:opacity-50
            `}
          >
            <span className="text-sm">{mood.emoji}</span>
            {mood.label}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-2">
          <MovieCarouselSkeleton />
        </div>
      )}

      {/* Results */}
      <AnimatePresence mode="wait">
        {!loading && results.length > 0 && (
          <motion.div
            key={activeKey}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">
                {resultLabel}
              </span>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-1 text-gray-500 hover:text-white transition-colors disabled:opacity-50"
                title="Refresh recommendations"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <ScrollableRow>
              {results.map((item, i) => (
                <motion.div
                  key={item.id}
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
                        <p className="text-gray-300 text-xs truncate drop-shadow-md">{item.year}</p>
                        <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white shadow-lg hover:bg-white hover:text-[var(--primary)] transition-colors">
                          <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                      </div>
                    </div>
                  </button>
                </motion.div>
              ))}
            </ScrollableRow>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
