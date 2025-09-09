import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Star, 
  Calendar,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Video,
  ExternalLink,
  Search,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Content {
  id: string;
  title: string;
  description: string;
  content_type: string;
  media_urls: string[];
  is_active: boolean;
  featured_until?: string;
  created_at: string;
  trainer_id: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

export function ContentManagement() {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("active");
  const { toast } = useToast();

  useEffect(() => {
    loadContent();
  }, [filter]);

  const loadContent = async () => {
    try {
      // Use mock data for now
      const mockContent: Content[] = [
        {
          id: '1',
          title: 'Amazing Client Transformation',
          description: 'This client achieved incredible results in just 12 weeks.',
          content_type: 'transformation',
          media_urls: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'],
          is_active: true,
          featured_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          trainer_id: 'trainer-1',
          profiles: {
            first_name: 'John',
            last_name: 'Smith'
          }
        },
        {
          id: '2',
          title: 'Morning Motivation',
          description: 'Start your day with powerful motivational content.',
          content_type: 'motivational',
          media_urls: ['https://images.unsplash.com/photo-1549476464-37392f717541?w=400'],
          is_active: filter !== 'inactive',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          trainer_id: 'trainer-2',
          profiles: {
            first_name: 'Sarah',
            last_name: 'Johnson'
          }
        }
      ];

      const filteredData = filter === 'all' 
        ? mockContent 
        : filter === 'active' 
        ? mockContent.filter(c => c.is_active)
        : mockContent.filter(c => !c.is_active);
      
      setContent(filteredData);
    } catch (error) {
      console.error('Error loading content:', error);
      toast({
        title: "Error",
        description: "Failed to load content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleContentStatus = async (contentId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('highlights_content')
        .update({ is_active: isActive })
        .eq('id', contentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Content ${isActive ? 'activated' : 'deactivated'} successfully`,
      });

      await loadContent();
    } catch (error) {
      console.error('Error updating content status:', error);
      toast({
        title: "Error",
        description: "Failed to update content status",
        variant: "destructive"
      });
    }
  };

  const extendFeaturedPeriod = async (contentId: string, days: number) => {
    try {
      const newFeaturedUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      
      const { error } = await supabase
        .from('highlights_content')
        .update({ featured_until: newFeaturedUntil })
        .eq('id', contentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Featured period extended by ${days} days`,
      });

      await loadContent();
    } catch (error) {
      console.error('Error extending featured period:', error);
      toast({
        title: "Error",
        description: "Failed to extend featured period",
        variant: "destructive"
      });
    }
  };

  const deleteContent = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('highlights_content')
        .delete()
        .eq('id', contentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Content deleted successfully",
      });

      await loadContent();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive"
      });
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'transformation': return '✨';
      case 'motivational': return '💪';
      case 'article': return '📖';
      case 'tip': return '💡';
      default: return '⭐';
    }
  };

  const filteredContent = content.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${item.profiles?.first_name} ${item.profiles?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Content Library
          </CardTitle>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="all">All Content</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse p-4 border rounded-lg">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredContent.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No content found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredContent.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-xl">
                        {getContentTypeIcon(item.content_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{item.title}</h4>
                          <Badge variant={item.is_active ? "default" : "secondary"}>
                            {item.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            By {item.profiles?.first_name} {item.profiles?.last_name}
                          </span>
                          <span>
                            Created {format(new Date(item.created_at), 'MMM d, yyyy')}
                          </span>
                          {item.featured_until && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Featured until {format(new Date(item.featured_until), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>
                        {item.media_urls?.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {item.media_urls.map((url, index) => (
                              <Button key={index} variant="ghost" size="sm" asChild>
                                <a href={url} target="_blank" rel="noopener noreferrer">
                                  {url.includes('video') ? (
                                    <Video className="h-3 w-3" />
                                  ) : (
                                    <ImageIcon className="h-3 w-3" />
                                  )}
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`active-${item.id}`} className="text-xs">
                          {item.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        </Label>
                        <Switch
                          id={`active-${item.id}`}
                          checked={item.is_active}
                          onCheckedChange={(checked) => toggleContentStatus(item.id, checked)}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => extendFeaturedPeriod(item.id, 7)}
                      >
                        <Calendar className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteContent(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}