import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedTrainerCard } from '@/components/trainer-cards/EnhancedTrainerCard';
import { AnyTrainer, TrainerCardViewMode } from '@/types/trainer';
import { Eye, Smartphone, Monitor } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface CardsViewProps {
  trainer: AnyTrainer;
}

export const CardsView = ({ trainer }: CardsViewProps) => {
  const [currentCardView, setCurrentCardView] = useState<TrainerCardViewMode>('features');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Client Card Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            This is how your profile appears as cards to clients browsing trainers. 
            Swipe through or use arrows to see different views.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Smartphone className="h-4 w-4" />
            <span>Swipe left/right on mobile</span>
            <span>•</span>
            <Monitor className="h-4 w-4" />
            <span>Click arrows on desktop</span>
          </div>
        </CardContent>
      </Card>

      {/* Card Preview Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Enhanced Trainer Card Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Enhanced Card View</h3>
            <Badge variant="secondary" className="text-xs">
              Current: {currentCardView.charAt(0).toUpperCase() + currentCardView.slice(1)}
            </Badge>
          </div>
          <EnhancedTrainerCard
            trainer={trainer}
            initialView={currentCardView}
            layout="grid"
            // Remove interactive elements for preview
            showComparisonCheckbox={false}
            allowViewSwitching={true}
            hideViewControls={false}
          />
          <p className="text-xs text-muted-foreground">
            Clients see this enhanced card with swipeable views and can click to view your full profile.
          </p>
        </div>

        {/* View Descriptions */}
        <div className="md:col-span-1 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Card View Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div 
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    currentCardView === 'instagram' ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setCurrentCardView('instagram')}
                >
                  <h4 className="font-medium mb-1">Instagram Gallery</h4>
                  <p className="text-sm text-muted-foreground">
                    Shows your selected Instagram posts and workout content in a visually appealing grid layout.
                  </p>
                </div>
                
                <div 
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    currentCardView === 'features' ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setCurrentCardView('features')}
                >
                  <h4 className="font-medium mb-1">Features Summary</h4>
                  <p className="text-sm text-muted-foreground">
                    Highlights your specialisations, training types, and availability in organised feature cards.
                  </p>
                </div>
                
                <div 
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    currentCardView === 'transformations' ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setCurrentCardView('transformations')}
                >
                  <h4 className="font-medium mb-1">Client Transformations</h4>
                  <p className="text-sm text-muted-foreground">
                    Showcases client before/after photos and testimonials to demonstrate your results.
                  </p>
                </div>
              </div>
              
              <div className="pt-3 border-t">
                <p className="text-sm text-muted-foreground">
                  <strong>Tip:</strong> Click on the view types above to preview how each card format looks. 
                  Clients can swipe through these views when browsing trainers.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tips for Optimization */}
      <Card>
        <CardHeader>
          <CardTitle>Optimize Your Card Appeal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Instagram Gallery</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Add high-quality workout videos</li>
                <li>• Show training environment</li>
                <li>• Include client interaction photos</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Features Summary</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Highlight your top 3 specialties</li>
                <li>• Clearly state training types offered</li>
                <li>• Keep availability info current</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Transformations</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Get client consent for photos</li>
                <li>• Include specific achievements</li>
                <li>• Add compelling testimonials</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};