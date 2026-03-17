import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * Redirects authenticated users to onboarding if they haven't completed it.
 * Use on protected pages (Index, Watchlist, etc.)
 */
export function useOnboardingCheck() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading || !user) return;

    const skipPaths = ['/auth', '/auth/callback', '/reset-password'];
    if (skipPaths.some((p) => location.pathname.startsWith(p))) return;

    const check = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_complete')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile && !profile.onboarding_complete) {
        navigate('/auth?step=onboarding', { replace: true });
      }
    };
    check();
  }, [user, loading, location.pathname, navigate]);
}
