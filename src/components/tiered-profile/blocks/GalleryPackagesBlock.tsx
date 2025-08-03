import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Package, Calendar, DollarSign } from 'lucide-react';
import { EngagementStage } from '@/hooks/useEngagementStage';

interface GalleryPackagesBlockProps {
  trainer: any;
  canViewPricing: boolean;
  stage: EngagementStage;
}

export const GalleryPackagesBlock = ({ trainer, canViewPricing, stage }: GalleryPackagesBlockProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="w-5 h-5" />
          Training Packages
          {!canViewPricing && <Lock className="w-4 h-4 text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Before/After Gallery - Hidden until discovery completed */}
        {!canViewPricing && (
          <div className="bg-muted/50 rounded-lg p-6 text-center space-y-2">
            <Lock className="w-8 h-8 mx-auto text-muted-foreground" />
            <h4 className="font-medium">Before/After Gallery Locked</h4>
            <p className="text-sm text-muted-foreground">
              Complete a discovery call to see client transformation photos
            </p>
          </div>
        )}

        {/* Package Options */}
        {trainer.package_options && trainer.package_options.length > 0 ? (
          <div className="space-y-3">
            {trainer.package_options.map((pkg: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{pkg.name || `Package ${index + 1}`}</h4>
                  {canViewPricing ? (
                    <Badge variant="secondary" className="text-green-600">
                      ${pkg.price || trainer.hourly_rate || '75'}/session
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      <Lock className="w-3 h-3 mr-1" />
                      Price locked
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {pkg.description || 'Comprehensive training package tailored to your goals'}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {pkg.duration || '8'} weeks
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {pkg.sessions || '2'}x/week
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Default packages if none specified */}
            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">1:1 Personal Training</h4>
                {canViewPricing ? (
                  <Badge variant="secondary" className="text-green-600">
                    ${trainer.hourly_rate || '75'}/session
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    <Lock className="w-3 h-3 mr-1" />
                    Price locked
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Personalized training sessions focused on your specific goals
              </p>
            </div>

            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">8-Week Transformation</h4>
                {canViewPricing ? (
                  <Badge variant="secondary" className="text-green-600">
                    $480/month
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    <Lock className="w-3 h-3 mr-1" />
                    Price locked
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Comprehensive 8-week program with nutrition and lifestyle coaching
              </p>
            </div>
          </div>
        )}

        {!canViewPricing && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
            <p className="text-sm text-primary">
              💡 Pricing shared once you've had a discovery call to ensure the right fit
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};