import { motion } from 'framer-motion';
import { Film, Play, Globe, Bookmark, BookmarkCheck, Tv } from 'lucide-react';

interface MovieData {
  title: string;
  year: string;
  rated: string;
  runtime: string;
  genre: string;
  director: string;
  actors: string;
  actorName?: string;
  actressName?: string;
  plot: string;
  poster: string | null;
  imdbRating: string;
  imdbVotes: string;
  imdbID?: string;
  country: string;
  awards: string;
  language: string;
  boxOffice: string;
  trailerUrl: string;
  mediaType?: 'movie' | 'tv';
  isAnime?: boolean;
  seasons?: string;
  episodes?: string;
  watchProviders?: { id: number; name: string; logo: string | null }[];
}

interface MovieCardProps {
  data: MovieData;
  isInWatchlist?: boolean;
  onToggleWatchlist?: () => void;
}

export default function MovieCard({ data, isInWatchlist, onToggleWatchlist }: MovieCardProps) {
  const isTv = data.mediaType === 'tv';
  const isAnime = data.isAnime === true;
  const MediaIcon = isTv ? Tv : Film;
  const typeLabel = isAnime ? 'Anime' : isTv ? 'Series' : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full overflow-hidden bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl p-6 md:p-10 transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]"
    >
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative z-10">
        {/* Poster */}
        <div className="relative shrink-0 w-full lg:w-[360px] aspect-[2/3] group/poster rounded-lg overflow-hidden shadow-2xl">
          <div className="relative w-full h-full border border-[var(--border-hi)] overflow-hidden shadow-2xl">
            {data.poster ? (
              <img
                src={data.poster}
                alt={data.title}
                className="w-full h-full object-cover grayscale-[0.3] group-hover/poster:grayscale-0 group-hover/poster:scale-105 transition-all duration-700"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--deep)]">
                <MediaIcon className="w-12 h-12 opacity-30 mb-2" style={{ color: 'var(--gold-lo)' }} />
                <span className="text-[var(--cream-30)] text-[10px] uppercase tracking-[0.2em]">Missing Archive</span>
              </div>
            )}
            {/* Rating badge */}
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded text-xs font-bold text-white shadow-lg">
              ★ {data.imdbRating}
            </div>
            {/* Media type badge */}
            {typeLabel && (
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white flex items-center gap-1 shadow-lg">
                {isTv ? <Tv className="w-4 h-4" /> : null} {typeLabel}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-center space-y-8">
          <div>
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight mb-2">
              {data.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm mb-6 font-medium">
              <span>{data.year}</span>
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <span className="border border-gray-600 px-1.5 py-0.5 rounded text-xs">{data.rated || 'NR'}</span>
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <span>{data.runtime}</span>
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <span>{data.genre.split(',')[0]}</span>
            </div>
            <p className="text-gray-400 text-sm mb-2">
              <span className="text-white font-medium">{isTv ? 'Created by:' : 'Directed by:'}</span> {data.director}
            </p>
          </div>

          {/* Synopsis */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white">Overview</h3>
            <p className="text-gray-300 text-base md:text-lg leading-relaxed">
              {data.plot}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <motion.a
              href={data.trailerUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group/btn flex items-center gap-2 bg-white text-black px-6 md:px-8 py-3 rounded font-bold hover:bg-white/90 transition-colors shadow-lg hover:shadow-xl"
            >
              <Play className="w-5 h-5 fill-black group-hover/btn:scale-110 transition-transform" />
              <span>Watch Trailer</span>
            </motion.a>

            {onToggleWatchlist && (
              <motion.button
                onClick={onToggleWatchlist}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-6 md:px-8 py-3 rounded font-bold transition-all duration-300 ${
                  isInWatchlist
                    ? 'bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/30'
                    : 'bg-[#2A2A2A] text-white hover:bg-[#3A3A3A]'
                }`}
              >
                <motion.span
                  key={isInWatchlist ? 'check' : 'add'}
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {isInWatchlist ? (
                    <BookmarkCheck className="w-5 h-5" />
                  ) : (
                    <Bookmark className="w-5 h-5" />
                  )}
                </motion.span>
                <span>
                  {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                </span>
              </motion.button>
            )}
          </div>

          <div className="flex items-center gap-3 text-gray-500 pt-2">
            <Globe className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-widest">{data.language} / {data.country}</span>
          </div>

          {/* Cast */}
          <div className="pt-6 border-t border-[var(--border)]">
            <h3 className="text-white text-sm font-bold mb-2">Starring</h3>
            <div className="text-gray-400 text-sm leading-relaxed">
              {data.actors}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export type { MovieData };
