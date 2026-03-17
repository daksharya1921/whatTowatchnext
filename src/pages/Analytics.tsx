import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Globe, Film, Loader2, TrendingUp, MousePointerClick } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import UserMenu from '@/components/UserMenu';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ClickRow {
  id: string;
  movie_title: string;
  imdb_id: string | null;
  provider_name: string;
  region: string | null;
  user_id: string | null;
  created_at: string;
}

const BRAND_SHADES = [
  '#E50914', // Primary Red
  '#B81D24', // Darker Red
  '#831010', // Deep Red
  '#FF2E39', // Light Red
  '#991B1B', // Red-800
  '#7F1D1D', // Red-900
  '#DC2626', // Red-600
  '#EF4444', // Red-500
];

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="bg-[#2A2A2A] border border-[var(--border)] rounded-xl p-6 space-y-3">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-[var(--primary)]" />
        <span className="text-xs uppercase font-bold tracking-widest text-gray-400">{label}</span>
      </div>
      <p className="text-4xl font-display font-bold text-white tracking-tight">{value}</p>
    </div>
  );
}

function HorizontalBarChart({ data, title }: { data: { name: string; count: number }[]; title: string }) {
  if (!data.length) {
    return (
      <div className="bg-[#2A2A2A] border border-[var(--border)] rounded-xl p-8 text-center">
        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">{title}: No data yet</p>
      </div>
    );
  }

  return (
    <div className="bg-[#2A2A2A] border border-[var(--border)] rounded-xl p-6">
      <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 40)}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
          <XAxis type="number" tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fill: '#D1D5DB', fontSize: 12, fontWeight: 'bold' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: '#1A1A1A',
              border: '1px solid #333333',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontWeight: 'bold'
            }}
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={BRAND_SHADES[i % BRAND_SHADES.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function RecentClicksTable({ clicks }: { clicks: ClickRow[] }) {
  return (
    <div className="bg-[#2A2A2A] border border-[var(--border)] rounded-xl p-6 overflow-x-auto">
      <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">
        Recent Clicks
      </h3>
      {clicks.length === 0 ? (
        <p className="text-gray-500 font-bold text-sm text-center py-8">No clicks recorded yet</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left text-xs uppercase tracking-widest text-gray-400 font-bold pb-3 pr-4">Movie</th>
              <th className="text-left text-xs uppercase tracking-widest text-gray-400 font-bold pb-3 pr-4">Provider</th>
              <th className="text-left text-xs uppercase tracking-widest text-gray-400 font-bold pb-3 pr-4">Region</th>
              <th className="text-left text-xs uppercase tracking-widest text-gray-400 font-bold pb-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {clicks.map((click) => (
              <tr key={click.id} className="border-b border-[#333333] last:border-0 hover:bg-[#333333] transition-colors">
                <td className="text-white font-bold py-3 pr-4 max-w-[200px] truncate">{click.movie_title}</td>
                <td className="text-gray-300 py-3 pr-4">{click.provider_name}</td>
                <td className="text-gray-400 py-3 pr-4">{click.region || 'US'}</td>
                <td className="text-gray-500 py-3 whitespace-nowrap text-xs">
                  {new Date(click.created_at).toLocaleDateString()} {new Date(click.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function Analytics() {
  const { user } = useAuth();
  const [clicks, setClicks] = useState<ClickRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchClicks = async () => {
      const { data, error } = await supabase
        .from('streaming_clicks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      if (!error && data) {
        setClicks(data as unknown as ClickRow[]);
      }
      setLoading(false);
    };
    fetchClicks();
  }, [user]);

  const byProvider = useMemo(() => {
    const map = new Map<string, number>();
    clicks.forEach(c => map.set(c.provider_name, (map.get(c.provider_name) || 0) + 1));
    return [...map.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [clicks]);

  const byRegion = useMemo(() => {
    const map = new Map<string, number>();
    clicks.forEach(c => {
      const r = c.region || 'US';
      map.set(r, (map.get(r) || 0) + 1);
    });
    return [...map.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [clicks]);

  const byMovie = useMemo(() => {
    const map = new Map<string, number>();
    clicks.forEach(c => map.set(c.movie_title, (map.get(c.movie_title) || 0) + 1));
    return [...map.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [clicks]);

  const uniqueProviders = useMemo(() => new Set(clicks.map(c => c.provider_name)).size, [clicks]);
  const uniqueRegions = useMemo(() => new Set(clicks.map(c => c.region || 'US')).size, [clicks]);

  if (!user) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="relative min-h-screen bg-[var(--background)]">
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="bg-[#2A2A2A] border border-[var(--border)] rounded-xl p-8 text-center max-w-sm shadow-2xl">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-[var(--primary)]" />
            <h2 className="text-2xl font-display font-bold text-white mb-2 tracking-tight">Sign In Required</h2>
            <p className="text-gray-400 text-sm mb-8">Analytics are available for authenticated users.</p>
            <Link to="/auth" className="inline-block bg-[var(--primary)] text-white px-8 py-3 font-bold text-sm hover:bg-red-700 transition-colors rounded">
              Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="relative min-h-screen bg-[var(--background)]">
      <div className="relative z-10">
        <nav className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-center">
          <Link to="/" className="text-gray-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
            ← Back
          </Link>
          <UserMenu />
        </nav>

        <header className="pt-24 pb-12 px-6 text-center max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5 text-[var(--primary)]" />
            <span className="text-sm font-bold uppercase tracking-widest text-gray-400">
              Affiliate Analytics
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight mb-4 tracking-tight">
            Click Metrics
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Track streaming provider clicks by platform, region, and movie title.
          </p>
        </header>

        <main className="max-w-6xl mx-auto px-6 pb-20">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-20 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" />
              <span className="font-bold">Loading analytics…</span>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              {/* Summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={MousePointerClick} label="Total Clicks" value={clicks.length} />
                <StatCard icon={TrendingUp} label="Providers" value={uniqueProviders} />
                <StatCard icon={Globe} label="Regions" value={uniqueRegions} />
                <StatCard icon={Film} label="Movies" value={new Set(clicks.map(c => c.movie_title)).size} />
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <HorizontalBarChart data={byProvider} title="Clicks by Provider" />
                <HorizontalBarChart data={byRegion} title="Clicks by Region" />
              </div>

              {/* Top movies chart */}
              <HorizontalBarChart data={byMovie} title="Most Clicked Movies" />

              {/* Recent clicks table */}
              <RecentClicksTable clicks={clicks.slice(0, 20)} />
            </motion.div>
          )}
        </main>

        <footer className="text-center py-8">
          <p className="text-gray-500 text-xs">
            © 2026 WhatToWatchNext
          </p>
        </footer>
      </div>
    </motion.div>
  );
}
