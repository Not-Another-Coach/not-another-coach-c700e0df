import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Dumbbell } from 'lucide-react';

interface MiniBioBlockProps {
  trainer: any;
}

export const MiniBioBlock = ({ trainer }: MiniBioBlockProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">About Me</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {trainer.bio && (
          <p className="text-muted-foreground leading-relaxed">
            {trainer.bio.length > 200 ? `${trainer.bio.substring(0, 200)}...` : trainer.bio}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {trainer.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{trainer.location}</span>
            </div>
          )}

          {trainer.ideal_client_types && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Works with {trainer.ideal_client_types[0]}</span>
            </div>
          )}

          {trainer.training_types && (
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{trainer.training_types.length} training styles</span>
            </div>
          )}
        </div>

        {/* Basic Package Types Preview */}
        {trainer.package_options && trainer.package_options.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Training Options</h4>
            <div className="flex flex-wrap gap-2">
              {trainer.package_options.slice(0, 3).map((pkg: any, index: number) => (
                <Badge key={index} variant="outline">
                  {pkg.name || `Package ${index + 1}`}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Availability Preview */}
        <div className="text-sm text-muted-foreground">
          <span>✓ Typically responds within 24 hours</span>
        </div>
      </CardContent>
    </Card>
  );
};