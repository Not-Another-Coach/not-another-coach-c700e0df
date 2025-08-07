import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, User, Mail, Calendar, Shield } from 'lucide-react';

interface UserValidityResponse {
  isValid: boolean;
  userExists: boolean;
  hasProfile: boolean;
  userType?: string;
  accountStatus?: string;
  lastLogin?: string;
  emailVerified?: boolean;
  error?: string;
}

export function UserValidityChecker() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UserValidityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkUserValidity = async () => {
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('check-user-validity', {
        body: { email: email.trim() }
      });

      if (functionError) {
        throw functionError;
      }

      setResult(data);
    } catch (err) {
      console.error('Error checking user validity:', err);
      setError(err.message || 'Failed to check user validity');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkUserValidity();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          User Validity Checker
        </CardTitle>
        <CardDescription>
          Check if a user exists and verify their account status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter email address to check"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Checking...' : 'Check User'}
            </Button>
          </div>
        </form>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {result.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-medium">
                {result.isValid ? 'User is valid' : 'User not found'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">Exists in Auth:</span>
                  <Badge variant={result.userExists ? 'default' : 'secondary'}>
                    {result.userExists ? 'Yes' : 'No'}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">Has Profile:</span>
                  <Badge variant={result.hasProfile ? 'default' : 'secondary'}>
                    {result.hasProfile ? 'Yes' : 'No'}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm font-medium">Email Verified:</span>
                  <Badge variant={result.emailVerified ? 'default' : 'secondary'}>
                    {result.emailVerified ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                {result.userType && (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">User Type:</span>
                    <Badge variant="outline">{result.userType}</Badge>
                  </div>
                )}

                {result.accountStatus && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Account Status:</span>
                    <Badge variant={result.accountStatus === 'active' ? 'default' : 'secondary'}>
                      {result.accountStatus}
                    </Badge>
                  </div>
                )}

                {result.lastLogin && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">Last Login:</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(result.lastLogin).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {result.error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{result.error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}