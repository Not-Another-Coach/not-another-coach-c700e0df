import React, { useState, useCallback } from 'react';
import { Clock, Eye, CheckCircle, XCircle, Edit, Trash2, FileText, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  useKBArticles, 
  useUpdateKBArticle, 
  useDeleteKBArticle,
  type KBArticle 
} from '@/hooks/useKnowledgeBase';
import { KBArticleEditor } from './KBArticleEditor';
import { StagingQuickActions } from './StagingQuickActions';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export const ArticleStagingManager: React.FC = () => {
  const { toast } = useToast();
  const [selectedArticle, setSelectedArticle] = useState<KBArticle | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [previewArticle, setPreviewArticle] = useState<KBArticle | null>(null);
  
  // Fetch staged articles
  const { data: stagingArticles = [], isLoading, refetch } = useKBArticles({
    status: 'staging'
  });
  
  const updateArticleMutation = useUpdateKBArticle();
  const deleteArticleMutation = useDeleteKBArticle();

  const handlePublish = useCallback(async (article: KBArticle) => {
    try {
      await updateArticleMutation.mutateAsync({
        id: article.id,
        status: 'published',
        published_at: new Date().toISOString()
      });
      
      toast({
        title: 'Article Published',
        description: `"${article.title}" has been published to the knowledge base.`,
      });
      
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to publish article.',
        variant: 'destructive',
      });
    }
  }, [updateArticleMutation, toast, refetch]);

  const handleReject = useCallback(async (article: KBArticle) => {
    try {
      await updateArticleMutation.mutateAsync({
        id: article.id,
        status: 'draft'
      });
      
      toast({
        title: 'Article Moved to Draft',
        description: `"${article.title}" has been moved back to draft status.`,
      });
      
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to move article to draft.',
        variant: 'destructive',
      });
    }
  }, [updateArticleMutation, toast, refetch]);

  const handleDelete = useCallback(async (article: KBArticle) => {
    if (!confirm(`Are you sure you want to delete "${article.title}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await deleteArticleMutation.mutateAsync(article.id);
      
      toast({
        title: 'Article Deleted',
        description: `"${article.title}" has been permanently deleted.`,
      });
      
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete article.',
        variant: 'destructive',
      });
    }
  }, [deleteArticleMutation, toast, refetch]);

  const handleEdit = useCallback((article: KBArticle) => {
    setSelectedArticle(article);
    setShowEditor(true);
  }, []);

  const handleCloseEditor = useCallback(() => {
    setSelectedArticle(null);
    setShowEditor(false);
    refetch();
  }, [refetch]);

  if (showEditor) {
    return (
      <KBArticleEditor 
        article={selectedArticle} 
        onClose={handleCloseEditor}
      />
    );
  }

  if (previewArticle) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setPreviewArticle(null)}>
            ← Back to Staging
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleEdit(previewArticle)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="default" 
              onClick={() => handlePublish(previewArticle)}
              disabled={updateArticleMutation.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {updateArticleMutation.isPending ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <CardTitle>{previewArticle.title}</CardTitle>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Staging
              </Badge>
            </div>
            {previewArticle.excerpt && (
              <CardDescription>{previewArticle.excerpt}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg overflow-auto">
                {previewArticle.content}
              </pre>
            </div>
            
            {previewArticle.metadata && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-2">Metadata</h4>
                <pre className="text-xs bg-muted p-2 rounded">
                  {JSON.stringify(previewArticle.metadata, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Article Staging</h2>
          <p className="text-muted-foreground">
            Review and manage articles awaiting publication
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {stagingArticles.length} articles in staging
        </Badge>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-muted-foreground">Loading staged articles...</p>
            </div>
          </CardContent>
        </Card>
      ) : stagingArticles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Articles in Staging</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Articles with "staging" status will appear here for review before publication.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <StagingQuickActions />
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              These articles are saved but not yet published. Review each article and choose to publish, edit, or move back to draft.
            </AlertDescription>
          </Alert>

          {stagingArticles.map((article) => (
            <Card key={article.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Staging
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {article.content_type}
                      </Badge>
                    </div>
                    {article.excerpt && (
                      <CardDescription className="text-sm">
                        {article.excerpt}
                      </CardDescription>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Created: {format(new Date(article.created_at), 'MMM d, yyyy')}</span>
                      <span>Updated: {format(new Date(article.updated_at), 'MMM d, yyyy')}</span>
                      <span>{article.content.length} characters</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewArticle(article)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(article)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handlePublish(article)}
                    disabled={updateArticleMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Publish
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReject(article)}
                    disabled={updateArticleMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Move to Draft
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(article)}
                    disabled={deleteArticleMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};