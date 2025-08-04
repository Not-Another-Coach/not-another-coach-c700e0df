import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BlurableImage } from '@/components/ui/blurable-image';
import { Lock, Package, Calendar, DollarSign, Image } from 'lucide-react';
import { EngagementStage } from '@/hooks/useEngagementStage';
import { useContentVisibility } from '@/hooks/useContentVisibility';

interface GalleryPackagesBlockProps {
  trainer: any;
  canViewPricing: boolean;
  stage: EngagementStage;
}

export const GalleryPackagesBlock = ({ trainer, canViewPricing, stage }: GalleryPackagesBlockProps) => {
  const { getVisibility } = useContentVisibility({
    trainerId: trainer.id,
    engagementStage: stage
  });

  const beforeAfterVisibility = getVisibility('before_after_images');
  const packageImagesVisibility = getVisibility('package_images');

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
        {/* Before/After Gallery with visibility controls */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Image className="w-4 h-4" />
            Client Transformations
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {trainer.before_after_photos && trainer.before_after_photos.length > 0 ? (
              trainer.before_after_photos.slice(0, 6).map((photo: any, index: number) => (
                <BlurableImage
                  key={index}
                  src={photo.url || photo}
                  alt={`Transformation ${index + 1}`}
                  visibility={beforeAfterVisibility}
                  className="aspect-square rounded-lg object-cover"
                  lockMessage="Transformation photos shared after discovery call"
                />
              ))
            ) : (
              // Placeholder transformation photos
              Array.from({ length: 3 }).map((_, index) => (
                <BlurableImage
                  key={`placeholder-${index}`}
                  src="/placeholder.svg"
                  alt={`Sample transformation ${index + 1}`}
                  visibility={beforeAfterVisibility}
                  className="aspect-square rounded-lg object-cover"
                  lockMessage="Transformation photos shared after discovery call"
                />
              ))
            )}
          </div>
        </div>

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