import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { PasswordCriteria } from '@/components/ui/password-criteria';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AuthService } from '@/services';
import { EnhancedAuthLayout } from '@/components/auth/EnhancedAuthLayout';
import { MotivationalHeader } from '@/components/auth/MotivationalHeader';
import { BrandedFormField } from '@/components/auth/BrandedFormField';
import { useStatusFeedback } from '@/hooks/useStatusFeedback';
import { InlineStatusBar } from '@/components/ui/inline-status-bar';



export default function Auth() {
  console.log('Auth component rendering...');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');
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
    userType: 'client' as 'client' | 'trainer'
  });

  const { signIn, signUp, resendConfirmation } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userType: routeUserType } = useParams<{ userType?: string }>();
  const location = useLocation();
  const { status, showSuccess, showError, showInfo, showWarning, hideStatus } = useStatusFeedback();

  // Detect signup context from URL - support both path-based and query param URLs
  const signupContext = searchParams.get('signup');
  const intentContext = searchParams.get('intent');
  const isPathBasedSignup = location.pathname.includes('/auth/signup');
  const isContextualSignup = isPathBasedSignup || signupContext === 'true' || signupContext === 'client' || signupContext === 'trainer' || intentContext === 'trainer-signup';
  
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

  // Check if this is a password recovery URL or signup URL
  useEffect(() => {
    const type = searchParams.get('type');
    const mode = searchParams.get('mode');
    const accessToken = searchParams.get('access_token');
    const signup = searchParams.get('signup');
    const intent = searchParams.get('intent');
    
    if (type === 'recovery' || (mode === 'reset' && accessToken)) {
      // Set the session with the access token for password reset
      if (accessToken) {
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: '' // Not needed for password reset
        });
      }
      
      setShowPasswordReset(true);
      setShowForgotPassword(false);
      showInfo("Please enter your new password below.");
    } else if (isPathBasedSignup || signup === 'true' || signup === 'client' || signup === 'trainer' || intent === 'trainer-signup') {
      setActiveTab('signup');
      // Set user type based on context - check route param first, then query param
      const detectedUserType = routeUserType || signup;
      if (detectedUserType === 'client' || detectedUserType === 'true' || !detectedUserType) {
        setSignupForm(prev => ({ ...prev, userType: 'client' }));
      } else if (detectedUserType === 'trainer' || intent === 'trainer-signup') {
        setSignupForm(prev => ({ ...prev, userType: 'trainer' }));
      }
    }
  }, [searchParams, routeUserType, location.pathname, isPathBasedSignup]);

  // Clear status when changing tabs or views
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    hideStatus();
  };

  const handleShowForgotPassword = (show: boolean) => {
    setShowForgotPassword(show);
    hideStatus();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      showError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(loginForm.email, loginForm.password);
    
    if (error) {
      const msg = (error.message || '').toLowerCase();
      const isUnconfirmed = msg.includes('email not confirmed') || msg.includes('email_not_confirmed');

      if (isUnconfirmed) {
        setConfirmationEmail(loginForm.email);
        setShowResendConfirmation(true);
        showWarning("Please confirm your email. You can resend the confirmation below.");
      } else {
        showError(error.message || "Login failed");
      }
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

      // Navigate to home page to trigger role-based redirect logic
      // No toast needed - user is redirected immediately
      navigate('/');
    }
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For contextual signup, only require email and password
    if (isContextualSignup) {
      if (!signupForm.email || !signupForm.password) {
        showError("Please fill in all required fields");
        return;
      }
    } else {
      // For regular signup, require all fields
      if (!signupForm.email || !signupForm.password || !signupForm.firstName || !signupForm.lastName) {
        showError("Please fill in all required fields");
        return;
      }
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      showError("Passwords do not match");
      return;
    }

    if (signupForm.password.length < 6) {
      showError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    const userData: any = {
      user_type: signupForm.userType
    };
    
    // Only include names if provided (for non-contextual signup)
    if (signupForm.firstName) userData.first_name = signupForm.firstName;
    if (signupForm.lastName) userData.last_name = signupForm.lastName;
    
    // Call signUp and check the response carefully for existing users
    const signUpResult = await supabase.auth.signUp({
      email: signupForm.email,
      password: signupForm.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: userData
      }
    });
    
    // Check if this is an existing confirmed user
    // When user exists and is confirmed, identities array is empty
    const isExistingConfirmedUser = signUpResult.data?.user && 
      (!signUpResult.data.user.identities || signUpResult.data.user.identities.length === 0) &&
      signUpResult.data.user.email_confirmed_at;
    
    if (isExistingConfirmedUser) {
      console.log('Existing confirmed user detected:', signUpResult.data.user.email);
      setLoginForm({ email: signupForm.email, password: '' });
      setActiveTab('login');
      showInfo("This email is already registered and confirmed. Please log in below.");
      setSignupForm({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        userType: signupContext === 'client' ? 'client' : 'trainer',
      });
      setIsLoading(false);
      return;
    }
    
    const error = signUpResult.error;
    
    if (error) {
      const errorMsg = error.message?.toLowerCase() || '';
      const isAlreadyRegistered = errorMsg.includes('already registered') || errorMsg.includes('user already registered');
      
      if (isAlreadyRegistered) {
        // Pre-populate login form with the email and switch to login tab
        setLoginForm({ email: signupForm.email, password: '' });
        setConfirmationEmail(signupForm.email);
        setShowResendConfirmation(true);
        setActiveTab('login');
        showInfo("This email is already registered. Check your email (including junk/spam folder) for the confirmation link or click 'Resend Confirmation' below.");
        // Clear signup form
        setSignupForm({
          email: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          userType: signupContext === 'client' ? 'client' : 'trainer',
        });
      } else {
        showError(error.message || "Signup failed");
      }
    } else {
      // New signup - Pre-populate login form with the email and set up resend confirmation
      setLoginForm({ email: signupForm.email, password: '' });
      setConfirmationEmail(signupForm.email);
      setShowResendConfirmation(true);
      setActiveTab('login');
      showSuccess("Account created! Please check your email (including junk/spam folder) to confirm your account, then log in below.");
      // Clear signup form
      setSignupForm({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        userType: signupContext === 'client' ? 'client' : 'trainer',
      });
    }
    setIsLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      showError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    
    const result = await AuthService.requestPasswordReset(
      { email: resetEmail },
      `${window.location.origin}/auth?type=recovery`
    );

    if (result.error) {
      showError(result.error.message || "Password reset failed");
    } else {
      showSuccess("Reset email sent! Check your inbox for the link.");
      setShowForgotPassword(false);
      setResetEmail('');
    }
    
    setIsLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmNewPassword) {
      showError("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      showError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    
    const updateResult = await AuthService.updatePassword({ 
      password: newPassword, 
      confirmPassword: newPassword 
    });

    if (!updateResult.success) {
      const errorDetails = updateResult.error?.details;
      let errorMessage = updateResult.error?.message || "Failed to update password";
      
      // Handle "same password" error with friendlier message
      if (errorDetails?.code === 'same_password' || errorMessage.includes('different from the old password')) {
        errorMessage = "Your new password must be different from your current password. Please choose a different password.";
      }
      
      showError(errorMessage);
    } else {
      showSuccess("Password updated! You can now login.");
      setShowPasswordReset(false);
      setNewPassword('');
      setConfirmNewPassword('');
      // Clear URL parameters
      navigate('/auth', { replace: true });
    }
    
    setIsLoading(false);
  };

  const handleResendConfirmation = async () => {
    if (!confirmationEmail) {
      showError("No email address found for confirmation");
      return;
    }

    setIsLoading(true);
    const { error } = await resendConfirmation(confirmationEmail);
    
    if (error) {
      showError(error.message || "Failed to resend confirmation");
    } else {
      showSuccess("Confirmation email sent! Please check your email (including junk/spam folder).");
    }
    setIsLoading(false);
  };


  console.log('About to render Auth component UI');
  return (
    <EnhancedAuthLayout>
      <InlineStatusBar
        message={status.message}
        variant={status.variant}
        isVisible={status.isVisible}
        onDismiss={hideStatus}
        autoDismiss={true}
        dismissDelay={5000}
        className="mb-4"
      />
      
            {showPasswordReset ? (
              <div className="space-y-6">
                <MotivationalHeader context="reset" onTaglineClick={() => navigate('/')} />

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <BrandedFormField
                    id="new-password"
                    name="newPassword"
                    type="password"
                    label="New Password"
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  {newPassword && (
                    <PasswordCriteria password={newPassword} className="mt-2" />
                  )}
                  
                  <BrandedFormField
                    id="confirm-new-password"
                    name="confirmNewPassword"
                    type="password"
                    label="Confirm New Password"
                    placeholder="Confirm your new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary hover:shadow-primary transition-all duration-200" 
                    disabled={isLoading}
                    size="lg"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Password
                  </Button>
                </form>
              </div>
            ) : showForgotPassword ? (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShowForgotPassword(false)}
                    className="p-0 h-auto text-card-foreground/70 hover:text-card-foreground"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Login
                  </Button>
                </div>
                
                <MotivationalHeader context="forgot" onTaglineClick={() => navigate('/')} />

                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <BrandedFormField
                    id="reset-email"
                    name="resetEmail"
                    type="email"
                    label="Email"
                    placeholder="Enter your email address"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary hover:shadow-primary transition-all duration-200" 
                    disabled={isLoading}
                    size="lg"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Reset Link
                  </Button>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                <MotivationalHeader 
                  context={activeTab === 'login' ? 'login' : 'signup'} 
                  userType={signupForm.userType}
                  onTaglineClick={() => navigate('/')}
                />
                
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-white/10 border border-white/20">
                    <TabsTrigger 
                      value="login" 
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      Login
                    </TabsTrigger>
                    <TabsTrigger 
                      value="signup"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      Sign Up
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login" className="space-y-6 mt-6">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <BrandedFormField
                        id="login-email"
                        name="email"
                        type="email"
                        label="Email"
                        placeholder="Enter your email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        required
                      />
                      <BrandedFormField
                        id="login-password"
                        name="password"
                        type="password"
                        label="Password"
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        required
                      />
                      
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
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-primary hover:shadow-primary transition-all duration-200" 
                        disabled={isLoading}
                        size="lg"
                      >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Login
                      </Button>
                    </form>
                    
                    <div className="text-center space-y-2">
                      <Button
                        variant="link"
                        className="text-sm text-card-foreground/70 hover:text-card-foreground"
                        onClick={() => handleShowForgotPassword(true)}
                      >
                        Forgot your password?
                      </Button>
                      
                      {showResendConfirmation && (
                        <div className="pt-4 border-t border-white/20">
                          <p className="text-sm text-muted-foreground mb-2">
                            Didn't receive your confirmation email?
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResendConfirmation}
                            disabled={isLoading}
                            className="w-full bg-white/5 border-white/20 hover:bg-white/10"
                          >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Resend Confirmation Email
                          </Button>
                        </div>
                      )}
                    </div>
                </TabsContent>
                
                  <TabsContent value="signup" className="space-y-6 mt-6">
                    <form onSubmit={handleSignup} className="space-y-4">
                      {/* Show name fields and user type only for non-contextual signup */}
                      {!isContextualSignup && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <BrandedFormField
                              id="signup-firstname"
                              name="firstName"
                              type="text"
                              label="First Name"
                              placeholder="First name"
                              value={signupForm.firstName}
                              onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                              required
                            />
                            <BrandedFormField
                              id="signup-lastname"
                              name="lastName"
                              type="text"
                              label="Last Name"
                              placeholder="Last name"
                              value={signupForm.lastName}
                              onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="signup-usertype" className="text-sm font-medium">I am a...</Label>
                            <Select value={signupForm.userType} onValueChange={(value: 'client' | 'trainer') => setSignupForm({ ...signupForm, userType: value })}>
                              <SelectTrigger className="rounded-lg border-2 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="client">Client looking for a coach</SelectItem>
                                <SelectItem value="trainer">Coach</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                      
                      {/* Show user type indicator for contextual signup */}
                      {isContextualSignup && (
                        <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                           <p className="text-sm text-primary font-medium">
                             Signing up as: {signupContext === 'client' || signupContext === 'true' ? 'Client looking for a coach' : 'Coach'}
                           </p>
                        </div>
                      )}
                     
                      <BrandedFormField
                        id="signup-email"
                        name="email"
                        type="email"
                        label="Email"
                        placeholder="Enter your email"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                        required
                      />
                     
                      <BrandedFormField
                        id="signup-password"
                        name="password"
                        type="password"
                        label="Password"
                        placeholder="Create a password"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                        required
                      />
                      {signupForm.password && (
                        <PasswordCriteria password={signupForm.password} className="mt-2" />
                      )}
                     
                      <BrandedFormField
                        id="signup-confirm"
                        name="confirmPassword"
                        type="password"
                        label="Confirm Password"
                        placeholder="Confirm your password"
                        value={signupForm.confirmPassword}
                        onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                        required
                      />
                     
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-primary hover:shadow-primary transition-all duration-200" 
                        disabled={isLoading}
                        size="lg"
                      >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </div>
            )}
        </EnhancedAuthLayout>
  );
}
