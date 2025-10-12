import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Package, Plus } from 'lucide-react';
import { addPackagesUIArticle } from '@/utils/addPackagesUIArticle';
import { useToast } from '@/hooks/use-toast';

export const AddPackagesUIArticle: React.FC = () => {
  const { toast } = useToast();

  const handleAddArticle = async () => {
    try {
      await addPackagesUIArticle();
      toast({
        title: 'Success',
        description: 'Packages & Ways of Working UI design article added to knowledge base',
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
          <Package className="h-5 w-5" />
          <FileText className="h-5 w-5" />
          Packages UI Design System
        </CardTitle>
        <CardDescription>
          Add comprehensive documentation about the premium UI design for trainer packages and ways of working using the blue color palette.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p><strong>This article covers:</strong></p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Blue color palette specifications (primary, secondary, energy)</li>
              <li>"What's Always Included" section design</li>
              <li>Premium package card layouts with featured highlighting</li>
              <li>Collapsible comparison table implementation</li>
              <li>Decorative background elements</li>
              <li>Typography, spacing, and interaction patterns</li>
              <li>Implementation roadmap with priorities</li>
            </ul>
          </div>
          
          <Button onClick={handleAddArticle} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Packages UI Design Article
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
