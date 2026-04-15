import { useState, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { lovable } from '@/integrations/lovable';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Lock, ArrowRight, Loader2, User, Hash, Film, Camera, CheckCircle2, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

type AuthStep = 'auth' | 'verify' | 'onboarding';

const GENRE_OPTIONS = [
  'Action', 'Comedy', 'Drama', 'Horror', 'Romance',
  'Sci-Fi', 'Thriller', 'Fantasy', 'Documentary', 'Animation',
  'Family', 'Mystery', 'Adventure',
];

const STEPS: AuthStep[] = ['auth', 'verify', 'onboarding'];
const STEP_LABELS = ['Account', 'Verify', 'Profile'];

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<AuthStep>(() => {
    const sp = searchParams.get('step');
    return sp === 'onboarding' ? 'onboarding' : 'auth';
  });
  const [isLogin, setIsLogin] = useState(true);
  const [showOtpLogin, setShowOtpLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithOtp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const currentStepIndex = STEPS.indexOf(step);
  const progressPercent = ((currentStepIndex + 1) / STEPS.length) * 100;

  /* ─── Email Login (password) ─── */
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  /* ─── Passwordless Login (OTP) ─── */
  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await signInWithOtp(email);
      toast.success('We sent a 6-digit code to your email.');
      setStep('verify');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ─── Email Signup with OTP ─── */
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      // signUp with auto_confirm off sends a 6-digit OTP to the email
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;

      toast.success('We sent a verification code to your email.');
      setStep('verify');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ─── OTP input handling ─── */
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newDigits = [...otpDigits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);
    const nextEmpty = newDigits.findIndex((d) => !d);
    otpRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  /* ─── OTP Verification ─── */
  const handleVerifyOtp = async () => {
    const code = otpDigits.join('');
    if (code.length !== 6) {
      toast.error('Please enter the full 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: isLogin ? 'magiclink' : 'signup',
      });
      if (error) throw error;
      
      if (isLogin) {
        toast.success('Signed in successfully!');
        navigate('/');
      } else {
        toast.success('Email verified! Let\'s set up your profile.');
        setStep('onboarding');
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: isLogin ? 'email' : 'signup',
        email,
      });
      if (error) throw error;
      toast.success('New code sent! Check your email.');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to resend code.');
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let avatarUrl: string | null = null;
      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop();
        const path = `${user.id}/avatar.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from('avatars')
          .upload(path, avatarFile, { upsert: true });
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(path);
        avatarUrl = urlData.publicUrl;
      }

      // Upsert so it works whether the trigger created the profile or not
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          username: username.trim(),
          display_name: username.trim(),
          age: age ? parseInt(age) : null,
          favorite_genres: selectedGenres,
          onboarding_complete: true,
          ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
        }, { onConflict: 'user_id' });

      if (error) throw error;
      toast.success('Profile set up! Enjoy WhatToWatchNext.');
      navigate('/');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to sign in with Google. Please try again.');
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-[#2A2A2A] border border-[var(--border)] text-white pl-10 pr-4 py-3 text-sm focus:border-white focus:outline-none transition-colors placeholder-gray-500 rounded';
  const btnClass =
    'w-full flex items-center justify-center gap-2 bg-[var(--primary)] text-white py-3 font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50 rounded';

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
      className="relative min-h-screen bg-[var(--background)]"
    >
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="bg-[var(--card)] border border-[var(--border)] p-8 md:p-12 w-full max-w-md rounded-xl shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-display font-bold text-[var(--primary)] tracking-tight">WhatToWatchNext</h1>

            {step === 'auth' && (
              <>
                <h2 className="text-2xl font-bold text-white mt-4">
                  {isLogin ? 'Welcome Back' : 'Create an Account'}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {isLogin ? 'Sign in to access your watchlist & history' : 'Join to save movies & get insights'}
                </p>
              </>
            )}
            {step === 'verify' && (
              <>
                <h2 className="text-2xl font-bold text-white mt-4">Verify Your Email</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Enter the 6-digit code sent to <span className="text-white font-medium">{email}</span>
                </p>
              </>
            )}
            {step === 'onboarding' && (
              <>
                <h2 className="text-2xl font-bold text-white mt-4">Set Up Profile</h2>
                <p className="text-gray-400 text-sm mt-1">Tell us about yourself for better recommendations</p>
              </>
            )}
          </div>

          {/* Progress bar (signup flow only) */}
          {!isLogin && (
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                {STEPS.map((s, i) => (
                  <div key={s} className="flex items-center gap-1.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                      i < currentStepIndex
                        ? 'bg-[var(--primary)] text-white'
                        : i === currentStepIndex
                        ? 'bg-red-500/20 border border-[var(--primary)] text-[var(--primary)]'
                        : 'bg-[#2A2A2A] text-gray-500'
                    }`}>
                      {i < currentStepIndex ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
                    </div>
                    <span className={`text-[10px] uppercase font-bold tracking-widest hidden sm:inline ${
                      i <= currentStepIndex ? 'text-white' : 'text-gray-500'
                    }`}>{STEP_LABELS[i]}</span>
                  </div>
                ))}
              </div>
              <div className="w-full h-1 bg-[#2A2A2A] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--primary)] transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* STEP 1: Auth */}
          {step === 'auth' && (
            <div className="space-y-6">
              {/* Google Login (Prominent) */}
              <div className="space-y-3">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-3.5 hover:bg-gray-100 transition-all rounded shadow-lg active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-[var(--border)]" />
                <span className="text-gray-500 text-xs font-bold uppercase tracking-widest whitespace-nowrap">or continue with email</span>
                <div className="h-px flex-1 bg-[var(--border)]" />
              </div>

              {isLogin ? (
                /* Login form */
                <div className="space-y-4">
                  {showOtpLogin ? (
                    /* OTP Login (Passwordless) */
                    <form onSubmit={handleOtpLogin} className="space-y-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your@email.com" className={inputClass} />
                        </div>
                      </div>
                      <button type="submit" disabled={loading} className={btnClass}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                        Send Login Code
                      </button>
                    </form>
                  ) : (
                    /* Password Login */
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your@email.com" className={inputClass} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Password</label>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!email) { toast.error('Enter your email first'); return; }
                              try {
                                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                                  redirectTo: `${window.location.origin}/reset-password`,
                                });
                                if (error) throw error;
                                toast.success('Password reset link sent! Check your email.');
                              } catch (err: unknown) { 
                                const error = err as Error;
                                toast.error(error.message); 
                              }
                            }}
                            className="text-[var(--gold-text)] text-[10px] uppercase tracking-widest hover:text-[var(--gold-hi)] transition-colors"
                          >
                            Forgot password?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" className={inputClass} />
                        </div>
                      </div>

                      <button type="submit" disabled={loading} className={btnClass}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                        Sign In
                      </button>
                    </form>
                  )}

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowOtpLogin(!showOtpLogin)}
                      className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest hover:underline"
                    >
                      {showOtpLogin ? 'Use password instead' : 'Sign in with code (OTP)'}
                    </button>
                  </div>
                </div>
              ) : (
                /* Signup form with email + password (OTP verification next) */
                <form onSubmit={handleEmailSignup} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your@email.com" className={inputClass} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Choose Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" className={inputClass} />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className={btnClass}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    Create Account
                  </button>
                </form>
              )}

              <div className="mt-8 pt-6 border-t border-[var(--border)] text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setShowOtpLogin(false);
                  }}
                  className="text-gray-400 text-sm font-medium hover:text-white transition-colors"
                >
                  {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: OTP Verification */}
          {step === 'verify' && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-[var(--primary)] flex items-center justify-center">
                  <KeyRound className="w-8 h-8 text-[var(--primary)]" />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-gray-300 text-sm">
                  Enter the <strong>6-digit code</strong> we sent to your email.
                </p>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                  Code expires in 5 minutes
                </p>
              </div>

              {/* OTP Input */}
              <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-11 h-14 text-center text-xl font-bold bg-[#2A2A2A] border border-[var(--border)] text-white rounded focus:border-white focus:outline-none transition-colors"
                  />
                ))}
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otpDigits.join('').length !== 6}
                className={btnClass}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Verify Email
              </button>

              <div className="space-y-4 pt-4">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-gray-400 text-sm font-medium hover:text-white transition-colors"
                >
                  Didn't receive it? Resend code
                </button>
                <div>
                  <button
                    type="button"
                    onClick={() => { setStep('auth'); setIsLogin(true); setOtpDigits(['', '', '', '', '', '']); }}
                    className="text-gray-500 text-sm font-medium hover:text-white transition-colors"
                  >
                    Back to sign in
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Onboarding */}
          {step === 'onboarding' && (
            <form onSubmit={handleOnboarding} className="space-y-5">
              {/* Avatar */}
              <div className="flex justify-center">
                <label className="relative cursor-pointer group">
                  <div className="w-24 h-24 rounded-full border-2 border-[var(--border)] overflow-hidden bg-[#2A2A2A] flex items-center justify-center group-hover:border-[var(--primary)] transition-colors shadow-lg">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-gray-500 group-hover:text-[var(--primary)] transition-colors" />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center shadow-lg border-2 border-[var(--card)]">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>
              <p className="text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
                {avatarPreview ? 'Looking good!' : 'Add a profile photo (optional)'}
              </p>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Username *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="cinephile42" className={inputClass} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Age</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="25" min={13} max={120} className={inputClass} />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <Film className="w-4 h-4 text-gray-500" />
                  Favorite Genres
                </label>
                <div className="flex flex-wrap gap-2">
                  {GENRE_OPTIONS.map((genre) => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`px-3 py-1.5 border rounded-full text-xs font-bold transition-all ${
                        selectedGenres.includes(genre)
                          ? 'bg-white text-black border-transparent'
                          : 'bg-[#2A2A2A] border-[var(--border)] text-gray-400 hover:border-white hover:text-white'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
                {selectedGenres.length > 0 && (
                  <p className="text-[var(--primary)] text-xs font-bold pt-1">
                    {selectedGenres.length} genre{selectedGenres.length > 1 ? 's' : ''} selected
                  </p>
                )}
              </div>

              <button type="submit" disabled={loading} className={btnClass}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Start Watching
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const { data: { user } } = await supabase.auth.getUser();
                      if (user) {
                        await supabase
                          .from('profiles')
                          .update({ onboarding_complete: true })
                          .eq('user_id', user.id);
                      }
                    } catch (e) {
                      console.error("Failed to skip onboarding", e);
                    }
                    navigate('/');
                  }}
                  className="text-gray-500 text-sm font-medium hover:text-white transition-colors"
                >
                  Skip for now — you can set this up later
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
}
