import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Lock, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsRecovery(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success('Password updated! Redirecting…');
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isRecovery) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="relative min-h-screen bg-[var(--background)]">
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="bg-[#2A2A2A] border border-[var(--border)] rounded-xl p-8 md:p-12 w-full max-w-md text-center shadow-2xl">
            <h1 className="text-3xl font-display font-bold text-white mb-2 tracking-tight">Invalid Link</h1>
            <p className="text-gray-400 text-sm mb-8">This password reset link is invalid or has expired.</p>
            <Link to="/auth" className="text-white text-xs font-bold uppercase tracking-widest hover:text-[var(--primary)] transition-colors">
              Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="relative min-h-screen bg-[var(--background)]">
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 md:p-12 w-full max-w-md shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-[var(--primary)] mb-4 tracking-tight">WhatToWatchNext</h1>
            <h2 className="text-2xl font-bold text-white">Set New Password</h2>
            <p className="text-gray-400 text-sm mt-2">Enter your new password below</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full bg-[#2A2A2A] border border-[var(--border)] text-white pl-10 pr-4 py-3 text-sm focus:border-white focus:outline-none transition-colors placeholder-gray-500 rounded"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full bg-[#2A2A2A] border border-[var(--border)] text-white pl-10 pr-4 py-3 text-sm focus:border-white focus:outline-none transition-colors placeholder-gray-500 rounded"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[var(--primary)] text-white py-3 font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50 rounded"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              Update Password
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
