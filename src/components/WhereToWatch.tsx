import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, MonitorPlay, Globe, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface WatchProvider {
  id: number;
  name: string;
  logo: string | null;
}

interface WhereToWatchProps {
  providers: WatchProvider[];
  movieTitle: string;
  imdbId?: string;
  selectedRegion: string;
  onRegionChange?: (region: string) => void;
  isLoadingRegion?: boolean;
}

// Expanded affiliate link map — add your affiliate tags/IDs here
const PROVIDER_LINKS: Record<number, string> = {
  // Major streaming
  8:    'https://www.netflix.com/',                                        // Netflix
  9:    'https://www.amazon.com/gp/video/offers?tag=whattowatch-20',       // Amazon Prime Video
  119:  'https://www.amazon.com/gp/video/offers?tag=whattowatch-20',       // Amazon Prime Video (alt ID)
  10:   'https://www.amazon.com/gp/video/offers?tag=whattowatch-20',       // Amazon Video
  337:  'https://www.disneyplus.com/',                                     // Disney+
  384:  'https://tv.apple.com/',                                           // Apple TV+
  350:  'https://tv.apple.com/',                                           // Apple TV
  2:    'https://tv.apple.com/',                                           // Apple iTunes
  15:   'https://www.hulu.com/',                                           // Hulu
  1899: 'https://www.max.com/',                                            // Max (HBO)
  387:  'https://www.peacocktv.com/',                                      // Peacock
  386:  'https://www.peacocktv.com/',                                      // Peacock Premium
  531:  'https://www.paramountplus.com/',                                  // Paramount+
  283:  'https://www.crunchyroll.com/',                                    // Crunchyroll

  // Additional platforms
  3:    'https://play.google.com/store/movies',                            // Google Play Movies
  192:  'https://www.youtube.com/movies',                                  // YouTube Premium
  188:  'https://www.youtube.com/movies',                                  // YouTube (rent/buy)
  11:   'https://www.mubi.com/',                                           // MUBI
  175:  'https://www.vudu.com/',                                           // Vudu
  7:    'https://www.vudu.com/',                                           // Vudu (alt)
  37:   'https://www.showtime.com/',                                       // Showtime
  73:   'https://tubitv.com/',                                              // Tubi
  300:  'https://pluto.tv/',                                                // Pluto TV
  257:  'https://www.fubo.tv/',                                             // fuboTV
  215:  'https://www.hoopladigital.com/',                                   // Hoopla
  100: 'https://www.guidebox.com/',                                         // GuideBox
  546:  'https://www.wowpresentsplus.com/',                                // WOW Presents Plus
  551:  'https://www.britbox.com/',                                        // BritBox
  526:  'https://www.amcplus.com/',                                        // AMC+
  1770: 'https://www.pbs.org/show/',                                       // PBS
  207:  'https://www.roku.com/en-us/the-roku-channel',                     // The Roku Channel
  613:  'https://www.freevee.com/',                                        // Freevee
  442:  'https://www.starz.com/',                                          // Starz
  43:   'https://www.starz.com/',                                          // Starz (alt)
  
  // International
  39:   'https://www.now.com/',                                            // Now TV (UK)
  29:   'https://www.sky.com/watch',                                       // Sky Go (UK)
  30:   'https://www.sky.com/watch',                                       // Sky Store (UK)
  20:   'https://www.stan.com.au/',                                        // Stan (AU)
  21:   'https://bfrb.com/',                                               // Binge (AU)
  1024: 'https://www.primevideo.com/',                                     // Amazon Prime (intl)
  68:   'https://www.microsoft.com/en-us/store/movies-and-tv',             // Microsoft Store
  27:   'https://www.hayu.com/',                                           // Hayu
  34:   'https://www.mgmplus.com/',                                        // MGM+
  1796: 'https://www.netflix.com/',                                        // Netflix basic with Ads
  1853: 'https://tv.rakuten.co.jp/',                                       // Rakuten TV
};

const REGIONS = [
  { code: 'US', label: '🇺🇸 United States' },
  { code: 'GB', label: '🇬🇧 United Kingdom' },
  { code: 'CA', label: '🇨🇦 Canada' },
  { code: 'AU', label: '🇦🇺 Australia' },
  { code: 'DE', label: '🇩🇪 Germany' },
  { code: 'FR', label: '🇫🇷 France' },
  { code: 'IN', label: '🇮🇳 India' },
  { code: 'JP', label: '🇯🇵 Japan' },
  { code: 'BR', label: '🇧🇷 Brazil' },
  { code: 'MX', label: '🇲🇽 Mexico' },
  { code: 'ES', label: '🇪🇸 Spain' },
  { code: 'IT', label: '🇮🇹 Italy' },
  { code: 'KR', label: '🇰🇷 South Korea' },
  { code: 'SE', label: '🇸🇪 Sweden' },
  { code: 'NL', label: '🇳🇱 Netherlands' },
];

function getProviderLink(provider: WatchProvider, movieTitle: string): string {
  if (PROVIDER_LINKS[provider.id]) return PROVIDER_LINKS[provider.id];
  return `https://www.google.com/search?q=${encodeURIComponent(`watch "${movieTitle}" on ${provider.name}`)}`;
}

export default function WhereToWatch({ providers, movieTitle, imdbId, selectedRegion, onRegionChange, isLoadingRegion }: WhereToWatchProps) {
  const { user } = useAuth();

  const handleRegionChange = (newRegion: string) => {
    onRegionChange?.(newRegion);
  };

  const trackClick = async (providerName: string) => {
    try {
      await supabase.from('streaming_clicks').insert({
        movie_title: movieTitle,
        imdb_id: imdbId || null,
        provider_name: providerName,
        region: selectedRegion,
        user_id: user?.id || null,
      } as any);
    } catch (err) {
      console.error('Click tracking failed:', err);
    }
  };

  const currentRegionLabel = REGIONS.find(r => r.code === selectedRegion)?.label || selectedRegion;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel p-6 md:p-8"
    >
      {/* Header with region selector */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3 flex-1">
          <MonitorPlay className="w-5 h-5" style={{ color: 'var(--gold-text)' }} />
          <h3 className="text-xs uppercase tracking-[0.3em] font-mono" style={{ color: 'var(--gold-text)' }}>
            Where to Watch
          </h3>
          <div className="h-px flex-1 bg-[var(--border)] hidden sm:block" />
        </div>

        <div className="relative flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-[var(--cream-30)]" />
          <select
            value={selectedRegion}
            onChange={(e) => handleRegionChange(e.target.value)}
            disabled={isLoadingRegion}
            className="bg-[var(--deep)] border border-[var(--border)] text-[var(--cream)] text-xs font-mono py-1.5 pl-2 pr-6 appearance-none cursor-pointer hover:border-[var(--border-hi)] focus:border-[var(--gold-hi)] focus:outline-none transition-colors"
          >
            {REGIONS.map(r => (
              <option key={r.code} value={r.code}>{r.label}</option>
            ))}
          </select>
          {isLoadingRegion && (
            <Loader2 className="w-3.5 h-3.5 animate-spin absolute right-1.5" style={{ color: 'var(--gold-text)' }} />
          )}
        </div>
      </div>

      {/* Provider grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedRegion}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {providers.length > 0 ? providers.map((provider) => (
            <a
              key={provider.id}
              href={getProviderLink(provider, movieTitle)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick(provider.name)}
              className="group flex items-center gap-4 bg-[var(--cream-06)] hover:bg-[var(--cream-12)] border border-[var(--border)] hover:border-[var(--border-hi)] px-5 py-4 transition-all duration-300"
            >
              {provider.logo ? (
                <img
                  src={provider.logo}
                  alt={provider.name}
                  className="w-10 h-10 rounded-lg object-contain shrink-0"
                  loading="lazy"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-[var(--deep)] flex items-center justify-center shrink-0">
                  <MonitorPlay className="w-5 h-5" style={{ color: 'var(--gold-lo)' }} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="block text-[var(--cream)] text-sm font-bold truncate group-hover:text-[var(--gold-text)] transition-colors">
                  {provider.name}
                </span>
                <span className="text-[var(--cream-30)] text-[10px] uppercase tracking-widest font-mono">
                  Watch Now
                </span>
              </div>
              <ExternalLink className="w-4 h-4 text-[var(--cream-30)] group-hover:text-[var(--gold-text)] transition-colors shrink-0" />
            </a>
          )) : (
            <div className="col-span-full bg-[var(--cream-06)] border border-[var(--border)] px-5 py-6 text-center">
              <p className="text-[var(--cream-30)] text-xs font-mono uppercase tracking-widest">
                No streaming providers found for this region yet.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <p className="mt-4 text-[var(--cream-12)] text-[10px] font-mono text-center uppercase tracking-widest">
        Availability for {currentRegionLabel} · Data via TMDB
      </p>
    </motion.div>
  );
}

export type { WatchProvider };
