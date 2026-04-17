import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Sparkles, TrendingUp, Clock, Star, Film, Play } from 'lucide-react';
import UserMenu from '@/components/UserMenu';
import WhatToWatch from '@/components/WhatToWatch';
import TrendingMovies from '@/components/TrendingMovies';
import QuickPick from '@/components/QuickPick';
import ScrollToTop from '@/components/ScrollToTop';
import RecentlySearched from '@/components/RecentlySearched';
import MoodPicker from '@/components/MoodPicker';
import PersonalGreeting from '@/components/PersonalGreeting';
import PickedForYou from '@/components/PickedForYou';
import Footer from '@/components/Footer';
import { useOnboardingCheck } from '@/hooks/useOnboardingCheck';

export default function Index() {
  const navigate = useNavigate();
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
  }, [PLACEHOLDER_TEXTS.length]);

  const handleSearch = (query: string) => {
    navigate(`/movie/${encodeURIComponent(query)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="relative min-h-screen bg-background"
    >
      <div className="relative z-10">
        <UserMenu />

        {/* ── Hero Section ── */}
        <header className="relative w-full min-h-[90vh] flex items-center overflow-hidden">
          {/* Background image + overlays */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=75"
              alt="Cinema atmosphere"
              className="w-full h-full object-cover scale-105"
              fetchPriority="high"
              loading="eager"
              decoding="async"
            />
            {/* Layered cinematic gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-transparent h-32" />
            {/* Ambient glow */}
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
          </div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 xl:px-12 pt-32 pb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex items-center gap-3 mb-6"
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/15 text-primary text-xs font-bold rounded-full border border-primary/30 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  TRENDING
                </span>
                <span className="text-muted-foreground text-sm font-medium tracking-wide">
                  #1 in Movies Today
                </span>
              </motion.div>

              {/* Title */}
              <PersonalGreeting />
              <h1 className="font-display text-[clamp(2.8rem,6vw,5rem)] font-bold text-foreground leading-[1.05] mb-4 tracking-tight">
                What To Watch
                <span className="block bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                  Next?
                </span>
              </h1>

              <p className="text-muted-foreground text-base md:text-lg mb-10 leading-relaxed max-w-lg">
                AI-powered movie & series recommendations. Search any title for deep analysis, or let us pick your next obsession.
              </p>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7 }}
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
                        ? '0 0 0 1px hsl(var(--primary) / 0.4), 0 8px 40px -8px hsl(var(--primary) / 0.2)'
                        : '0 0 0 1px hsl(var(--border)), 0 4px 20px -4px rgba(0,0,0,0.3)',
                    }}
                    className="relative rounded-2xl overflow-hidden backdrop-blur-xl"
                  >
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10 transition-colors group-focus-within:text-primary" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      className="w-full bg-card/60 backdrop-blur-2xl border-0 text-foreground pl-14 pr-32 py-5 text-base focus:outline-none transition-all placeholder:text-muted-foreground/60 rounded-2xl"
                      placeholder={PLACEHOLDER_TEXTS[placeholderIndex]}
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold text-sm hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
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
                className="flex items-center gap-5 flex-wrap mb-8"
              >
                {[
                  { icon: TrendingUp, label: 'Trending Now' },
                  { icon: Sparkles, label: 'AI Insights' },
                  { icon: Clock, label: 'Updated Daily' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground/80">
                    <Icon className="w-3.5 h-3.5 text-primary/70" />
                    <span>{label}</span>
                  </div>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-center gap-3 flex-wrap"
              >
                <Link
                  to="/watchlist"
                  className="group flex items-center gap-2.5 bg-primary text-primary-foreground px-7 py-3.5 rounded-xl font-bold text-sm hover:brightness-110 transition-all shadow-lg shadow-primary/20"
                >
                  <Play className="w-4 h-4 transition-transform group-hover:scale-110" />
                  My Watchlist
                </Link>
                <Link
                  to="/compare"
                  className="flex items-center gap-2.5 bg-card/60 backdrop-blur-md text-foreground border border-border px-7 py-3.5 rounded-xl font-bold text-sm hover:bg-card hover:border-primary/30 transition-all"
                >
                  <Film className="w-4 h-4 text-muted-foreground" />
                  Compare
                </Link>
              </motion.div>

              {/* Quick Pick */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="mt-8"
              >
                <QuickPick onSelect={handleSearch} />
              </motion.div>
            </motion.div>
          </div>
        </header>

        {/* ── Discovery Sections ── */}
        <main className="max-w-7xl mx-auto px-6 xl:px-12 pb-24 space-y-14 relative z-20">
          <RecentlySearched onSelect={handleSearch} />
          <MoodPicker onSelect={handleSearch} />

          <div className="space-y-14">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
            >
              <WhatToWatch onSelect={handleSearch} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <TrendingMovies onSelect={handleSearch} />
            </motion.div>
          </div>
        </main>

        {/* ── About ── */}
        <section className="relative max-w-5xl mx-auto px-6 py-24">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <span className="lbl mb-5 block">
                <span className="scan-dots mr-2"><span></span><span></span><span></span></span>
                About
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-foreground leading-tight">
                Your personal guide to{' '}
                <em className="italic text-primary">what's worth watching.</em>
              </h2>
            </div>
            <div className="space-y-5 text-muted-foreground text-base md:text-lg leading-relaxed">
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
