import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { PasswordCriteria } from '@/components/ui/password-criteria';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AppLogo } from '@/components/ui/app-logo';


export default function Auth() {
  console.log('Auth component rendering...');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    userType: 'client' as 'client' | 'trainer' | 'admin'
  });

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Load saved email on component mount (secure - no password storage)
  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail'); 
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    
    if (savedEmail && savedRememberMe) {
      setLoginForm(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }

    // Clean up any legacy password storage for security
    const savedCredentials = localStorage.getItem('savedCredentials');
    if (savedCredentials) {
      try {
        const parsed = JSON.parse(savedCredentials);
        if (parsed.password) {
          // Remove password and save only email if remember me is enabled
          if (savedRememberMe && parsed.email) {
            localStorage.setItem('savedEmail', parsed.email);
          }
          localStorage.removeItem('savedCredentials');
        }
      } catch (e) {
        // Clear corrupted credentials
        localStorage.removeItem('savedCredentials');
      }
    }
  }, []);

  // Check if this is a password recovery URL
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'recovery') {
      setShowPasswordReset(true);
      setShowForgotPassword(false);
      toast({
        title: "Password Reset",
        description: "Please enter your new password below.",
      });
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(loginForm.email, loginForm.password);
    
    if (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Handle remember me functionality - ONLY store email for security
      if (rememberMe) {
        localStorage.setItem('savedEmail', loginForm.email);
        localStorage.setItem('rememberMe', 'true');
        // Clean up any legacy credential storage
        localStorage.removeItem('savedCredentials');
      } else {
        localStorage.removeItem('savedEmail');
        localStorage.removeItem('savedCredentials');
        localStorage.removeItem('rememberMe');
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      // Navigate to home page to trigger role-based redirect logic
      navigate('/');
    }
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupForm.email || !signupForm.password || !signupForm.firstName || !signupForm.lastName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (signupForm.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(signupForm.email, signupForm.password, {
      first_name: signupForm.firstName,
      last_name: signupForm.lastName,
      user_type: signupForm.userType
    });
    
    if (error) {
      if (error.message.includes('already registered')) {
        // Pre-populate login form with the email and switch to login tab
        setLoginForm({ email: signupForm.email, password: '' });
        setActiveTab('login');
        toast({
          title: "Account exists",
          description: "An account with this email already exists. Please log in below.",
          variant: "destructive",
        });
        // Clear signup form
        setSignupForm({
          email: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          userType: 'client'
        });
      } else {
        toast({
          title: "Signup Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      // Pre-populate login form with the email and switch to login tab
      setLoginForm({ email: signupForm.email, password: '' });
      setActiveTab('login');
      toast({
        title: "Account created!",
        description: "Please check your email to confirm your account, then log in below.",
      });
      // Clear signup form
      setSignupForm({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        userType: 'client'
      });
    }
    setIsLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth?type=recovery`,
    });

    if (error) {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Reset Email Sent!",
        description: "Check your email for a password reset link.",
      });
      setShowForgotPassword(false);
      setResetEmail('');
    }
    
    setIsLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmNewPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password Updated!",
        description: "Your password has been successfully updated. You can now login.",
      });
      setShowPasswordReset(false);
      setNewPassword('');
      setConfirmNewPassword('');
      // Clear URL parameters
      navigate('/auth', { replace: true });
    }
    
    setIsLoading(false);
  };


  console.log('About to render Auth component UI');
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Main Auth Card */}
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AppLogo size="lg" showText={false} />
            </div>
            <CardDescription>Not another app. Not another coach. This is personal.</CardDescription>
          </CardHeader>
          <CardContent>
            {showPasswordReset ? (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold">Set New Password</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter your new password below
                  </p>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <PasswordInput
                      id="new-password"
                      placeholder="Enter your new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    {newPassword && (
                      <PasswordCriteria password={newPassword} className="mt-2" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                    <PasswordInput
                      id="confirm-new-password"
                      placeholder="Confirm your new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Password
                  </Button>
                </form>
              </div>
            ) : showForgotPassword ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowForgotPassword(false)}
                    className="p-0 h-auto"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Login
                  </Button>
                </div>
                
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold">Reset Your Password</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter your email address and we'll send you a reset link
                  </p>
                </div>

                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="Enter your email address"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Reset Link
                  </Button>
                </form>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <PasswordInput
                        id="login-password"
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        required
                       />
                     </div>
                     
                     <div className="flex items-center space-x-2">
                       <Checkbox 
                         id="remember-me"
                         checked={rememberMe}
                         onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                       />
                       <Label 
                         htmlFor="remember-me" 
                         className="text-sm font-normal cursor-pointer"
                       >
                         Remember me
                       </Label>
                     </div>
                     
                     <Button type="submit" className="w-full" disabled={isLoading}>
                       {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                       Login
                     </Button>
                  </form>
                  
                  <div className="text-center">
                    <Button
                      variant="link"
                      className="text-sm text-muted-foreground"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgot your password?
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-firstname">First Name</Label>
                        <Input
                          id="signup-firstname"
                          placeholder="First name"
                          value={signupForm.firstName}
                          onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-lastname">Last Name</Label>
                        <Input
                          id="signup-lastname"
                          placeholder="Last name"
                          value={signupForm.lastName}
                          onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-usertype">I am a...</Label>
                      <Select value={signupForm.userType} onValueChange={(value: 'client' | 'trainer' | 'admin') => setSignupForm({ ...signupForm, userType: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="client">Client looking for a trainer</SelectItem>
                          <SelectItem value="trainer">Personal trainer</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <PasswordInput
                        id="signup-password"
                        placeholder="Create a password"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                        required
                      />
                      {signupForm.password && (
                        <PasswordCriteria password={signupForm.password} className="mt-2" />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Confirm Password</Label>
                      <PasswordInput
                        id="signup-confirm"
                        placeholder="Confirm your password"
                        value={signupForm.confirmPassword}
                        onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}