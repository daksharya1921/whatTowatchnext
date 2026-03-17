import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface Suggestion {
  title: string;
  year: string;
  poster: string;
  imdbRating: string;
}

interface MovieSearchProps {
  onSearch?: (query: string) => void;
  isLoading?: boolean;
}

export default function MovieSearch({ onSearch, isLoading: externalLoading }: MovieSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }

      setIsSearching(true);
      try {
        const { data, error } = await supabase.functions.invoke('analyze-movie', {
          body: { query: query.trim(), quickSearch: true },
        });

        if (!error && data?.suggestions) {
          setSuggestions(data.suggestions.slice(0, 5));
          setShowDropdown(true);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setShowDropdown(false);
    if (onSearch) {
      onSearch(trimmed);
    } else {
      navigate(`/movie/${encodeURIComponent(trimmed)}`);
    }
  };

  const handleSelect = (title: string) => {
    setQuery('');
    setSuggestions([]);
    setShowDropdown(false);
    navigate(`/movie/${encodeURIComponent(title)}`);
  };

  return (
    <div className="relative w-full max-w-md mx-auto" ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="relative flex items-center group">
        <div className="relative flex items-center w-full bg-[#1A1A1A] border border-white/10 focus-within:border-white/30 focus-within:bg-[#2A2A2A] transition-all duration-300 overflow-hidden h-10 rounded-full px-4">
          <Search className="w-4 h-4 text-gray-400 group-focus-within:text-white transition-colors mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim().length >= 2 && setShowDropdown(true)}
            placeholder="Titles, people, genres"
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-sm h-full w-full py-2"
          />
          {(isSearching || externalLoading) && (
            <Loader2 className="w-4 h-4 text-[var(--primary)] animate-spin" />
          )}
        </div>
      </form>

      <AnimatePresence>
        {showDropdown && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 backdrop-blur-xl"
          >
            <div className="py-2">
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(item.title)}
                  className="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 transition-colors text-left group"
                >
                  <div className="w-10 h-14 bg-[#2A2A2A] rounded overflow-hidden shrink-0 border border-white/5">
                    {item.poster ? (
                      <img src={item.poster} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Search className="w-full h-full p-3 text-gray-700" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate group-hover:text-[var(--primary)] transition-colors">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{item.year}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-700" />
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        {item.imdbRating}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
