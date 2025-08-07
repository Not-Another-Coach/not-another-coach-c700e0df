import React, { useState, useEffect } from 'react';
import { Save, X, Eye, Clock, Archive, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  useKBCategories, 
  useCreateKBArticle, 
  useUpdateKBArticle, 
  type KBArticle,
  type KBContentType,
  type KBArticleStatus 
} from '@/hooks/useKnowledgeBase';

interface KBArticleEditorProps {
  article?: KBArticle | null;
  onClose: () => void;
}

export const KBArticleEditor: React.FC<KBArticleEditorProps> = ({
  article,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    content_type: 'feature' as KBContentType,
    status: 'draft' as KBArticleStatus,
    category_id: '',
    featured: false,
    metadata: {} as Record<string, any>,
  });

  const [isPreview, setIsPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: categories = [] } = useKBCategories();
  const createArticle = useCreateKBArticle();
  const updateArticle = useUpdateKBArticle();

  const isEditing = !!article;

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        slug: article.slug,
        content: article.content,
        excerpt: article.excerpt || '',
        content_type: article.content_type,
        status: article.status,
        category_id: article.category_id || 'no-category',
        featured: article.featured,
        metadata: article.metadata || {},
      });
    }
  }, [article]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: !isEditing ? generateSlug(title) : prev.slug,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const articleData = {
        ...formData,
        category_id: formData.category_id === 'no-category' ? null : formData.category_id,
        published_at: formData.status === 'published' ? new Date().toISOString() : null,
      };

      if (isEditing && article) {
        await updateArticle.mutateAsync({
          id: article.id,
          ...articleData,
        });
      } else {
        await createArticle.mutateAsync(articleData as any);
      }

      onClose();
    } catch (error) {
      console.error('Failed to save article:', error);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to discard your changes?')) {
      onClose();
    }
  };

  const contentTypes = [
    { value: 'feature', label: 'Feature' },
    { value: 'api', label: 'API' },
    { value: 'component', label: 'Component' },
    { value: 'hook', label: 'Hook' },
    { value: 'database', label: 'Database' },
    { value: 'business_rule', label: 'Business Rule' },
    { value: 'integration', label: 'Integration' },
  ];

  const statuses = [
    { value: 'draft', label: 'Draft', icon: Clock },
    { value: 'published', label: 'Published', icon: Eye },
    { value: 'archived', label: 'Archived', icon: Archive },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h2 className="text-2xl font-bold">
            {isEditing ? 'Edit Article' : 'Create New Article'}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? 'Update your documentation' : 'Add new content to the knowledge base'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsPreview(!isPreview)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {isPreview ? 'Edit' : 'Preview'}
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={createArticle.isPending || updateArticle.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Form */}
        <div className="w-1/2 p-6 overflow-y-auto border-r">
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Core details about your article
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter article title"
                    className={errors.title ? 'border-destructive' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="url-friendly-slug"
                    className={errors.slug ? 'border-destructive' : ''}
                  />
                  {errors.slug && (
                    <p className="text-sm text-destructive mt-1">{errors.slug}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Brief description of the article"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Classification */}
            <Card>
              <CardHeader>
                <CardTitle>Classification</CardTitle>
                <CardDescription>
                  Categorize and organize your content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="content_type">Content Type</Label>
                  <Select
                    value={formData.content_type}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      content_type: value as KBContentType 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      category_id: value 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-category">No category</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Publishing */}
            <Card>
              <CardHeader>
                <CardTitle>Publishing</CardTitle>
                <CardDescription>
                  Control visibility and status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      status: value as KBArticleStatus 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          <div className="flex items-center">
                            <status.icon className="h-4 w-4 mr-2" />
                            {status.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      featured: checked 
                    }))}
                  />
                  <Label htmlFor="featured">Featured article</Label>
                </div>

                {formData.status === ('published' as KBArticleStatus) && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      This article will be visible to all users once saved.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Panel - Content/Preview */}
        <div className="w-1/2 p-6 overflow-y-auto">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>
                {isPreview ? 'Preview' : 'Content'} *
              </CardTitle>
              <CardDescription>
                {isPreview 
                  ? 'How your article will appear to readers'
                  : 'Write your article content in Markdown'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="h-full">
              {isPreview ? (
                <div className="prose prose-sm max-w-none">
                  <h1>{formData.title}</h1>
                  {formData.excerpt && (
                    <p className="lead text-muted-foreground">{formData.excerpt}</p>
                  )}
                  <Separator className="my-4" />
                  <div className="whitespace-pre-wrap">{formData.content}</div>
                </div>
              ) : (
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your article content here..."
                  className={`min-h-[500px] font-mono ${errors.content ? 'border-destructive' : ''}`}
                />
              )}
              {errors.content && (
                <p className="text-sm text-destructive mt-2">{errors.content}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};