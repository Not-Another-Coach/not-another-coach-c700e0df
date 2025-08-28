import { Calendar, FileText, Link, Upload, Video } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export type ActivityType = 'task' | 'appointment' | 'survey' | 'training_content' | 'file_upload';

interface ActivityTypeSelectorProps {
  selectedType: ActivityType;
  onTypeSelect: (type: ActivityType) => void;
}

const activityTypes = [
  {
    type: 'task' as ActivityType,
    icon: FileText,
    title: 'Regular Task',
    description: 'Standard completion task with optional file uploads',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    type: 'appointment' as ActivityType,
    icon: Calendar,
    title: 'Calendar Appointment',
    description: 'Scheduled meeting with calendar integration',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  {
    type: 'survey' as ActivityType,
    icon: Link,
    title: 'Survey/Form',
    description: 'External survey or form completion',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  {
    type: 'training_content' as ActivityType,
    icon: Video,
    title: 'Training Content',
    description: 'Video, document, or image for learning',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  {
    type: 'file_upload' as ActivityType,
    icon: Upload,
    title: 'File Upload',
    description: 'Client or trainer uploads specific files',
    color: 'bg-pink-100 text-pink-800 border-pink-200'
  }
];

export const ActivityTypeSelector = ({ selectedType, onTypeSelect }: ActivityTypeSelectorProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Activity Type</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose the type of activity to configure its specific options
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activityTypes.map(({ type, icon: Icon, title, description, color }) => (
          <Card 
            key={type}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedType === type 
                ? 'ring-2 ring-primary shadow-md' 
                : 'hover:shadow-sm'
            }`}
            onClick={() => onTypeSelect(type)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Icon className="h-6 w-6 text-primary" />
                {selectedType === type && (
                  <Badge variant="secondary">Selected</Badge>
                )}
              </div>
              <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                {description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};