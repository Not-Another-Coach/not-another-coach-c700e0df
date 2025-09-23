import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Award, Users, Clock, CheckCircle, X } from 'lucide-react';
import { AnyTrainer } from '@/types/trainer';
import { getTrainerDisplayPrice, getVisibilityAwarePrice } from '@/lib/priceUtils';
import { useContentVisibility } from '@/hooks/useContentVisibility';
import { VisibilityAwarePricing } from '@/components/ui/VisibilityAwarePricing';

interface CompareViewProps {
  trainers: AnyTrainer[];
  onRemoveTrainer?: (trainerId: string) => void;
  onSelectTrainer?: (trainerId: string) => void;
}

const comparisonCategories = [
  { key: 'rating', label: 'Rating', type: 'rating' },
  { key: 'experience', label: 'Experience', type: 'text' },
  { key: 'location', label: 'Location', type: 'text' },
  { key: 'hourlyRate', label: 'Package Price', type: 'price' },
  { key: 'specialties', label: 'Specialisations', type: 'array' },
  { key: 'trainingType', label: 'Training Types', type: 'array' },
  { key: 'certifications', label: 'Certifications', type: 'count' },
  { key: 'reviews', label: 'Total Reviews', type: 'number' },
  { key: 'offers_discovery_call', label: 'Discovery Call', type: 'boolean' }
];

export const CompareView = ({ trainers, onRemoveTrainer, onSelectTrainer }: CompareViewProps) => {
  // Use the first trainer's ID for visibility check (assuming same engagement for all in compare)
  const { getVisibility } = useContentVisibility({
    engagementStage: 'browsing'
  });
  if (trainers.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Trainers Selected</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Select trainers from your browsing, saved, or shortlisted collections to compare them side-by-side.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getBestValue = (category: string, trainers: AnyTrainer[]) => {
    if (category === 'rating') {
      return Math.max(...trainers.map(t => t.rating));
    }
    if (category === 'reviews') {
      return Math.max(...trainers.map(t => t.reviews));
    }
    if (category === 'hourlyRate') {
      return Math.min(...trainers.map(t => t.hourlyRate));
    }
    if (category === 'certifications') {
      return Math.max(...trainers.map(t => t.certifications.length));
    }
    return null;
  };

  const renderCellValue = (trainer: AnyTrainer, category: any) => {
    const value = trainer[category.key as keyof AnyTrainer];
    const bestValue = getBestValue(category.key, trainers);
    const isBest = bestValue !== null && (
      (category.key === 'rating' && trainer.rating === bestValue) ||
      (category.key === 'reviews' && trainer.reviews === bestValue) ||
      (category.key === 'hourlyRate' && trainer.hourlyRate === bestValue) ||
      (category.key === 'certifications' && trainer.certifications.length === bestValue)
    );

    switch (category.type) {
      case 'rating':
        return (
          <div className={`flex items-center gap-1 ${isBest ? 'text-success font-semibold' : ''}`}>
            <Star className="h-4 w-4 fill-current" />
            <span>{trainer.rating}</span>
            <span className="text-muted-foreground text-sm">({trainer.reviews})</span>
            {isBest && <CheckCircle className="h-4 w-4 text-success ml-1" />}
          </div>
        );
        
      case 'price':
        return (
          <div className={`font-semibold ${isBest ? 'text-success' : ''}`}>
            <VisibilityAwarePricing
              pricing={getTrainerDisplayPrice(trainer)}
              visibilityState={getVisibility('pricing_discovery_call')}
            />
            {isBest && <CheckCircle className="h-4 w-4 text-success inline ml-1" />}
          </div>
        );
        
      case 'array':
        return (
          <div className="space-y-1">
            {(value as string[])?.slice(0, 3).map((item, index) => (
              <Badge key={index} variant="outline" className="text-xs mr-1">
                {item}
              </Badge>
            ))}
            {(value as string[])?.length > 3 && (
              <div className="text-xs text-muted-foreground">
                +{(value as string[]).length - 3} more
              </div>
            )}
          </div>
        );
        
      case 'count':
        return (
          <div className={`font-medium ${isBest ? 'text-success' : ''}`}>
            {(value as string[])?.length || 0}
            {isBest && <CheckCircle className="h-4 w-4 text-success inline ml-1" />}
          </div>
        );
        
      case 'number':
        return (
          <div className={`font-medium ${isBest ? 'text-success' : ''}`}>
            {value as number}
            {isBest && <CheckCircle className="h-4 w-4 text-success inline ml-1" />}
          </div>
        );
        
      case 'boolean':
        return (
          <div className="flex items-center gap-1">
            {value ? (
              <CheckCircle className="h-4 w-4 text-success" />
            ) : (
              <X className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm">{value ? 'Yes' : 'No'}</span>
          </div>
        );
        
      default:
        return <span className="text-sm">{value as string}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Cards */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${trainers.length}, 1fr)` }}>
        {trainers.map((trainer) => (
          <Card key={trainer.id}>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <img
                    src={trainer.image}
                    alt={trainer.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{trainer.name}</h3>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-3 w-3 fill-current" />
                      <span>{trainer.rating}</span>
                    </div>
                  </div>
                </div>
                
                {onRemoveTrainer && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveTrainer(trainer.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="text-center">
                  <VisibilityAwarePricing
                    pricing={getTrainerDisplayPrice(trainer)}
                    visibilityState={getVisibility('pricing_discovery_call')}
                    className="text-2xl font-bold text-primary"
                  />
                  <div className="text-xs text-muted-foreground">package pricing</div>
                </div>
                
                {onSelectTrainer && (
                  <Button 
                    onClick={() => onSelectTrainer(trainer.id)}
                    className="w-full"
                  >
                    Choose Coach
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-3 border-b font-semibold w-1/4">Criteria</th>
                  {trainers.map((trainer) => (
                    <th key={trainer.id} className="text-center p-3 border-b font-semibold">
                      {trainer.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonCategories.map((category, index) => (
                  <tr key={category.key} className={index % 2 === 0 ? 'bg-muted/30' : ''}>
                    <td className="p-3 font-medium">{category.label}</td>
                    {trainers.map((trainer) => (
                      <td key={trainer.id} className="p-3 text-center">
                        {renderCellValue(trainer, category)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
              <h4 className="font-semibold mb-2">Highest Rated</h4>
              <p className="text-lg font-bold text-primary">
                {trainers.reduce((prev, current) => 
                  prev.rating > current.rating ? prev : current
                ).name}
              </p>
              <p className="text-sm text-muted-foreground">
                {Math.max(...trainers.map(t => t.rating))} stars
              </p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-success/10 to-success/5 rounded-lg">
              <h4 className="font-semibold mb-2">Best Value</h4>
              <p className="text-lg font-bold text-success">
                {trainers.reduce((prev, current) => 
                  prev.hourlyRate < current.hourlyRate ? prev : current
                ).name}
              </p>
              <p className="text-sm text-muted-foreground">
                <VisibilityAwarePricing
                  pricing={getTrainerDisplayPrice(trainers.reduce((prev, current) => 
                    prev.hourlyRate < current.hourlyRate ? prev : current
                  ))}
                  visibilityState={getVisibility('pricing_discovery_call')}
                />
              </p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg">
              <h4 className="font-semibold mb-2">Most Experienced</h4>
              <p className="text-lg font-bold text-accent">
                {trainers.reduce((prev, current) => 
                  prev.reviews > current.reviews ? prev : current
                ).name}
              </p>
              <p className="text-sm text-muted-foreground">
                {Math.max(...trainers.map(t => t.reviews))} reviews
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};