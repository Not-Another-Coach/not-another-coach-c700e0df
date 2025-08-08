import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plus } from 'lucide-react';
import { addCoachDeclineBehaviorArticle } from '@/utils/addCoachDeclineBehaviorArticle';
import { useToast } from '@/hooks/use-toast';

export const AddCoachDeclineArticle: React.FC = () => {
  const { toast } = useToast();

  const handleAddArticle = async () => {
    try {
      await addCoachDeclineBehaviorArticle();
      toast({
        title: 'Success',
        description: 'Coach decline behavior article added to knowledge base',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add article to knowledge base',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Coach Decline Behavior Documentation
        </CardTitle>
        <CardDescription>
          Add comprehensive documentation about how the system handles declined coaching requests and preserves interaction history.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p><strong>This article covers:</strong></p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Engagement stage transitions (declined → declined_dismissed)</li>
              <li>Remove functionality that preserves decline history</li>
              <li>"Previously Declined" labels in Explore Coaches</li>
              <li>Database implementation and related functions</li>
              <li>UI components and user experience flow</li>
              <li>Testing scenarios and edge cases</li>
            </ul>
          </div>
          
          <Button onClick={handleAddArticle} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Coach Decline Behavior Article
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};