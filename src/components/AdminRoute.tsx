import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ShieldX } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--void)]">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--gold-text)' }} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="relative min-h-screen">
        <div className="grain" />
        <div className="dot-grid" />
        <div className="bg-glow" />
        <div className="vignette" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
          <div className="panel p-10 text-center max-w-sm space-y-4">
            <ShieldX className="w-12 h-12 mx-auto" style={{ color: 'var(--red)' }} />
            <h2 className="text-2xl font-display italic text-[var(--cream)]">Access Denied</h2>
            <p className="text-[var(--cream-30)] text-sm font-mono">
              This page is restricted to administrators.
            </p>
            <Link
              to="/"
              className="inline-block mt-4 text-[var(--gold-text)] text-xs uppercase tracking-widest hover:text-[var(--gold-hi)] transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
