import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { KBContentType } from '@/hooks/useKnowledgeBase';

interface CreateStagedArticleProps {
  title: string;
  content: string;
  excerpt?: string;
  contentType?: KBContentType;
  metadata?: Record<string, any>;
}

export const useStagedArticleCreator = () => {
  const { toast } = useToast();

  const createStagedArticle = async ({
    title,
    content,
    excerpt,
    contentType = 'business_rule',
    metadata = {}
  }: CreateStagedArticleProps) => {
    try {
      // Generate slug from title
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      const article = {
        title,
        slug,
        content,
        excerpt,
        content_type: contentType,
        status: 'staging' as const,
        featured: false,
        metadata: {
          ...metadata,
          created_via: 'staging_system',
          created_at: new Date().toISOString()
        }
      };

      const { data, error } = await supabase
        .from('kb_articles')
        .insert(article)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Article Staged',
        description: `"${title}" has been saved to staging for review.`,
      });
      
      return { data, success: true };
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to stage article: ${error.message}`,
        variant: 'destructive',
      });
      return { error, success: false };
    }
  };

  return { createStagedArticle };
};

// Quick staging component for common use cases
export const QuickStagingActions: React.FC = () => {
  const { createStagedArticle } = useStagedArticleCreator();

  const handleCreateTemplate = async () => {
    await createStagedArticle({
      title: 'New Article Template',
      content: `# Article Title

## Overview
Brief description of what this article covers.

## Key Points
- Point 1
- Point 2
- Point 3

## Implementation Details
Detailed explanation goes here.

## Related Components
- Component 1
- Component 2

## Testing Notes
Any testing considerations.
      `,
      excerpt: 'Template article ready for customization',
      contentType: 'business_rule',
      metadata: {
        tags: ['template'],
        type: 'template'
      }
    });
  };

  return (
    <Card className="border-dashed border-2 border-muted-foreground/25">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-muted-foreground">
          <FileText className="h-5 w-5" />
          Quick Staging Actions
        </CardTitle>
        <CardDescription>
          Create staged articles that await your review before publishing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleCreateTemplate} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Create Article Template
        </Button>
      </CardContent>
    </Card>
  );
};