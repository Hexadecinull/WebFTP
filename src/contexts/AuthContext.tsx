import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError, Factor } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Profile {
  username: string;
  avatar_url: string | null;
  suspended?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isPasswordRecovery: boolean;
  mfaChallengeFactorId: string | null;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; mfaRequired?: boolean; suspended?: boolean }>;
  verifyMfaChallenge: (code: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  changeEmail: (newEmail: string) => Promise<{ error: AuthError | null }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error: AuthError | null }>;
  deleteAccount: () => Promise<void>;
  suspendAccount: () => Promise<void>;
  reactivateAccount: () => Promise<void>;
  updateProfile: (username?: string, avatarFile?: File) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string | null>;
  refreshProfile: () => Promise<void>;
  // Identity linking
  getLinkedIdentities: () => Promise<string[]>;
  linkGoogle: () => Promise<void>;
  linkGitHub: () => Promise<void>;
  unlinkProvider: (provider: string) => Promise<{ error: Error | null }>;
  // 2FA (TOTP)
  enrollMfa: () => Promise<{ qrCode: string; secret: string; factorId: string } | null>;
  confirmMfaEnrollment: (factorId: string, code: string) => Promise<{ error: AuthError | null }>;
  listMfaFactors: () => Promise<Factor[]>;
  unenrollMfa: (factorId: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [mfaChallengeFactorId, setMfaChallengeFactorId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setIsPasswordRecovery(false);
      }
      if (session?.user) {
        setTimeout(() => fetchProfile(session.user.id), 0);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async (userId: string) => {
    const cachedProfile = localStorage.getItem(`profile_cache_${userId}`);
    if (cachedProfile) {
      try {
        setProfile(JSON.parse(cachedProfile));
      } catch (_) {
        // ignore malformed cache
      }
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('username, avatar_url, suspended')
      .eq('id', userId)
      .single();

    if (data) {
      setProfile(data);
      localStorage.setItem(`profile_cache_${userId}`, JSON.stringify(data));
      if (data.avatar_url) cacheAvatarLocally(data.avatar_url, userId);
    } else if (error?.code === 'PGRST116' || error?.code === 'PGRST205') {
      // Row not found — auto-create profile for users who signed up before the trigger existed
      const generated = 'wftp_' + Math.floor(Math.random() * 1e10).toString().padStart(10, '0');
      await supabase.from('profiles').insert({ id: userId, username: generated });
      const newProfile = { username: generated, avatar_url: null, suspended: false };
      setProfile(newProfile);
      localStorage.setItem(`profile_cache_${userId}`, JSON.stringify(newProfile));
    }
  };

  const cacheAvatarLocally = async (url: string, userId: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          localStorage.setItem(`avatar_cache_${userId}`, reader.result as string);
        } catch {
          // localStorage full — ignore
        }
      };
      reader.readAsDataURL(blob);
    } catch {
      // network error — ignore
    }
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    if (error) return { error };
    // Supabase (with email confirmations enabled) does NOT return an error for
    // an already-registered+confirmed email — it returns "success" with an
    // empty identities array instead, to prevent user enumeration attacks.
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return {
        error: {
          name: 'AuthApiError',
          message: 'An account with this email already exists. Please sign in instead.',
        } as AuthError,
      };
    }
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error };

    // Check if this account requires a second MFA factor before granting access
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal && aal.nextLevel === 'aal2' && aal.currentLevel !== aal.nextLevel) {
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const totpFactor = factorsData?.totp?.[0];
      if (totpFactor) {
        setMfaChallengeFactorId(totpFactor.id);
        return { error: null, mfaRequired: true, suspended: false };
      }
    }

    // Check for self-service suspension directly (don't rely on async profile state)
    const { data: userData } = await supabase.auth.getUser();
    const { data: profileRow } = await supabase
      .from('profiles')
      .select('suspended')
      .eq('id', userData.user?.id)
      .single();

    return { error: null, mfaRequired: false, suspended: !!profileRow?.suspended };
  };

  const verifyMfaChallenge = async (code: string) => {
    if (!mfaChallengeFactorId) {
      return { error: { message: 'No MFA challenge in progress' } as AuthError };
    }
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: mfaChallengeFactorId });
    if (challengeError) return { error: challengeError };

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: mfaChallengeFactorId,
      challengeId: challenge.id,
      code,
    });
    if (!verifyError) setMfaChallengeFactorId(null);
    return { error: verifyError };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setIsPasswordRecovery(false);
    setMfaChallengeFactorId(null);
    toast({ title: 'Signed out', description: 'You have been signed out successfully.' });
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    });
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (!error) setIsPasswordRecovery(false);
    return { error };
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) return null;
    try {
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop();
        if (oldPath) await supabase.storage.from('avatars').remove([`${user.id}/${oldPath}`]);
      }
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      return data.publicUrl;
    } catch {
      toast({ title: 'Error', description: 'Failed to upload avatar', variant: 'destructive' });
      return null;
    }
  };

  const updateProfile = async (username?: string, avatarFile?: File) => {
    if (!user) return;
    try {
      const updates: { username?: string; avatar_url?: string } = {};
      if (username?.trim()) updates.username = username.trim();
      if (avatarFile) {
        const avatarUrl = await uploadAvatar(avatarFile);
        if (avatarUrl) updates.avatar_url = avatarUrl;
      }
      if (Object.keys(updates).length === 0) return;
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if (error) throw error;
      await fetchProfile(user.id);
      toast({ title: 'Profile updated', description: 'Your profile has been saved.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
    }
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
  };

  const signInWithGitHub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/` },
    });
  };

  const changeEmail = async (newEmail: string) => {
    const { error } = await supabase.auth.updateUser(
      { email: newEmail },
      { emailRedirectTo: `${window.location.origin}/` }
    );
    if (!error) {
      toast({ title: 'Verification sent', description: 'Check both your old and new email to confirm the change.' });
    }
    return { error };
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    // Re-authenticate first by signing in again
    if (!user?.email) return { error: { message: 'No user email found' } as AuthError };
    const { error: reAuthError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (reAuthError) return { error: reAuthError };
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (!error) toast({ title: 'Password changed', description: 'Your password has been updated.' });
    return { error };
  };

  // Fully deletes the account from auth.users via our own proxy server, which
  // holds the Supabase service role key server-side. The browser's anon key
  // cannot do this — the previous implementation tried calling
  // supabase.auth.admin.deleteUser() directly from the client, which always
  // fails silently (service role required), meaning accounts were never
  // actually deleted, only the profile row.
  const deleteAccount = async () => {
    if (!user || !session) return;
    const proxyUrl = localStorage.getItem('proxyUrl');
    if (!proxyUrl?.trim()) {
      toast({
        title: 'Cannot delete account',
        description: 'Account deletion requires a configured proxy server (Settings → Connection).',
        variant: 'destructive',
      });
      return;
    }
    try {
      const res = await fetch(`${proxyUrl.replace(/\/$/, '')}/api/account/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: session.access_token }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to delete account' }));
        throw new Error(err.message);
      }
      await supabase.from('profiles').delete().eq('id', user.id).catch(() => {});
      await supabase.auth.signOut();
      setProfile(null);
      toast({ title: 'Account deleted', description: 'Your account has been permanently deleted.' });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete account. Please contact support.',
        variant: 'destructive',
      });
    }
  };

  // Self-service suspension — NOT an admin ban. The user flips their own
  // flag off/on. Signs out immediately after suspending.
  const suspendAccount = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ suspended: true, suspended_at: new Date().toISOString() })
      .eq('id', user.id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to suspend account', variant: 'destructive' });
      return;
    }
    toast({ title: 'Account suspended', description: 'Sign in again any time to reactivate it.' });
    await signOut();
  };

  const reactivateAccount = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ suspended: false, suspended_at: null })
      .eq('id', user.id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to reactivate account', variant: 'destructive' });
      return;
    }
    await refreshProfile();
    toast({ title: 'Welcome back!', description: 'Your account has been reactivated.' });
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  // ── Identity linking (requires "Allow manual linking" enabled in
  // Supabase → Authentication → Providers) ──────────────────────────────
  const getLinkedIdentities = async (): Promise<string[]> => {
    const { data, error } = await supabase.auth.getUserIdentities();
    if (error || !data) return [];
    return data.identities.map(i => i.provider);
  };

  const linkGoogle = async () => {
    const { error } = await supabase.auth.linkIdentity({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) toast({ title: 'Failed to link Google', description: error.message, variant: 'destructive' });
  };

  const linkGitHub = async () => {
    const { error } = await supabase.auth.linkIdentity({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) toast({ title: 'Failed to link GitHub', description: error.message, variant: 'destructive' });
  };

  const unlinkProvider = async (provider: string) => {
    const { data, error: idError } = await supabase.auth.getUserIdentities();
    if (idError || !data) return { error: idError as unknown as Error };
    const identity = data.identities.find(i => i.provider === provider);
    if (!identity) return { error: new Error('Identity not found') };
    const { error } = await supabase.auth.unlinkIdentity(identity);
    if (!error) toast({ title: 'Unlinked', description: `${provider} account disconnected.` });
    return { error: error as unknown as Error };
  };

  // ── 2FA / TOTP ──────────────────────────────────────────────────────────
  const enrollMfa = async () => {
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    if (error || !data) {
      toast({ title: 'Failed to start 2FA setup', description: error?.message, variant: 'destructive' });
      return null;
    }
    return { qrCode: data.totp.qr_code, secret: data.totp.secret, factorId: data.id };
  };

  const confirmMfaEnrollment = async (factorId: string, code: string) => {
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) return { error: challengeError };
    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code });
    if (!error) toast({ title: '2FA enabled', description: 'Two-factor authentication is now active on your account.' });
    return { error };
  };

  const listMfaFactors = async (): Promise<Factor[]> => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error || !data) return [];
    return data.totp;
  };

  const unenrollMfa = async (factorId: string) => {
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (!error) toast({ title: '2FA disabled', description: 'Two-factor authentication has been removed.' });
    return { error };
  };

  return (
    <AuthContext.Provider value={{
      user, session, profile, isPasswordRecovery, mfaChallengeFactorId,
      signUp, signIn, verifyMfaChallenge, signOut, resetPassword, updatePassword,
      signInWithGoogle, signInWithGitHub,
      changeEmail, changePassword, deleteAccount, suspendAccount, reactivateAccount,
      updateProfile, uploadAvatar, refreshProfile,
      getLinkedIdentities, linkGoogle, linkGitHub, unlinkProvider,
      enrollMfa, confirmMfaEnrollment, listMfaFactors, unenrollMfa,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
