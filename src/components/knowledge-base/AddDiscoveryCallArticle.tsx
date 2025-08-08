import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { addDiscoveryCallBookingArticle } from '@/utils/addDiscoveryCallArticle';
import { FileText } from 'lucide-react';

export const AddDiscoveryCallArticle = () => {
  const { toast } = useToast();

  const handleAddArticle = async () => {
    try {
      await addDiscoveryCallBookingArticle();
      toast({
        title: 'Success',
        description: 'Discovery Call Booking System article added to knowledge base',
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
      <FileText className="h-4 w-4" />
      Add Discovery Call Article to KB
    </Button>
  );
};