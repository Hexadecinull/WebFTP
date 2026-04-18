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

  const { signIn, signUp, session, resetPassword, updatePassword, isPasswordRecovery } = useAuth();
  const navigate = useNavigate();

  if (session && !isPasswordRecovery) {
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
    const { error } = await signIn(email, password);
    if (error) {
      setSignInError('Incorrect email or password. Please try again.');
      const pwField = form.querySelector('#signin-password') as HTMLInputElement;
      if (pwField) pwField.value = '';
      setIsLoading(false);
    } else {
      if (onClose) onClose();
      else navigate('/');
    }
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
      setSignUpError(error.message || 'An error occurred during sign up. Please try again.');
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
              <form onSubmit={handleSignIn} className="flex flex-col gap-4 pt-4">
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
                <form onSubmit={handleSignUp} className="flex flex-col gap-4 pt-4">
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
                    {signupPassword && (
                      <div className="space-y-1">
                        <div className="flex gap-1 h-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`flex-1 rounded-full transition-all ${i < passwordStrength.strength ? passwordStrength.color : 'bg-muted'}`}
                            />
                          ))}
                        </div>
                        <p className={`text-xs ${passwordStrength.strength <= 2 ? 'text-destructive' : passwordStrength.strength === 3 ? 'text-warning' : 'text-success'}`}>
                          Password strength: {passwordStrength.label}
                        </p>
                      </div>
                    )}
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
