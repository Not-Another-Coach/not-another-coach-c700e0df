import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types
export interface KBCategory {
  id: string;
  name: string;
  description?: string;
  slug: string;
  parent_id?: string;
  display_order: number;
  icon?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export type KBContentType = 'feature' | 'api' | 'component' | 'hook' | 'database' | 'business_rule' | 'integration';
export type KBArticleStatus = 'draft' | 'published' | 'archived' | 'staging';

export interface KBArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  content_type: KBContentType;
  status: KBArticleStatus;
  category_id?: string;
  featured: boolean;
  view_count: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  published_at?: string;
  created_by?: string;
  updated_by?: string;
  category?: KBCategory;
  tags?: KBTag[];
}

export interface KBTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  usage_count: number;
  created_at: string;
}

export interface KBArticleRevision {
  id: string;
  article_id: string;
  revision_number: number;
  title: string;
  content: string;
  excerpt?: string;
  metadata?: Record<string, any>;
  change_summary?: string;
  created_at: string;
  created_by?: string;
}

// Hook for categories
export const useKBCategories = () => {
  return useQuery({
    queryKey: ['kb-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kb_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data as KBCategory[];
    },
  });
};

// Hook for articles with advanced filtering
export const useKBArticles = (filters?: {
  category?: string;
  content_type?: KBContentType;
  status?: KBArticleStatus;
  featured?: boolean;
  search?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['kb-articles', filters],
    queryFn: async () => {
      let query = supabase
        .from('kb_articles')
        .select(`
          *,
          category:kb_categories(*)
        `);

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      } else {
        query = query.eq('status', 'published' as KBArticleStatus);
      }

      if (filters?.category) {
        query = query.eq('category_id', filters.category);
      }

      if (filters?.content_type) {
        query = query.eq('content_type', filters.content_type);
      }

      if (filters?.featured !== undefined) {
        query = query.eq('featured', filters.featured);
      }

      if (filters?.search) {
        try {
          // Format search query for PostgreSQL full-text search
          const formattedQuery = filters.search
            .trim()
            .split(/\s+/)
            .map(word => word.replace(/[^a-zA-Z0-9]/g, '')) // Remove special characters
            .filter(word => word.length > 0)
            .join(' & '); // Join with AND operator
          
          if (formattedQuery) {
            query = query.textSearch('search_vector', formattedQuery);
          }
        } catch (error) {
          // Fallback to simple text search if full-text search fails
          console.warn('Full-text search failed, falling back to simple search:', error);
          const searchTerm = `%${filters.search}%`;
          query = query.or(`title.ilike.${searchTerm},content.ilike.${searchTerm},excerpt.ilike.${searchTerm}`);
        }
      }

      query = query.order('featured', { ascending: false })
                  .order('updated_at', { ascending: false });

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as KBArticle[];
    },
  });
};

// Hook for single article
export const useKBArticle = (slug: string) => {
  return useQuery({
    queryKey: ['kb-article', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kb_articles')
        .select(`
          *,
          category:kb_categories(*),
          tags:kb_article_tags(
            tag:kb_tags(*)
          )
        `)
        .eq('slug', slug)
        .eq('status', 'published' as KBArticleStatus)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        // Transform tags
        const transformedData = {
          ...data,
          tags: data.tags?.map((t: any) => t.tag) || []
        };
        
        // Increment view count
        await supabase
          .from('kb_articles')
          .update({ view_count: data.view_count + 1 })
          .eq('id', data.id);
        
        return transformedData as KBArticle;
      }
      
      return null;
    },
  });
};

// Hook for article revisions (admin only)
export const useKBArticleRevisions = (articleId: string) => {
  return useQuery({
    queryKey: ['kb-article-revisions', articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kb_article_revisions')
        .select('*')
        .eq('article_id', articleId)
        .order('revision_number', { ascending: false });
      
      if (error) throw error;
      return data as KBArticleRevision[];
    },
  });
};

// Hook for tags
export const useKBTags = () => {
  return useQuery({
    queryKey: ['kb-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kb_tags')
        .select('*')
        .order('usage_count', { ascending: false });
      
      if (error) throw error;
      return data as KBTag[];
    },
  });
};

// Mutation hooks for admin operations
export const useCreateKBArticle = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (article: Omit<KBArticle, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'category' | 'tags'>) => {
      const { data, error } = await supabase
        .from('kb_articles')
        .insert(article)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kb-articles'] });
      toast({
        title: 'Success',
        description: 'Article created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create article: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateKBArticle = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<KBArticle> & { id: string }) => {
      const { data, error } = await supabase
        .from('kb_articles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kb-articles'] });
      toast({
        title: 'Success',
        description: 'Article updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update article: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteKBArticle = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('kb_articles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kb-articles'] });
      toast({
        title: 'Success',
        description: 'Article deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete article: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
};

export const useCreateKBCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (category: Omit<KBCategory, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('kb_categories')
        .insert(category)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kb-categories'] });
      toast({
        title: 'Success',
        description: 'Category created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create category: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateKBCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<KBCategory> & { id: string }) => {
      const { data, error } = await supabase
        .from('kb_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kb-categories'] });
      toast({
        title: 'Success',
        description: 'Category updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update category: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
};