import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, Quote } from 'lucide-react';

interface ReviewsBlockProps {
  trainer: any;
}

export const ReviewsBlock = ({ trainer }: ReviewsBlockProps) => {
  const testimonials = trainer.testimonials || [
    {
      name: 'Sarah M.',
      rating: 5,
      text: 'Amazing trainer! Lost 15lbs in 8 weeks and feeling stronger than ever.',
      achievement: 'Lost 15lbs'
    },
    {
      name: 'Mike D.',
      rating: 5,
      text: 'Professional, knowledgeable, and really motivating. Highly recommend!',
      achievement: 'Strength gains'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Star className="w-5 h-5" />
          Reviews & Testimonials
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(trainer.rating || 4.8)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-2xl font-bold">{trainer.rating || '4.8'}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Based on {trainer.total_ratings || 42} client reviews
          </p>
        </div>

        {/* Individual Testimonials */}
        <div className="space-y-4">
          {testimonials.slice(0, 3).map((testimonial: any, index: number) => (
            <div key={index} className="space-y-3">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={testimonial.image} />
                  <AvatarFallback>{testimonial.name?.[0] || 'C'}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{testimonial.name}</span>
                    {testimonial.achievement && (
                      <Badge variant="secondary" className="text-xs">
                        {testimonial.achievement}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {[...Array(testimonial.rating || 5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3 h-3 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 relative">
                <Quote className="w-4 h-4 text-muted-foreground absolute top-2 left-2" />
                <p className="text-sm italic pl-6">
                  "{testimonial.text}"
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Video Testimonials Placeholder */}
        {trainer.video_testimonials && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Video Testimonials</h4>
            <div className="grid grid-cols-2 gap-2">
              {trainer.video_testimonials.slice(0, 2).map((video: any, index: number) => (
                <div key={index} className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">Video {index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};