import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = new URLSearchParams(location.search).get('code');

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          const { error } = await supabase.auth.getSession();
          if (error) throw error;
        }

        // Small delay to allow the DB trigger to create the profile row
        await new Promise((r) => setTimeout(r, 500));

        // Check if user needs onboarding
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_complete')
            .eq('user_id', user.id)
            .maybeSingle();

          // New user (no profile or onboarding not complete) → onboarding
          if (!profile || !profile.onboarding_complete) {
            navigate('/auth?step=onboarding', { replace: true });
            return;
          }
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        // On error, still send to home rather than leaving user on blank page
      }
      navigate('/', { replace: true });
    };

    handleCallback();
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--gold)' }} />
    </div>
  );
}
