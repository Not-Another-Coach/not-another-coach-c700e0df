import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Archive, FileText, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  useKBArticles, 
  useKBCategories, 
  useDeleteKBArticle,
  type KBArticle,
  type KBContentType,
  type KBArticleStatus 
} from '@/hooks/useKnowledgeBase';
import { KBArticleEditor } from './KBArticleEditor';
import { KBCategoryManager } from './KBCategoryManager';
import { format } from 'date-fns';

export const KnowledgeBaseAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('articles');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<KBArticleStatus | ''>('');
  const [selectedContentType, setSelectedContentType] = useState<KBContentType | ''>('');
  const [editingArticle, setEditingArticle] = useState<KBArticle | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data: categories = [] } = useKBCategories();
  const { data: articles = [], isLoading } = useKBArticles({
    search: searchTerm || undefined,
    category: selectedCategory || undefined,
    status: selectedStatus || undefined,
    content_type: selectedContentType || undefined,
  });
  const deleteArticle = useDeleteKBArticle();

  const handleCreateNew = () => {
    setEditingArticle(null);
    setIsCreating(true);
  };

  const handleEdit = (article: KBArticle) => {
    setEditingArticle(article);
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      await deleteArticle.mutateAsync(id);
    }
  };

  const handleCloseEditor = () => {
    setIsCreating(false);
    setEditingArticle(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-success text-success-foreground';
      case 'draft': return 'bg-warning text-warning-foreground';
      case 'archived': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'bg-blue-100 text-blue-800';
      case 'api': return 'bg-green-100 text-green-800';
      case 'component': return 'bg-purple-100 text-purple-800';
      case 'hook': return 'bg-yellow-100 text-yellow-800';
      case 'database': return 'bg-red-100 text-red-800';
      case 'business_rule': return 'bg-indigo-100 text-indigo-800';
      case 'integration': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isCreating) {
    return (
      <KBArticleEditor
        article={editingArticle}
        onClose={handleCloseEditor}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Knowledge Base</h2>
          <p className="text-muted-foreground">
            Manage your functional specification documentation
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          New Article
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as KBArticleStatus | '')}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedContentType} onValueChange={(value) => setSelectedContentType(value as KBContentType | '')}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="component">Component</SelectItem>
                  <SelectItem value="hook">Hook</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="business_rule">Business Rule</SelectItem>
                  <SelectItem value="integration">Integration</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Articles List */}
          <div className="grid gap-4">
            {isLoading ? (
              <div className="text-center py-8">Loading articles...</div>
            ) : articles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No articles found. {searchTerm && 'Try adjusting your search criteria.'}
              </div>
            ) : (
              articles.map((article) => (
                <Card key={article.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-xl">{article.title}</CardTitle>
                          {article.featured && (
                            <Badge variant="secondary">Featured</Badge>
                          )}
                        </div>
                        {article.excerpt && (
                          <CardDescription>{article.excerpt}</CardDescription>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(article)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(article.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(article.status)}>
                          {article.status}
                        </Badge>
                        <Badge variant="outline" className={getContentTypeColor(article.content_type)}>
                          {article.content_type}
                        </Badge>
                        {article.category && (
                          <Badge variant="outline">
                            {article.category.name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {article.view_count}
                        </div>
                        <div>
                          Updated {format(new Date(article.updated_at), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <KBCategoryManager />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{articles.length}</div>
                <p className="text-xs text-muted-foreground">
                  {articles.filter(a => a.status === 'published').length} published
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <Archive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{categories.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active categories
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {articles.reduce((sum, article) => sum + article.view_count, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all articles
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};