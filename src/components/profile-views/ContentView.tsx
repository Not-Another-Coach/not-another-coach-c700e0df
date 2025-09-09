import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, BookOpen, Dumbbell, Heart, ExternalLink, Clock, Eye } from 'lucide-react';
import { AnyTrainer } from '@/types/trainer';

interface ContentViewProps {
  trainer: AnyTrainer;
}

// Mock data for content - would come from trainer profile in real implementation
const mockContentData = {
  videos: [
    {
      id: 1,
      title: "Perfect Form: Deadlift Basics",
      thumbnail: "/api/placeholder/300/200",
      duration: "4:32",
      views: 1240,
      type: "Exercise Tutorial",
      description: "Master the fundamentals of deadlifting with proper form and technique."
    },
    {
      id: 2,
      title: "Quick Morning Routine",
      thumbnail: "/api/placeholder/300/200", 
      duration: "8:15",
      views: 890,
      type: "Workout",
      description: "Start your day right with this energizing 8-minute routine."
    },
    {
      id: 3,
      title: "Nutrition Tips for Fat Loss",
      thumbnail: "/api/placeholder/300/200",
      duration: "6:48", 
      views: 2100,
      type: "Education",
      description: "Learn the key principles of nutrition for sustainable fat loss."
    }
  ],
  articles: [
    {
      id: 1,
      title: "5 Common Gym Mistakes and How to Avoid Them",
      excerpt: "Even experienced gym-goers make these fundamental mistakes that can hinder progress...",
      readTime: "5 min read",
      category: "Technique",
      publishDate: "2024-01-15"
    },
    {
      id: 2,
      title: "Building Confidence in the Gym: A Beginner's Guide", 
      excerpt: "Starting your fitness journey can feel overwhelming. Here's how to build confidence...",
      readTime: "7 min read", 
      category: "Mindset",
      publishDate: "2024-01-10"
    },
    {
      id: 3,
      title: "The Science of Progressive Overload",
      excerpt: "Understanding progressive overload is key to continued progress in strength training...",
      readTime: "6 min read",
      category: "Science",
      publishDate: "2024-01-08"
    }
  ],
  workoutPlans: [
    {
      id: 1,
      name: "Beginner Full Body",
      description: "Perfect starter program for building strength and confidence",
      duration: "4 weeks",
      frequency: "3x/week",
      difficulty: "Beginner",
      downloads: 156
    },
    {
      id: 2, 
      name: "Upper/Lower Split",
      description: "Intermediate program for balanced muscle development",
      duration: "6 weeks",
      frequency: "4x/week", 
      difficulty: "Intermediate",
      downloads: 89
    }
  ],
  socialPosts: [
    {
      id: 1,
      platform: "Instagram",
      content: "Remember: progress isn't always visible on the scale. Sometimes it's in how you feel, how your clothes fit, or how much stronger you've become. Trust the process! 💪",
      likes: 245,
      type: "motivational"
    },
    {
      id: 2,
      platform: "Instagram", 
      content: "Quick tip: If you're new to the gym, start with bodyweight exercises at home. Build confidence and movement patterns before adding weights.",
      likes: 189,
      type: "tip"
    }
  ]
};

export const ContentView = ({ trainer }: ContentViewProps) => {
  return (
    <div className="space-y-6">
      {/* Video Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Training Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockContentData.videos.map((video) => (
              <div key={video.id} className="group cursor-pointer">
                <div className="relative rounded-lg overflow-hidden mb-3">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-32 object-cover bg-muted group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                  <Badge className="absolute bottom-2 right-2 bg-black/80 text-white">
                    {video.duration}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-xs">
                    {video.type}
                  </Badge>
                  <h4 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {video.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {video.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    <span>{video.views} views</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Articles & Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Articles & Education
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockContentData.articles.map((article) => (
              <div key={article.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {article.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                    
                    <h4 className="font-semibold mb-2 hover:text-primary transition-colors">
                      {article.title}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {article.excerpt}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Published {new Date(article.publishDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workout Plans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Sample Workout Plans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {mockContentData.workoutPlans.map((plan) => (
              <div key={plan.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold">{plan.name}</h4>
                  <Badge variant={plan.difficulty === 'Beginner' ? 'secondary' : 'outline'}>
                    {plan.difficulty}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {plan.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{plan.duration}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frequency:</span>
                    <span className="font-medium">{plan.frequency}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Downloads:</span>
                    <span className="font-medium">{plan.downloads}</span>
                  </div>
                </div>
                
                <Button variant="outline" size="sm" className="w-full">
                  View Sample
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Social Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Daily Motivation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockContentData.socialPosts.map((post) => (
              <div key={post.id} className="border rounded-lg p-4 bg-gradient-to-br from-muted/20 to-muted/5">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-xs">
                    {post.platform}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {post.type}
                  </Badge>
                </div>
                
                <p className="text-sm leading-relaxed mb-3">
                  {post.content}
                </p>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Heart className="h-4 w-4" />
                  <span>{post.likes} likes</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};