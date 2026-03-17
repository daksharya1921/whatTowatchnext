import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Loader2, UserPlus, Trash2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import UserMenu from '@/components/UserMenu';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface ProfileWithRoles {
  user_id: string;
  display_name: string | null;
  roles: AppRole[];
}

const ROLE_OPTIONS: AppRole[] = ['admin', 'moderator', 'user'];

export default function AdminPanel() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<ProfileWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    const [profilesRes, rolesRes] = await Promise.all([
      supabase.from('profiles').select('user_id, display_name'),
      supabase.from('user_roles').select('user_id, role'),
    ]);

    if (profilesRes.error || rolesRes.error) {
      toast.error('Failed to load users');
      setLoading(false);
      return;
    }

    const roleMap = new Map<string, AppRole[]>();
    (rolesRes.data || []).forEach((r) => {
      const existing = roleMap.get(r.user_id) || [];
      existing.push(r.role);
      roleMap.set(r.user_id, existing);
    });

    const merged: ProfileWithRoles[] = (profilesRes.data || []).map((p) => ({
      user_id: p.user_id,
      display_name: p.display_name,
      roles: roleMap.get(p.user_id) || [],
    }));

    setProfiles(merged);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const assignRole = async (userId: string, role: AppRole) => {
    setActionLoading(`${userId}-${role}-add`);
    const { error } = await supabase.from('user_roles').insert({ user_id: userId, role });
    if (error) {
      toast.error(error.message.includes('duplicate') ? 'Role already assigned' : 'Failed to assign role');
    } else {
      toast.success(`Assigned ${role} role`);
      await fetchData();
    }
    setActionLoading(null);
  };

  const revokeRole = async (userId: string, role: AppRole) => {
    if (userId === user?.id && role === 'admin') {
      toast.error("You can't revoke your own admin role");
      return;
    }
    setActionLoading(`${userId}-${role}-del`);
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);
    if (error) {
      toast.error('Failed to revoke role');
    } else {
      toast.success(`Revoked ${role} role`);
      await fetchData();
    }
    setActionLoading(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="relative min-h-screen bg-[var(--background)]"
    >
      <div className="relative z-10">
        <nav className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-center">
          <Link to="/" className="text-gray-400 hover:text-white transition-colors text-xs uppercase font-bold tracking-widest">
            ← Back
          </Link>
          <UserMenu />
        </nav>

        <header className="pt-24 pb-12 px-6 text-center max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-[var(--primary)]" />
            <span className="text-sm font-bold uppercase tracking-widest text-gray-400">
              Administration
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight mb-4 tracking-tight">
            User Roles
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Assign or revoke admin and moderator roles for registered users.
          </p>
        </header>

        <main className="max-w-4xl mx-auto px-6 pb-20">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-20 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" />
              <span className="font-bold">Loading users…</span>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="w-5 h-5 text-[var(--primary)]" />
                  <span className="text-sm uppercase tracking-widest font-bold text-[var(--primary)]">
                    {profiles.length} registered users
                  </span>
                </div>

                <div className="space-y-4">
                  {profiles.map((p) => (
                    <div
                      key={p.user_id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#2A2A2A] border border-[var(--border)] rounded-lg hover:border-gray-500 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-white font-bold text-lg truncate mb-1">
                          {p.display_name || 'Unnamed'}
                        </p>
                        <p className="text-gray-500 font-mono text-xs truncate">
                          {p.user_id === user?.id ? '(you)' : p.user_id.slice(0, 12) + '…'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Current roles */}
                        {p.roles.map((role) => (
                          <span
                            key={role}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs uppercase tracking-widest font-bold border rounded-full"
                            style={{
                              color: role === 'admin' ? 'var(--primary)' : role === 'moderator' ? '#10B981' : '#9CA3AF',
                              borderColor: role === 'admin' ? 'var(--primary)' : role === 'moderator' ? '#10B981' : '#4B5563',
                              background: role === 'admin' ? 'rgba(229, 9, 20, 0.1)' : 'transparent',
                            }}
                          >
                            {role}
                            <button
                              onClick={() => revokeRole(p.user_id, role)}
                              disabled={actionLoading === `${p.user_id}-${role}-del`}
                              className="hover:text-[var(--red)] transition-colors disabled:opacity-50"
                              title={`Revoke ${role}`}
                            >
                              {actionLoading === `${p.user_id}-${role}-del` ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                            </button>
                          </span>
                        ))}

                        {/* Add role dropdown */}
                        {ROLE_OPTIONS.filter((r) => !p.roles.includes(r)).length > 0 && (
                          <div className="relative group">
                            <button
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-widest font-bold text-gray-400 border border-dashed border-gray-600 rounded-full hover:text-white hover:border-white transition-colors"
                            >
                              <UserPlus className="w-3 h-3" />
                              Add
                            </button>
                            <div className="absolute right-0 top-full mt-2 hidden group-hover:flex flex-col bg-[#2A2A2A] border border-[var(--border)] rounded-lg shadow-xl z-10 min-w-[140px] overflow-hidden">
                              {ROLE_OPTIONS.filter((r) => !p.roles.includes(r)).map((role) => (
                                <button
                                  key={role}
                                  onClick={() => assignRole(p.user_id, role)}
                                  disabled={actionLoading === `${p.user_id}-${role}-add`}
                                  className="px-4 py-3 text-left text-xs uppercase tracking-widest font-bold text-gray-300 hover:text-white hover:bg-[var(--primary)] transition-colors disabled:opacity-50"
                                >
                                  {actionLoading === `${p.user_id}-${role}-add` ? (
                                    <Loader2 className="w-3 h-3 animate-spin inline mr-2" />
                                  ) : null}
                                  {role}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
