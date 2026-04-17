import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Still up';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 22) return 'Good evening';
  return 'Good night';
}

export default function PersonalGreeting() {
  const { user } = useAuth();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setName(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('username, display_name')
        .eq('user_id', user.id)
        .maybeSingle();
      if (cancelled) return;
      const raw =
        data?.username ||
        data?.display_name ||
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        null;
      // Take first word, capitalize
      if (raw) {
        const first = String(raw).trim().split(/\s+/)[0];
        setName(first.charAt(0).toUpperCase() + first.slice(1));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user || !name) return null;

  return (
    <motion.p
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-sm md:text-base font-medium text-muted-foreground mb-3"
    >
      {getTimeGreeting()},{' '}
      <span className="text-foreground font-semibold">{name}</span> 👋
    </motion.p>
  );
}
