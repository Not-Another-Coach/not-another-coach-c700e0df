import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export function SessionNotification() {
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'activeSessionId') {
        const currentSessionId = sessionStorage.getItem('currentSessionId');
        if (e.newValue !== currentSessionId) {
          setShowNotification(true);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!showNotification) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>You've been logged out because you signed in from another tab.</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            className="ml-2"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}