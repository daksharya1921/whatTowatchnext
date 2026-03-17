import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, Bookmark, Scale, BarChart3, Shield, MessageCircle, Search } from 'lucide-react';
import { toast } from 'sonner';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import MovieSearch from '@/components/MovieSearch';
import logo from '@/assets/whattowatch-logo.png';

export default function UserMenu() {
  const { user, isAdmin, signOut } = useAuth();

  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast.success('Signed out');
  };

  const handleSearch = (query: string) => {
    navigate(`/movie/${encodeURIComponent(query)}`);
  };

  const rightActions = (
    <div className="flex items-center gap-4 text-sm font-medium">
      <Link to="/compare" className="hidden sm:flex items-center gap-2 text-[var(--theme-muted)] hover:text-white transition-colors">
        <Scale className="w-4 h-4" /> Compare
      </Link>
      <Link to="/contact" className="hidden sm:flex items-center gap-2 text-[var(--theme-muted)] hover:text-white transition-colors">
        <MessageCircle className="w-4 h-4" /> Contact
      </Link>
      
      {!user ? (
        <>
          <ThemeSwitcher />
          <Link to="/auth" className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-md hover:bg-[var(--gold-hi)] transition-colors font-bold">
            Sign In
          </Link>
        </>
      ) : (
        <>
          {isAdmin && (
            <>
              <Link to="/analytics" className="hidden lg:flex items-center gap-2 text-[var(--theme-muted)] hover:text-white transition-colors">
                <BarChart3 className="w-4 h-4" /> Analytics
              </Link>
              <Link to="/admin" className="hidden lg:flex items-center gap-2 text-[var(--theme-muted)] hover:text-white transition-colors">
                <Shield className="w-4 h-4" /> Admin
              </Link>
            </>
          )}
          <Link to="/watchlist" className="flex items-center gap-2 text-[var(--theme-muted)] hover:text-white transition-colors">
            <Bookmark className="w-4 h-4" /> Watchlist
          </Link>
          <ThemeSwitcher />
          <button onClick={handleSignOut} className="flex items-center gap-2 text-[var(--theme-muted)] hover:text-[var(--red)] transition-colors" aria-label="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 xl:px-12 py-4 bg-black/80 backdrop-blur-lg border-b border-[var(--border)] transition-all">
      {/* Left: Logo */}
      <Link to="/" className="flex items-center gap-3 hover:scale-105 transition-transform duration-300">
        <img src={logo} alt="WhatToWatchNext" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
        <span className="text-xl md:text-2xl font-display font-bold text-white hidden sm:block tracking-wide">
          <span className="text-[var(--primary)]">W</span>hatToWatchNext
        </span>
      </Link>

      {/* Center: Search */}
      <div className="flex-1 max-w-xl mx-8 hidden md:block">
        <MovieSearch onSearch={handleSearch} isLoading={false} />
      </div>

      {/* Right: Actions */}
      {rightActions}
    </nav>
  );
}

