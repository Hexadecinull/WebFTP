import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import logo from '@/assets/logo.png';
import { z } from 'zod';
import { AlertCircle, CheckCircle2, Eye, EyeOff, X, ArrowLeft } from 'lucide-react';

const emailSchema = z.string().email('Invalid email address');
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');

const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  if (strength <= 2) return { strength, label: 'Weak', color: 'bg-destructive' };
  if (strength === 3) return { strength, label: 'Fair', color: 'bg-warning' };
  if (strength === 4) return { strength, label: 'Good', color: 'bg-primary' };
  return { strength, label: 'Strong', color: 'bg-success' };
};

export default function Auth({ onClose }: { onClose?: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  // Forgot password flow
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState('');
  // Sign up state
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  // Password visibility
  const [showSigninPassword, setShowSigninPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  // Inline errors
  const [signInError, setSignInError] = useState('');
  const [signUpError, setSignUpError] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  // Password recovery (from reset email)
  const [newPassword, setNewPassword] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  // Animation
  const [isClosing, setIsClosing] = useState(false);
  // MFA challenge (after sign-in, if 2FA is enabled)
  const [showMfaChallenge, setShowMfaChallenge] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState('');
  // Suspended account prompt
  const [showSuspendedPrompt, setShowSuspendedPrompt] = useState(false);

  const { signIn, signUp, session, resetPassword, updatePassword, isPasswordRecovery,
          signInWithGoogle, signInWithGitHub, verifyMfaChallenge, reactivateAccount, signOut } = useAuth();
  const navigate = useNavigate();

  if (session && !isPasswordRecovery && !showMfaChallenge && !showSuspendedPrompt) {
    if (onClose) onClose();
    else navigate('/');
    return null;
  }

  const handleClose = () => {
    if (onClose) {
      setIsClosing(true);
      setTimeout(() => onClose(), 150);
    }
  };

  const passwordStrength = getPasswordStrength(signupPassword);
  const passwordsMatch = signupPassword === signupConfirmPassword && signupConfirmPassword !== '';
  const passwordValid = signupPassword.length >= 8;

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setIsLoading(true);
    setSignInError('');
    const formData = new FormData(form);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch {
      setSignInError('Please enter a valid email and password (min 8 characters).');
      setIsLoading(false);
      return;
    }
    const { error, mfaRequired, suspended } = await signIn(email, password);
    if (error) {
      setSignInError('Incorrect email or password. Please try again.');
      const pwField = form.querySelector('#signin-password') as HTMLInputElement;
      if (pwField) pwField.value = '';
      setIsLoading(false);
    } else if (mfaRequired) {
      setShowMfaChallenge(true);
      setIsLoading(false);
    } else if (suspended) {
      setShowSuspendedPrompt(true);
      setIsLoading(false);
    } else {
      if (onClose) onClose();
      else navigate('/');
    }
  };

  const handleMfaVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMfaError('');
    const { error } = await verifyMfaChallenge(mfaCode);
    if (error) {
      setMfaError('Incorrect code. Please check your authenticator app and try again.');
      setMfaCode('');
      setIsLoading(false);
    } else {
      setShowMfaChallenge(false);
      if (onClose) onClose();
      else navigate('/');
    }
  };

  const handleReactivate = async () => {
    setIsLoading(true);
    await reactivateAccount();
    setShowSuspendedPrompt(false);
    setIsLoading(false);
    if (onClose) onClose();
    else navigate('/');
  };

  const handleCancelReactivate = async () => {
    await signOut();
    setShowSuspendedPrompt(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setSignUpError('');
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      if (password !== confirmPassword) throw new Error('Passwords do not match.');
    } catch (error) {
      setSignUpError(error instanceof Error ? error.message : 'Please check your input and try again.');
      setIsLoading(false);
      return;
    }
    const { error } = await signUp(email, password);
    if (error) {
      const msg = error.message?.toLowerCase() || '';
      if (msg.includes('already registered') || msg.includes('already in use') || msg.includes('user_already_exists') || msg.includes('email address is already')) {
        setSignUpError('This email address is already registered. Try signing in instead.');
      } else {
        setSignUpError(error.message || 'An error occurred during sign up. Please try again.');
      }
    } else {
      setSignUpSuccess(true);
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setForgotError('');
    try {
      emailSchema.parse(forgotEmail);
    } catch {
      setForgotError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }
    const { error } = await resetPassword(forgotEmail);
    if (error) {
      setForgotError(error.message || 'Failed to send reset email. Please try again.');
    } else {
      setForgotSent(true);
    }
    setIsLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setRecoveryError('');
    try {
      passwordSchema.parse(newPassword);
    } catch {
      setRecoveryError('Password must be at least 8 characters.');
      setIsLoading(false);
      return;
    }
    const { error } = await updatePassword(newPassword);
    if (error) {
      setRecoveryError(error.message || 'Failed to update password. Please try again.');
    } else {
      if (onClose) onClose();
      else navigate('/');
    }
    setIsLoading(false);
  };

  // Shared card wrapper — full screen on mobile, max-w-md on desktop
  const cardClass = `w-full max-w-md relative ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`;
  const wrapClass = `flex items-center justify-center ${!onClose ? 'min-h-screen bg-gradient-to-br from-background via-accent/5 to-background' : ''} p-0 sm:p-4 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`;

  // MFA challenge screen (after password auth succeeds, if 2FA is enabled)
  if (showMfaChallenge) {
    return (
      <div className={wrapClass}>
        <Card className={cardClass}>
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <img src={logo} alt="WebFTP" className="h-16 w-16" />
            </div>
            <div>
              <CardTitle className="text-2xl">Two-Factor Verification</CardTitle>
              <CardDescription>Enter the 6-digit code from your authenticator app</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleMfaVerify} className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="mfa-code">Authentication Code</Label>
                <Input
                  id="mfa-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  disabled={isLoading}
                  className="text-center text-lg tracking-[0.5em] font-mono"
                  autoFocus
                />
                {mfaError && <p className="text-xs text-destructive animate-fade-in">{mfaError}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || mfaCode.length !== 6}>
                {isLoading ? 'Verifying...' : 'Verify'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 text-center">
            <button
              type="button"
              onClick={async () => { await signOut(); setShowMfaChallenge(false); setMfaCode(''); }}
              className="flex items-center gap-1 text-sm text-primary hover:underline mx-auto"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to Sign In
            </button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Suspended account screen
  if (showSuspendedPrompt) {
    return (
      <div className={wrapClass}>
        <Card className={cardClass}>
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <img src={logo} alt="WebFTP" className="h-16 w-16 opacity-50" />
            </div>
            <div>
              <CardTitle className="text-2xl">Account Suspended</CardTitle>
              <CardDescription>
                You previously suspended this account. Reactivate it to continue.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button onClick={handleReactivate} disabled={isLoading} className="w-full">
              {isLoading ? 'Reactivating...' : 'Reactivate My Account'}
            </Button>
            <Button variant="outline" onClick={handleCancelReactivate} disabled={isLoading} className="w-full">
              Cancel and Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Password recovery screen (after clicking reset link)
  if (isPasswordRecovery) {
    return (
      <div className={wrapClass}>
        <Card className={cardClass}>
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <img src={logo} alt="WebFTP" className="h-16 w-16" />
            </div>
            <div>
              <CardTitle className="text-2xl">Set New Password</CardTitle>
              <CardDescription>Enter your new password below</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Minimum 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {newPassword && (
                  <div className="space-y-1">
                    <div className="flex gap-1 h-1">
                      {[...Array(5)].map((_, i) => {
                        const s = getPasswordStrength(newPassword);
                        return (
                          <div key={i} className={`flex-1 rounded-full transition-all ${i < s.strength ? s.color : 'bg-muted'}`} />
                        );
                      })}
                    </div>
                    <p className={`text-xs ${getPasswordStrength(newPassword).strength <= 2 ? 'text-destructive' : getPasswordStrength(newPassword).strength === 3 ? 'text-warning' : 'text-success'}`}>
                      Password strength: {getPasswordStrength(newPassword).label}
                    </p>
                  </div>
                )}
                {recoveryError && <p className="text-xs text-destructive animate-fade-in">{recoveryError}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Set New Password'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center text-sm text-muted-foreground justify-center">
            <p>Secure file transfer made easy</p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Forgot password screen
  if (showForgotPassword) {
    return (
      <div className={wrapClass}>
        <Card className={cardClass}>
          {onClose && (
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <img src={logo} alt="WebFTP" className="h-16 w-16" />
            </div>
            <div>
              <CardTitle className="text-2xl">Reset Password</CardTitle>
              <CardDescription>
                {forgotSent ? "Check your inbox" : "Enter your email to receive a reset link"}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {forgotSent ? (
              <div className="text-center space-y-4 py-4">
                <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
                <p className="text-sm text-muted-foreground">
                  A password reset link has been sent to <strong>{forgotEmail}</strong>. Click the link in the email to set a new password.
                </p>
                <p className="text-xs text-muted-foreground">
                  Didn't receive it? Check your spam folder or try again.
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="flex flex-col gap-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email Address</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="your@email.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  {forgotError && <p className="text-xs text-destructive animate-fade-in">{forgotError}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2 text-center">
            <button
              type="button"
              onClick={() => { setShowForgotPassword(false); setForgotSent(false); setForgotEmail(''); setForgotError(''); }}
              className="flex items-center gap-1 text-sm text-primary hover:underline mx-auto"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to Sign In
            </button>
            <p className="text-sm text-muted-foreground">Secure file transfer made easy</p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Main sign in / sign up
  return (
    <div className={wrapClass}>
      <Card className={`${cardClass} rounded-none sm:rounded-lg`}>
        {onClose && (
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img src={logo} alt="WebFTP" className="h-16 w-16" />
          </div>
          <div>
            <CardTitle className="text-2xl">Welcome to WebFTP</CardTitle>
            <CardDescription>Sign in to your account or create a new one</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted">
              <TabsTrigger value="signin" className="data-[state=active]:bg-background">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-background">Sign Up</TabsTrigger>
            </TabsList>

            {/* Sign In */}
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="flex flex-col gap-4 pt-4 min-h-[460px]">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      name="password"
                      type={showSigninPassword ? 'text' : 'password'}
                      placeholder="Enter password here"
                      required
                      disabled={isLoading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSigninPassword(!showSigninPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showSigninPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {signInError && <p className="text-xs text-destructive animate-fade-in">{signInError}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-primary hover:underline text-left"
                >
                  Forgot Password?
                </button>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" variant="outline" onClick={signInWithGoogle} disabled={isLoading}>
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Google
                  </Button>
                  <Button type="button" variant="outline" onClick={signInWithGitHub} disabled={isLoading}>
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                    GitHub
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Sign Up */}
            <TabsContent value="signup">
              {signUpSuccess ? (
                <div className="text-center space-y-4 py-6">
                  <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
                  <p className="font-medium">Account created!</p>
                  <p className="text-sm text-muted-foreground">
                    A verification email has been sent to your inbox. Click the link to activate your account before signing in.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSignUp} className="flex flex-col gap-4 pt-4 min-h-[460px]">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      disabled={isLoading}
                    />
                    {signUpError && !signupPassword && (
                      <p className="text-xs text-destructive animate-fade-in">{signUpError}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        name="password"
                        type={showSignupPassword ? 'text' : 'password'}
                        placeholder="Minimum 8 characters"
                        required
                        disabled={isLoading}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className={`pr-20 ${signupPassword ? (passwordValid ? 'border-success focus:ring-success' : 'border-destructive focus:ring-destructive') : ''}`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {signupPassword && (
                          passwordValid
                            ? <CheckCircle2 className="h-5 w-5 text-success" />
                            : <AlertCircle className="h-5 w-5 text-destructive" />
                        )}
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className={`space-y-1 transition-opacity ${signupPassword ? 'opacity-100' : 'opacity-0'}`}>
                      <div className="flex gap-1 h-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-full transition-all ${i < passwordStrength.strength ? passwordStrength.color : 'bg-muted'}`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs ${passwordStrength.strength <= 2 ? 'text-destructive' : passwordStrength.strength === 3 ? 'text-warning' : 'text-success'}`}>
                        Password strength: {passwordStrength.label || 'none'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-confirm"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        required
                        disabled={isLoading}
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        className={`pr-20 ${signupConfirmPassword ? (passwordsMatch ? 'border-success focus:ring-success' : 'border-destructive focus:ring-destructive') : ''}`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {signupConfirmPassword && (
                          passwordsMatch
                            ? <CheckCircle2 className="h-5 w-5 text-success" />
                            : <AlertCircle className="h-5 w-5 text-destructive" />
                        )}
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    {signUpError && signupPassword && (
                      <p className="text-xs text-destructive animate-fade-in">{signUpError}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Sign Up'}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">or sign up with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button type="button" variant="outline" onClick={signInWithGoogle} disabled={isLoading}>
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                      Google
                    </Button>
                    <Button type="button" variant="outline" onClick={signInWithGitHub} disabled={isLoading}>
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                      GitHub
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    Please verify your email after signing up to activate your account.
                  </p>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="justify-center text-sm text-muted-foreground">
          <p>Secure file transfer made easy</p>
        </CardFooter>
      </Card>
    </div>
  );
}
