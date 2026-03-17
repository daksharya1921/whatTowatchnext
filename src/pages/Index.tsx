import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import cinescopeLogo from '@/assets/whattowatch-logo.png';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, TrendingUp, Clock, Star } from 'lucide-react';
import UserMenu from '@/components/UserMenu';
import WhatToWatch from '@/components/WhatToWatch';
import TrendingMovies from '@/components/TrendingMovies';
import QuickPick from '@/components/QuickPick';
import ScrollToTop from '@/components/ScrollToTop';
import RecentlySearched from '@/components/RecentlySearched';
import MoodPicker from '@/components/MoodPicker';
import Footer from '@/components/Footer';
import { useOnboardingCheck } from '@/hooks/useOnboardingCheck';

export default function Index() {
  const navigate = useNavigate();
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  useOnboardingCheck();

  const PLACEHOLDER_TEXTS = [
    'Search "Inception"...',
    'Search "Breaking Bad"...',
    'Search "The Dark Knight"...',
    'Search "Stranger Things"...',
    'Search "Interstellar"...',
    'Search "Severance"...',
    'Search "Oppenheimer"...',
    'Search "The Bear"...',
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_TEXTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (query: string) => {
    navigate(`/movie/${encodeURIComponent(query)}`);
  };

  const GENRES = [
    'All', 'Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Romance', 'Thriller', 'Animation', 'Documentary'
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="relative min-h-screen bg-[var(--background)]"
    >
      <div className="relative z-10">
        <UserMenu />

        {/* Hero Section */}
         <header className="relative w-full h-[85vh] min-h-[600px] flex items-center">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=75" 
              alt="Featured Movie" 
              className="w-full h-full object-cover"
              fetchPriority="high"
              loading="eager"
              decoding="async"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/50 to-transparent" />
          </div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 xl:px-12 mt-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-3 mb-4"
              >
                <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-md uppercase tracking-wider animate-pulse">
                  🔥 Trending
                </span>
                <span className="text-foreground/80 text-sm font-semibold tracking-wide">
                  #1 in Movies Today
                </span>
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground leading-tight mb-2">
                What To Watch
                <span className="block text-primary">Next?</span>
              </h1>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed line-clamp-3 max-w-xl">
                AI-powered movie & series recommendations. Search any title for deep analysis, or let us pick your next obsession.
              </p>

              {/* Animated Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="mb-8"
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) handleSearch(searchQuery.trim());
                  }}
                  className="relative group"
                >
                  <motion.div
                    animate={{ 
                      boxShadow: searchFocused 
                        ? '0 0 30px hsl(var(--primary) / 0.3)' 
                        : '0 0 0px transparent' 
                    }}
                    className="relative rounded-xl overflow-hidden"
                  >
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      className="w-full bg-card/80 backdrop-blur-xl border border-border text-foreground pl-12 pr-28 py-4 text-base focus:border-primary focus:outline-none transition-all placeholder-muted-foreground rounded-xl"
                      placeholder={PLACEHOLDER_TEXTS[placeholderIndex]}
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-5 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Analyze
                    </button>
                  </motion.div>
                </form>
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-6 flex-wrap"
              >
                {[
                  { icon: TrendingUp, label: 'Trending Now', color: 'text-green-400' },
                  { icon: Star, label: 'AI Insights', color: 'text-yellow-400' },
                  { icon: Clock, label: 'Updated Daily', color: 'text-blue-400' },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span>{label}</span>
                  </div>
                ))}
              </motion.div>
              
              <div className="flex items-center gap-4 mt-6 flex-wrap">
                <Link to="/watchlist" className="flex items-center gap-2 bg-foreground text-background px-8 py-3 rounded-md font-bold hover:opacity-80 transition-opacity">
                  <Star className="w-5 h-5" />
                  My Watchlist
                </Link>
                <Link to="/compare" className="flex items-center gap-2 bg-muted text-foreground backdrop-blur-md px-8 py-3 rounded-md font-bold hover:bg-muted/80 transition-colors">
                  <TrendingUp className="w-5 h-5" />
                  Compare
                </Link>
              </div>
              
              {/* Quick Pick */}
              <div className="mt-6">
                <QuickPick onSelect={handleSearch} />
              </div>
            </motion.div>
          </div>
        </header>

        {/* Discovery Sections */}
        <main className="max-w-7xl mx-auto px-6 xl:px-12 pb-20 -mt-20 relative z-20">
          {/* Genre Filter Bar */}
          <div className="flex items-center gap-3 overflow-x-auto pb-8 no-scrollbar">
            {GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all duration-300 border ${
                  selectedGenre === genre
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background/40 text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>

          <RecentlySearched onSelect={handleSearch} />
          <MoodPicker onSelect={handleSearch} />

          <div className="space-y-16">
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <WhatToWatch onSelect={handleSearch} />
            </motion.div>
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <TrendingMovies onSelect={handleSearch} />
            </motion.div>
          </div>
        </main>

        {/* About */}
        <section className="max-w-4xl mx-auto px-6 py-20 border-t border-[var(--border)] corner-brackets">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <span className="lbl mb-4 block">
                <span className="scan-dots mr-2"><span></span><span></span><span></span></span>
                About
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-[var(--cream)] leading-tight">
                Your personal guide to <em className="italic">what's worth watching.</em>
              </h2>
            </div>
            <div className="space-y-4 text-[var(--cream-60)] font-serif text-base md:text-lg leading-relaxed">
              <p>
                WhatToWatchNext uses AI-driven sentiment analysis to cut through the noise — parsing thousands of audience reviews to surface what truly resonates with viewers.
              </p>
              <p>
                No paid placements. No algorithmic bias. Just honest, data-backed recommendations for movies and web series that are actually worth your time.
              </p>
              <p>
                Search any title for a deep-dive analysis, build your personal watchlist, compare films side by side, or let our AI recommend your next obsession based on plot descriptions you love.
              </p>
            </div>
          </div>
        </section>

        <Footer />
        <ScrollToTop />
      </div>
    </motion.div>
  );
}
