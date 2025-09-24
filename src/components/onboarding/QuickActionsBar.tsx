import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Upload, Smartphone, MessageCircle, Plus } from 'lucide-react';

interface QuickActionsBarProps {
  onBookSession: () => void;
  onUploadPhoto: () => void;
  onSyncApp: () => void;
  onMessage: () => void;
  hasAppointmentActivity?: boolean;
  hasUploadActivity?: boolean;
  hasSyncActivity?: boolean;
}

export const QuickActionsBar = ({
  onBookSession,
  onUploadPhoto,
  onSyncApp,
  onMessage,
  hasAppointmentActivity = true,
  hasUploadActivity = true,
  hasSyncActivity = false
}: QuickActionsBarProps) => {
  const actions = [
    {
      id: 'book',
      label: 'Book Session',
      icon: Calendar,
      onClick: onBookSession,
      show: hasAppointmentActivity,
      variant: 'default' as const,
      className: 'bg-primary text-primary-foreground hover:bg-primary/90'
    },
    {
      id: 'upload',
      label: 'Upload Photo',
      icon: Upload,
      onClick: onUploadPhoto,
      show: hasUploadActivity,
      variant: 'outline' as const,
      className: 'border-secondary text-secondary hover:bg-secondary/10'
    },
    {
      id: 'sync',
      label: 'Sync App',
      icon: Smartphone,
      onClick: onSyncApp,
      show: hasSyncActivity,
      variant: 'outline' as const,
      className: 'border-accent text-accent hover:bg-accent/10'
    },
    {
      id: 'message',
      label: 'Message',
      icon: MessageCircle,
      onClick: onMessage,
      show: true,
      variant: 'outline' as const,
      className: 'border-muted-foreground text-muted-foreground hover:bg-muted'
    }
  ].filter(action => action.show);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-center gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-2xl">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                onClick={action.onClick}
                variant={action.variant}
                className={`flex flex-col items-center gap-2 h-16 ${action.className}`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </Card>
  );
};