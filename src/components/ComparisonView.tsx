import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Star, MapPin, Award, Clock, MessageCircle, Target, Heart } from 'lucide-react';
import { Trainer } from '@/components/TrainerCard';
import { MatchBadge } from '@/components/MatchBadge';

interface ComparisonViewProps {
  trainers: Trainer[];
  onClose: () => void;
}

export const ComparisonView = ({ trainers, onClose }: ComparisonViewProps) => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const metrics = [
    { key: 'rating', label: 'Rating', icon: Star },
    { key: 'experience', label: 'Experience', icon: Award },
    { key: 'location', label: 'Location', icon: MapPin },
    { key: 'availability', label: 'Availability', icon: Clock },
    { key: 'coachingStyle', label: 'Coaching Style', icon: Target },
    { key: 'personality', label: 'Personality Fit', icon: Heart },
  ];

  const highlightBest = (metric: string) => {
    if (metric === 'rating') {
      const maxRating = Math.max(...trainers.map(t => t.rating));
      return trainers.map(t => t.rating === maxRating);
    }
    if (metric === 'experience') {
      const maxExp = Math.max(...trainers.map(t => parseInt(t.experience)));
      return trainers.map(t => parseInt(t.experience) === maxExp);
    }
    return trainers.map(() => false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onClose}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Saved
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Compare Trainers</h1>
                <p className="text-muted-foreground">
                  Side-by-side comparison of {trainers.length} trainers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Trainer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {trainers.map((trainer) => (
            <Card key={trainer.id} className="overflow-hidden">
              <div className="relative h-48">
                <img 
                  src={trainer.image} 
                  alt={trainer.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-lg font-bold">{trainer.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{trainer.rating}</span>
                    <span className="opacity-75">({trainer.reviews})</span>
                  </div>
                  {/* Goal Match Badge */}
                  {(trainer as any).matchScore && (
                    <div className="mt-2">
                      <MatchBadge 
                        score={(trainer as any).matchScore} 
                        reasons={(trainer as any).matchReasons || []} 
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Experience</span>
                    <span className="font-medium">{trainer.experience}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Location</span>
                    <span className="font-medium">{trainer.location}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Availability</span>
                    <span className="font-medium">{trainer.availability}</span>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">Coaching Style</span>
                    <div className="mt-1">
                      <Badge variant="outline" className="text-xs">
                        {(trainer as any).coachingStyle || 'Motivational'}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">Personality</span>
                    <div className="mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {(trainer as any).personalityType || 'Supportive'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Specialties</p>
                  <div className="flex flex-wrap gap-1">
                    {trainer.specialties.slice(0, 3).map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {trainer.specialties.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{trainer.specialties.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Training Types</p>
                  <div className="flex flex-wrap gap-1">
                    {trainer.trainingType.map((type) => (
                      <span key={type} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
                        {type === "In-Person" ? "🧍" : type === "Online" ? "💻" : type === "Group" ? "👥" : type === "Hybrid" ? "🔄" : ""}
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
                
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Criteria</th>
                    {trainers.map((trainer) => (
                      <th key={trainer.id} className="text-center py-3 px-4 font-medium min-w-[150px]">
                        {trainer.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((metric) => {
                    const highlights = highlightBest(metric.key);
                    const Icon = metric.icon;
                    
                    return (
                      <tr key={metric.key} className="border-b hover:bg-muted/50">
                        <td className="py-4 px-4 flex items-center gap-2 font-medium">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          {metric.label}
                        </td>
                        {trainers.map((trainer, index) => {
                          const isHighlighted = highlights[index];
                          let value = '';
                          
                          switch (metric.key) {
                            case 'rating':
                              value = `${trainer.rating} ⭐ (${trainer.reviews} reviews)`;
                              break;
                            case 'experience':
                              value = trainer.experience;
                              break;
                            case 'location':
                              value = trainer.location;
                              break;
                            case 'availability':
                              value = trainer.availability;
                              break;
                            case 'coachingStyle':
                              value = (trainer as any).coachingStyle || 'Motivational';
                              break;
                            case 'personality':
                              value = (trainer as any).personalityType || 'Supportive';
                              break;
                          }
                          
                          return (
                            <td key={trainer.id} className={`py-4 px-4 text-center ${
                              isHighlighted ? 'bg-green-50 border border-green-200 font-semibold text-green-800' : ''
                            }`}>
                              {value}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-4 px-4 font-medium">Certifications</td>
                    {trainers.map((trainer) => (
                      <td key={trainer.id} className="py-4 px-4 text-center">
                        <div className="space-y-1">
                          {trainer.certifications.map((cert) => (
                            <Badge key={cert} variant="outline" className="text-xs block">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                  
                  <tr className="hover:bg-muted/50">
                    <td className="py-4 px-4 font-medium">Specialties</td>
                    {trainers.map((trainer) => (
                      <td key={trainer.id} className="py-4 px-4 text-center">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {trainer.specialties.map((specialty) => (
                            <Badge key={specialty} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Winner Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">🏆 Highest Rated</h4>
                <p className="text-green-700">
                  {trainers.find(t => t.rating === Math.max(...trainers.map(tr => tr.rating)))?.name}
                </p>
                <p className="text-sm text-green-600">
                  {Math.max(...trainers.map(t => t.rating))} stars
                </p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">🎯 Best Goal Match</h4>
                <p className="text-blue-700">
                  {trainers.find(t => (t as any).matchScore === Math.max(...trainers.map((tr: any) => tr.matchScore || 0)))?.name || trainers[0]?.name}
                </p>
                <p className="text-sm text-blue-600">
                  {Math.max(...trainers.map((t: any) => t.matchScore || 0))}% match
                </p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">⭐ Most Experienced</h4>
                <p className="text-purple-700">
                  {trainers.find(t => parseInt(t.experience) === Math.max(...trainers.map(tr => parseInt(tr.experience))))?.name}
                </p>
                <p className="text-sm text-purple-600">
                  {Math.max(...trainers.map(t => parseInt(t.experience)))} years
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};