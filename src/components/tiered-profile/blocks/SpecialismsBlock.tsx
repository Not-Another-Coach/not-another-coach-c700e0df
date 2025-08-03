import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Award, Zap } from 'lucide-react';

interface SpecialismsBlockProps {
  trainer: any;
}

export const SpecialismsBlock = ({ trainer }: SpecialismsBlockProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="w-5 h-5" />
          Specialisms & Expertise
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Specializations */}
        {trainer.specializations && trainer.specializations.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Primary Areas
            </h4>
            <div className="flex flex-wrap gap-2">
              {trainer.specializations.map((spec: string) => (
                <Badge key={spec} variant="default" className="bg-primary/10 text-primary hover:bg-primary/20">
                  {spec}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Training Types */}
        {trainer.training_types && trainer.training_types.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Training Formats
            </h4>
            <div className="flex flex-wrap gap-2">
              {trainer.training_types.map((type: string) => (
                <Badge key={type} variant="outline">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Qualifications Preview */}
        {trainer.qualifications && trainer.qualifications.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Qualifications</h4>
            <div className="flex flex-wrap gap-2">
              {trainer.qualifications.slice(0, 3).map((qual: string) => (
                <Badge key={qual} variant="secondary">
                  {qual}
                </Badge>
              ))}
              {trainer.qualifications.length > 3 && (
                <Badge variant="secondary">
                  +{trainer.qualifications.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};