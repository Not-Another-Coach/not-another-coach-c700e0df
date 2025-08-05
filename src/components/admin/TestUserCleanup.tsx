import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Trash2, RefreshCw, Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const TestUserCleanup = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const testEmails = [
    'client1@test.com',
    'client2@test.com', 
    'client3@test.com',
    'client4@test.com',
    'client5@test.com',
    'trainerA@test.com',
    'trainerB@test.com',
    'trainerC@test.com',
    'trainerD@test.com',
    'trainerE@test.com'
  ];

  const deleteTestUsers = async () => {
    setIsDeleting(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('cleanup-test-users', {
        body: { 
          action: 'delete',
          emails: testEmails
        }
      });

      if (error) {
        throw error;
      }

      setResults(data);
      
      toast({
        title: "Cleanup completed",
        description: `Deleted ${data.summary.deleted} users, ${data.summary.errors} errors`,
        variant: data.summary.errors === 0 ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Cleanup failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const resetResults = () => {
    setResults(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Test User Cleanup
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Remove test users that are blocking bulk uploads. This will permanently delete users and all their data.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Emails List */}
        <div>
          <h4 className="font-medium mb-3">Test Email Addresses to Remove:</h4>
          <div className="flex flex-wrap gap-2">
            {testEmails.map((email) => (
              <Badge key={email} variant="outline" className="font-mono text-xs">
                {email}
              </Badge>
            ))}
          </div>
        </div>

        {/* Warning */}
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> This action permanently deletes users and all their associated data. 
            This cannot be undone. Only use this for test/development users.
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={deleteTestUsers}
            disabled={isDeleting}
            variant="destructive"
            className="flex items-center gap-2"
          >
            {isDeleting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {isDeleting ? 'Deleting...' : 'Delete Test Users'}
          </Button>
          
          {results && (
            <Button onClick={resetResults} variant="outline">
              Clear Results
            </Button>
          )}
        </div>

        {/* Results */}
        {results && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                {results.summary.errors === 0 ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-green-500" />
                    Cleanup Successful
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    Cleanup Completed with Errors
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{results.summary.total}</div>
                  <div className="text-sm text-muted-foreground">Total Found</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">{results.summary.deleted}</div>
                  <div className="text-sm text-muted-foreground">Deleted</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">{results.summary.errors}</div>
                  <div className="text-sm text-muted-foreground">Errors</div>
                </div>
              </div>

              {results.errors && results.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Errors:</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {results.errors.map((error: string, index: number) => (
                      <div key={index} className="text-sm p-2 bg-red-50 rounded text-red-700">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.summary.deleted > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Successfully deleted {results.summary.deleted} test users. 
                    You can now retry your bulk upload.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        <div className="text-xs text-muted-foreground">
          <strong>How it works:</strong> This function finds all users with the test email addresses (case-insensitive) 
          and deletes them from both the authentication system and profiles table.
        </div>
      </CardContent>
    </Card>
  );
};