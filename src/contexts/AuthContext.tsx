import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: { username: string; avatar_url: string | null } | null;
  isPasswordRecovery: boolean;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  changeEmail: (newEmail: string) => Promise<{ error: AuthError | null }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error: AuthError | null }>;
  deleteAccount: () => Promise<void>;
  updateProfile: (username?: string, avatarFile?: File) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string | null>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<{ username: string; avatar_url: string | null } | null>(null);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

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
      .select('username, avatar_url')
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
      const newProfile = { username: generated, avatar_url: null };
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
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setIsPasswordRecovery(false);
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

  const deleteAccount = async () => {
    if (!user) return;
    try {
      await supabase.from('profiles').delete().eq('id', user.id);
      await supabase.auth.admin.deleteUser(user.id).catch(() => {});
      await supabase.auth.signOut();
      setProfile(null);
      toast({ title: 'Account deleted', description: 'Your account has been permanently deleted.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete account. Please contact support.', variant: 'destructive' });
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{
      user, session, profile, isPasswordRecovery,
      signUp, signIn, signOut, resetPassword, updatePassword,
      signInWithGoogle, signInWithGitHub,
      changeEmail, changePassword, deleteAccount,
      updateProfile, uploadAvatar, refreshProfile,
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
