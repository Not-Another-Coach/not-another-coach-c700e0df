import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useTrainer4FixStatus } from '@/hooks/useTrainer4FixStatus';

export const Trainer4StatusFixer = () => {
  const { fixTrainer4Status, loading } = useTrainer4FixStatus();

  const handleFixStatus = async () => {
    try {
      await fixTrainer4Status();
    } catch (error) {
      console.error('Error fixing trainer 4 status:', error);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          Trainer 4 Status Fixer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This utility verifies Trainer 4's status and syncs verification fields.
          It will check that verification_status and is_verified are consistent,
          and auto-publish if verified with approved publication.
        </p>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleFixStatus}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Checking Status...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Fix Trainer Status & Sync Fields
              </>
            )}
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <Badge variant="outline" className="text-xs">
            Admin Only
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};