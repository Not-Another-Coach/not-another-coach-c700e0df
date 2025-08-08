import React from 'react';
import { ExternalLink, BookOpen, Tag, Clock, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useKBArticles, useKBCategories } from '@/hooks/useKnowledgeBase';
import { format } from 'date-fns';

interface KBDocumentationTabProps {
  searchTerm: string;
  onElementClick: (elementText: string) => void;
}

export const KBDocumentationTab: React.FC<KBDocumentationTabProps> = ({
  searchTerm,
  onElementClick,
}) => {
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useKBCategories();
  const { data: articles = [], isLoading: articlesLoading, error: articlesError } = useKBArticles({
    search: searchTerm || undefined,
    status: 'published',
  });

  // Debug logging
  console.log('KB Debug:', { 
    categories: categories.length, 
    articles: articles.length, 
    categoriesLoading, 
    articlesLoading,
    categoriesError,
    articlesError,
    searchTerm 
  });

  // Filter articles based on search term
  const filteredArticles = articles.filter(article =>
    !searchTerm || 
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLoading = categoriesLoading || articlesLoading;

  const getContentTypeColor = (type: string) => {
    const colors = {
      feature: 'bg-blue-100 text-blue-800',
      api: 'bg-green-100 text-green-800',
      component: 'bg-purple-100 text-purple-800',
      hook: 'bg-yellow-100 text-yellow-800',
      database: 'bg-red-100 text-red-800',
      business_rule: 'bg-indigo-100 text-indigo-800',
      integration: 'bg-teal-100 text-teal-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-2 text-muted-foreground">Loading knowledge base...</p>
      </div>
    );
  }

  if (categoriesError || articlesError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading knowledge base: {categoriesError?.message || articlesError?.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Knowledge Base Overview
          </CardTitle>
          <CardDescription>
            Comprehensive functional specification and system documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{articles.length}</div>
              <div className="text-sm text-muted-foreground">Total Articles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{categories.length}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {articles.reduce((sum, article) => sum + article.view_count, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {articles.filter(a => a.featured).length}
              </div>
              <div className="text-sm text-muted-foreground">Featured</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            Browse by functional areas and content types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onElementClick(`Category: ${category.name}`)}
                className="flex items-center p-3 rounded-lg border hover:bg-muted transition-colors text-left"
              >
                <div
                  className="w-3 h-3 rounded-full mr-3"
                  style={{ backgroundColor: category.color }}
                />
                <div className="flex-1">
                  <div className="font-medium">{category.name}</div>
                  {category.description && (
                    <div className="text-sm text-muted-foreground">{category.description}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Featured Articles */}
      {articles.some(a => a.featured) && (
        <Card>
          <CardHeader>
            <CardTitle>Featured Articles</CardTitle>
            <CardDescription>
              Important documentation highlights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {articles
                .filter(article => article.featured)
                .slice(0, 3)
                .map((article) => (
                  <button
                    key={article.id}
                    onClick={() => onElementClick(`Article: ${article.title}`)}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors text-left"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{article.title}</div>
                      {article.excerpt && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {article.excerpt}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Badge variant="outline" className={getContentTypeColor(article.content_type)}>
                        {article.content_type}
                      </Badge>
                      <Badge variant="secondary">Featured</Badge>
                    </div>
                  </button>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Articles */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Articles 
            {searchTerm && (
              <span className="text-base font-normal text-muted-foreground ml-2">
                ({filteredArticles.length} results)
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Complete documentation library
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm 
                  ? `No articles found matching "${searchTerm}"`
                  : 'No articles available'
                }
              </div>
            ) : (
              filteredArticles.map((article) => (
                <button
                  key={article.id}
                  onClick={() => onElementClick(`Article: ${article.title}`)}
                  className="w-full flex items-center justify-between p-4 rounded-lg border hover:bg-muted transition-colors text-left"
                >
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{article.title}</div>
                        {article.excerpt && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {article.excerpt}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(article.updated_at), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {article.view_count}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2 ml-4">
                    <Badge variant="outline" className={getContentTypeColor(article.content_type)}>
                      {article.content_type}
                    </Badge>
                    {article.category && (
                      <Badge variant="outline">
                        {article.category.name}
                      </Badge>
                    )}
                    {article.featured && (
                      <Badge variant="secondary">Featured</Badge>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common documentation tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => onElementClick('Create new article')}
              className="justify-start"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Create New Article
            </Button>
            <Button
              variant="outline"
              onClick={() => onElementClick('Manage categories')}
              className="justify-start"
            >
              <Tag className="h-4 w-4 mr-2" />
              Manage Categories
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};