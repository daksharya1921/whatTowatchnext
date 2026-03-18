import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useOnboardingCheck } from './useOnboardingCheck';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Mock the dependencies
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  useLocation: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('useOnboardingCheck', () => {
  const mockNavigate = vi.fn();
  const mockLocation = { pathname: '/' };

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as any).mockReturnValue(mockNavigate);
    (useLocation as any).mockReturnValue(mockLocation);
  });

  it('does nothing if loading is true', () => {
    (useAuth as any).mockReturnValue({ user: null, loading: true });
    renderHook(() => useOnboardingCheck());
    expect(supabase.from).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('does nothing if user is null', () => {
    (useAuth as any).mockReturnValue({ user: null, loading: false });
    renderHook(() => useOnboardingCheck());
    expect(supabase.from).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('skips check if on auth-related path', () => {
    (useAuth as any).mockReturnValue({ user: { id: '123' }, loading: false });
    (useLocation as any).mockReturnValue({ pathname: '/auth' });
    renderHook(() => useOnboardingCheck());
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('redirects to onboarding if profile exists and onboarding_complete is false', async () => {
    (useAuth as any).mockReturnValue({ user: { id: '123' }, loading: false });
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: { onboarding_complete: false } });
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: mockMaybeSingle,
        }),
      }),
    });

    renderHook(() => useOnboardingCheck());

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/auth?step=onboarding', { replace: true });
    });
  });

  it('does not redirect if profile exists and onboarding_complete is true', async () => {
    (useAuth as any).mockReturnValue({ user: { id: '123' }, loading: false });
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: { onboarding_complete: true } });
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: mockMaybeSingle,
        }),
      }),
    });

    renderHook(() => useOnboardingCheck());

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
