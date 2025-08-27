import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createInstagramGoalSettingArticle } from '@/utils/createInstagramGoalSettingArticle';
import { FileText, Instagram } from 'lucide-react';

export const AddInstagramGoalArticle = () => {
  const { toast } = useToast();

  const handleAddArticle = async () => {
    try {
      await createInstagramGoalSettingArticle();
      toast({
        title: 'Success',
        description: 'Instagram Integration and Goal Setting article added to knowledge base',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add article to knowledge base',
        variant: 'destructive',
      });
      console.error('Error adding article:', error);
    }
  };

  return (
    <Button onClick={handleAddArticle} className="flex items-center gap-2">
      <Instagram className="h-4 w-4" />
      <FileText className="h-4 w-4" />
      Add Instagram & Goals Article to KB
    </Button>
  );
};