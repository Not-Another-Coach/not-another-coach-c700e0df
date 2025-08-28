import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ExternalLink, Upload, Video, FileText, Link as LinkIcon } from 'lucide-react';
import { format } from 'date-fns';

interface ActivityCompletionInterfaceProps {
  activity: {
    id: string;
    activity_name: string;
    description?: string;
    activity_type: 'task' | 'appointment' | 'survey' | 'training_content' | 'file_upload';
    status: 'pending' | 'in_progress' | 'completed' | 'skipped';
    due_at?: string;
    completion_data?: any;
    appointment_config?: any;
    survey_config?: any;
    content_config?: any;
    upload_config?: any;
  };
  onComplete: (completionData: any) => void;
  onScheduleAppointment?: (appointmentData: any) => void;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'appointment': return Calendar;
    case 'survey': return LinkIcon;
    case 'training_content': return Video;
    case 'file_upload': return Upload;
    default: return FileText;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'in_progress': return 'bg-yellow-100 text-yellow-800';
    case 'skipped': return 'bg-gray-100 text-gray-800';
    default: return 'bg-blue-100 text-blue-800';
  }
};

export const ActivityCompletionInterface = ({ 
  activity, 
  onComplete, 
  onScheduleAppointment 
}: ActivityCompletionInterfaceProps) => {
  const [notes, setNotes] = useState(activity.completion_data?.notes || '');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');

  const Icon = getActivityIcon(activity.activity_type);

  const handleComplete = () => {
    const completionData: any = {
      notes,
      completed_at: new Date().toISOString(),
      completion_method: 'client_self_reported'
    };

    if (selectedFiles.length > 0) {
      // In a real app, you'd upload files first and get URLs
      completionData.file_urls = selectedFiles.map(f => f.name);
    }

    onComplete(completionData);
  };

  const handleScheduleAppointment = () => {
    if (!appointmentDate || !appointmentTime) return;
    
    const scheduledAt = new Date(`${appointmentDate}T${appointmentTime}`);
    onScheduleAppointment?.({
      scheduled_at: scheduledAt.toISOString(),
      duration_minutes: activity.appointment_config?.duration_minutes || 60,
      meeting_link: activity.appointment_config?.default_meeting_link
    });
  };

  const renderCompletionInterface = () => {
    if (activity.status === 'completed') {
      return (
        <div className="text-center py-4">
          <Badge className={getStatusColor('completed')}>
            Completed
          </Badge>
          {activity.completion_data?.completed_at && (
            <p className="text-sm text-muted-foreground mt-2">
              Completed on {format(new Date(activity.completion_data.completed_at), 'PPP')}
            </p>
          )}
        </div>
      );
    }

    switch (activity.activity_type) {
      case 'appointment':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Time</label>
                <Input
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                />
              </div>
            </div>
            
            {activity.appointment_config?.duration_minutes && (
              <p className="text-sm text-muted-foreground">
                Duration: {activity.appointment_config.duration_minutes} minutes
              </p>
            )}

            <Button 
              onClick={handleScheduleAppointment}
              disabled={!appointmentDate || !appointmentTime}
              className="w-full"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Appointment
            </Button>
          </div>
        );

      case 'survey':
        return (
          <div className="space-y-4">
            {activity.survey_config?.survey_url && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open(activity.survey_config.survey_url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Survey
              </Button>
            )}
            
            <Textarea
              placeholder="Add notes about survey completion..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            
            <Button onClick={handleComplete} className="w-full">
              Mark Survey Complete
            </Button>
          </div>
        );

      case 'training_content':
        return (
          <div className="space-y-4">
            {activity.content_config?.content_url && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open(activity.content_config.content_url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View {activity.content_config.content_type || 'Content'}
              </Button>
            )}
            
            {activity.content_config?.estimated_duration_minutes && (
              <p className="text-sm text-muted-foreground text-center">
                <Clock className="h-4 w-4 inline mr-1" />
                Estimated time: {activity.content_config.estimated_duration_minutes} minutes
              </p>
            )}
            
            <Textarea
              placeholder="What did you learn? Any questions?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            
            <Button onClick={handleComplete} className="w-full">
              Mark as Viewed
            </Button>
          </div>
        );

      case 'file_upload':
        return (
          <div className="space-y-4">
            {activity.upload_config?.uploader === 'client' ? (
              <>
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Upload Files
                  </label>
                  <input
                    type="file"
                    multiple
                    accept={activity.upload_config?.file_types?.map(type => `.${type}`).join(',')}
                    onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                    className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                  />
                  {activity.upload_config?.upload_instructions && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.upload_config.upload_instructions}
                    </p>
                  )}
                </div>

                {selectedFiles.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Selected Files:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {selectedFiles.map((file, index) => (
                        <li key={index} className="flex justify-between">
                          <span>{file.name}</span>
                          <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Textarea
                  placeholder="Add notes about the uploaded files..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />

                <Button 
                  onClick={handleComplete}
                  disabled={selectedFiles.length === 0}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload & Complete
                </Button>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">
                  Waiting for trainer to upload files for this activity.
                </p>
              </div>
            )}
          </div>
        );

      default: // task
        return (
          <div className="space-y-4">
            <Textarea
              placeholder="Add notes about task completion..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            
            <Button onClick={handleComplete} className="w-full">
              Mark Complete
            </Button>
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Icon className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <CardTitle className="text-base">{activity.activity_name}</CardTitle>
              {activity.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {activity.description}
                </p>
              )}
            </div>
          </div>
          <Badge className={getStatusColor(activity.status)}>
            {activity.status.replace('_', ' ')}
          </Badge>
        </div>
        
        {activity.due_at && activity.status !== 'completed' && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Due: {format(new Date(activity.due_at), 'PPP')}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {renderCompletionInterface()}
      </CardContent>
    </Card>
  );
};