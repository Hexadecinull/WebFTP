import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import logo from '@/assets/logo.png';
import { z } from 'zod';
import { AlertCircle, CheckCircle2, Eye, EyeOff, X } from 'lucide-react';

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
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSigninPassword, setShowSigninPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signIn, signUp, session } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (session) {
    if (onClose) onClose();
    else navigate('/');
    return null;
  }

  const passwordStrength = getPasswordStrength(signupPassword);
  const passwordsMatch = signupPassword === signupConfirmPassword && signupConfirmPassword !== '';
  const passwordValid = signupPassword.length >= 8;

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Validate input
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (error) {
      setIsLoading(false);
      return;
    }

    const { error } = await signIn(email, password);
    
    if (!error) {
      if (onClose) onClose();
      else navigate('/');
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Validate input
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
    } catch (error) {
      setIsLoading(false);
      return;
    }

    await signUp(email, password);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-background p-4">
      <Card className="w-full max-w-md relative">
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <CardHeader className="space-y-4 text-center">{/*...keep existing code*/}
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
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
                      type={showSigninPassword ? "text" : "password"}
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
                      {showSigninPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
                  <DialogTrigger asChild>
                    <button type="button" className="text-sm text-primary hover:underline">
                      Forgot Password?
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Account Recovery</DialogTitle>
                      <DialogDescription>
                        To recover your account, please contact support with the following information:
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Email Support</Label>
                        <p className="text-sm">ssmg4@proton.me</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Support</Label>
                        <p className="text-sm">+33603462344</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        For professional use only. Abuse will face legal charges.
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      name="password"
                      type={showSignupPassword ? "text" : "password"}
                      placeholder="Password must be at least 8 characters"
                      required
                      disabled={isLoading}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className={`pr-20 ${signupPassword ? (passwordValid ? 'border-success focus:ring-success' : 'border-destructive focus:ring-destructive') : ''}`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      {signupPassword && (
                        <>
                          {passwordValid ? (
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-destructive" />
                          )}
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {showSignupPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  {signupPassword && (
                    <div className="space-y-1">
                      <div className="flex gap-1 h-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-full transition-all ${
                              i < passwordStrength.strength ? passwordStrength.color : 'bg-muted'
                            }`}
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
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      required
                      disabled={isLoading}
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      className={`pr-20 ${signupConfirmPassword ? (passwordsMatch ? 'border-success focus:ring-success' : 'border-destructive focus:ring-destructive') : ''}`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      {signupConfirmPassword && (
                        <>
                          {passwordsMatch ? (
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-destructive" />
                          )}
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Sign Up'}
                </Button>
                
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Please verify your email after signing up to activate your account.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
          <p>Secure file transfer made easy</p>
        </CardFooter>
      </Card>
    </div>
  );
}