import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Quote, Heart, Users, Calendar, Award } from 'lucide-react';
import { Trainer } from '@/components/TrainerCard';

interface StoryViewProps {
  trainer: Trainer;
}

// Mock data for story content - would come from trainer profile in real implementation
const mockStoryData = {
  personalStory: {
    journey: "My fitness journey began 8 years ago when I was struggling with my own health and confidence. After transforming my life through proper training and nutrition, I discovered my passion for helping others achieve their goals. I've since dedicated my career to empowering people to become the best versions of themselves.",
    philosophy: "I believe fitness is not just about physical transformation—it's about building mental resilience, confidence, and creating sustainable lifestyle changes that last a lifetime.",
    specialization: "Having overcome my own challenges with weight management and self-confidence, I specialize in working with clients who feel intimidated by traditional gyms or have struggled with consistency in the past."
  },
  testimonials: [
    {
      id: 1,
      clientName: "Sarah M.",
      rating: 5,
      text: "Working with this trainer completely changed my relationship with fitness. Not only did I lose 25 pounds, but I gained so much confidence. The personalized approach and constant support made all the difference.",
      duration: "6 months",
      goals: "Weight Loss & Confidence Building",
      verified: true
    },
    {
      id: 2,
      clientName: "Mike R.",
      rating: 5,
      text: "I've tried many trainers before, but none understood my busy schedule like this one. The flexible programming and nutrition guidance helped me build muscle while managing a demanding career.",
      duration: "8 months",
      goals: "Muscle Building & Time Management",
      verified: true
    },
    {
      id: 3,
      clientName: "Jennifer K.",
      rating: 5,
      text: "After having kids, I thought I'd never feel strong again. This trainer helped me rebuild my strength and confidence. The support throughout my journey was incredible.",
      duration: "10 months",
      goals: "Postpartum Fitness & Strength",
      verified: true
    }
  ],
  milestones: [
    { year: "2016", event: "Started personal fitness journey" },
    { year: "2018", event: "Became certified personal trainer" },
    { year: "2019", event: "Specialized in weight management coaching" },
    { year: "2021", event: "Launched online coaching programs" },
    { year: "2023", event: "Achieved 100+ client transformations" },
    { year: "2024", event: "Expanded to group coaching programs" }
  ]
};

export const StoryView = ({ trainer }: StoryViewProps) => {
  return (
    <div className="space-y-6">
      {/* Personal Journey */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            My Journey
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2 text-primary">How It All Started</h4>
            <p className="text-muted-foreground leading-relaxed">
              {mockStoryData.personalStory.journey}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2 text-primary">My Philosophy</h4>
            <p className="text-muted-foreground leading-relaxed">
              {mockStoryData.personalStory.philosophy}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2 text-primary">Why I Specialize</h4>
            <p className="text-muted-foreground leading-relaxed">
              {mockStoryData.personalStory.specialization}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Professional Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Professional Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockStoryData.milestones.map((milestone, index) => (
              <div key={index} className="flex items-start gap-4 p-3 rounded-lg bg-muted/30">
                <Badge variant="outline" className="shrink-0">{milestone.year}</Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium">{milestone.event}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Client Testimonials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Quote className="h-5 w-5" />
            Client Stories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {mockStoryData.testimonials.map((testimonial) => (
              <div key={testimonial.id} className="border rounded-lg p-6 bg-gradient-to-br from-muted/30 to-muted/10">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{testimonial.clientName}</h4>
                      {testimonial.verified && (
                        <Badge variant="secondary" className="text-xs">
                          <Award className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                      ))}
                    </div>
                    
                    <div className="flex gap-4 text-sm text-muted-foreground mb-3">
                      <span>{testimonial.duration}</span>
                      <span>•</span>
                      <span>{testimonial.goals}</span>
                    </div>
                  </div>
                </div>
                
                <blockquote className="relative">
                  <Quote className="h-4 w-4 text-muted-foreground/50 absolute -top-1 -left-1" />
                  <p className="italic text-muted-foreground leading-relaxed pl-6">
                    "{testimonial.text}"
                  </p>
                </blockquote>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Success Metrics from Stories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            What Clients Say
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-success/10 to-success/5 rounded-lg">
              <div className="text-2xl font-bold text-success">100%</div>
              <div className="text-sm text-muted-foreground">Recommend to Friends</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">{trainer.rating}</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg">
              <div className="text-2xl font-bold text-accent">95%</div>
              <div className="text-sm text-muted-foreground">Goal Achievement Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};