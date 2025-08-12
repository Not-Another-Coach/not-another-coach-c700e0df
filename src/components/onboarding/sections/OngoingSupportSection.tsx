import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Calendar, 
  Clock, 
  MessageCircle, 
  Phone,
  Settings
} from 'lucide-react';
import { OngoingSupportSettings, useOnboardingSections } from '@/hooks/useOnboardingSections';
import { toast } from 'sonner';

interface OngoingSupportSectionProps {
  templateId: string;
  settings: OngoingSupportSettings[];
  onSettingsChange: () => void;
}

export function OngoingSupportSection({ templateId, settings, onSettingsChange }: OngoingSupportSectionProps) {
  const {
    createOngoingSupportSettings,
    updateOngoingSupportSettings
  } = useOnboardingSections();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingSettings, setEditingSettings] = useState<OngoingSupportSettings | null>(null);
  const [newSettings, setNewSettings] = useState<Partial<OngoingSupportSettings>>({
    check_in_frequency: 'weekly',
    check_in_day: 'monday',
    check_in_time: '09:00',
    check_in_duration: 30,
    progress_tracking_frequency: 'weekly',
    communication_channels: ['email', 'app'],
    preferred_communication_channel: 'app',
    trainer_response_time_hours: 24,
    client_response_expectations: '',
    emergency_contact_method: '',
    session_rescheduling_policy: '',
    cancellation_policy: ''
  });

  const currentSettings = settings[0]; // Assuming one settings per template

  const handleCreateSettings = async () => {
    try {
      await createOngoingSupportSettings(templateId, newSettings as Omit<OngoingSupportSettings, 'id' | 'template_id'>);
      
      setNewSettings({
        check_in_frequency: 'weekly',
        check_in_day: 'monday',
        check_in_time: '09:00',
        check_in_duration: 30,
        progress_tracking_frequency: 'weekly',
        communication_channels: ['email', 'app'],
        preferred_communication_channel: 'app',
        trainer_response_time_hours: 24,
        client_response_expectations: '',
        emergency_contact_method: '',
        session_rescheduling_policy: '',
        cancellation_policy: ''
      });
      setShowCreateDialog(false);
      onSettingsChange();
      toast.success('Ongoing support settings created successfully');
    } catch (error) {
      toast.error('Failed to create settings');
    }
  };

  const handleEditSettings = async () => {
    if (!editingSettings) return;

    try {
      await updateOngoingSupportSettings(editingSettings.id, editingSettings);
      setShowEditDialog(false);
      setEditingSettings(null);
      onSettingsChange();
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const communicationChannelOptions = [
    { value: 'email', label: 'Email' },
    { value: 'app', label: 'In-App Messaging' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'phone', label: 'Phone Call' },
    { value: 'video', label: 'Video Call' }
  ];

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const dayOptions = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Ongoing Support & Communication
          </CardTitle>
          {!currentSettings && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Set Up Support
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Configure Ongoing Support</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Check-in Schedule */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Check-in Schedule</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Frequency</Label>
                        <Select
                          value={newSettings.check_in_frequency}
                          onValueChange={(value) => setNewSettings({ ...newSettings, check_in_frequency: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {frequencyOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Preferred Day</Label>
                        <Select
                          value={newSettings.check_in_day}
                          onValueChange={(value) => setNewSettings({ ...newSettings, check_in_day: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {dayOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Preferred Time</Label>
                        <Input
                          type="time"
                          value={newSettings.check_in_time}
                          onChange={(e) => setNewSettings({ ...newSettings, check_in_time: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Duration (minutes)</Label>
                        <Input
                          type="number"
                          value={newSettings.check_in_duration}
                          onChange={(e) => setNewSettings({ ...newSettings, check_in_duration: parseInt(e.target.value) || 30 })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Communication Preferences */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Communication</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Preferred Channel</Label>
                        <Select
                          value={newSettings.preferred_communication_channel}
                          onValueChange={(value) => setNewSettings({ ...newSettings, preferred_communication_channel: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {communicationChannelOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Response Time (hours)</Label>
                        <Input
                          type="number"
                          value={newSettings.trainer_response_time_hours}
                          onChange={(e) => setNewSettings({ ...newSettings, trainer_response_time_hours: parseInt(e.target.value) || 24 })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Policies */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Policies & Expectations</h3>
                    <div>
                      <Label>Client Response Expectations</Label>
                      <Textarea
                        value={newSettings.client_response_expectations}
                        onChange={(e) => setNewSettings({ ...newSettings, client_response_expectations: e.target.value })}
                        placeholder="What you expect from clients in terms of communication..."
                      />
                    </div>
                    <div>
                      <Label>Session Rescheduling Policy</Label>
                      <Textarea
                        value={newSettings.session_rescheduling_policy}
                        onChange={(e) => setNewSettings({ ...newSettings, session_rescheduling_policy: e.target.value })}
                        placeholder="Your policy for rescheduling sessions..."
                      />
                    </div>
                    <div>
                      <Label>Cancellation Policy</Label>
                      <Textarea
                        value={newSettings.cancellation_policy}
                        onChange={(e) => setNewSettings({ ...newSettings, cancellation_policy: e.target.value })}
                        placeholder="Your cancellation policy..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateSettings}>
                      Create Settings
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!currentSettings ? (
          <div className="text-center py-8">
            <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No ongoing support settings configured.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Set up your communication preferences and operational agreements.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Check-in Schedule Display */}
            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Check-in Schedule
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Frequency</p>
                  <p className="text-sm text-muted-foreground capitalize">{currentSettings.check_in_frequency}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Day</p>
                  <p className="text-sm text-muted-foreground capitalize">{currentSettings.check_in_day}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Time</p>
                  <p className="text-sm text-muted-foreground">{currentSettings.check_in_time}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-sm text-muted-foreground">{currentSettings.check_in_duration} mins</p>
                </div>
              </div>
            </div>

            {/* Communication Preferences */}
            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Communication
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Preferred Channel</p>
                  <p className="text-sm text-muted-foreground capitalize">{currentSettings.preferred_communication_channel}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Response Time</p>
                  <p className="text-sm text-muted-foreground">{currentSettings.trainer_response_time_hours} hours</p>
                </div>
              </div>
            </div>

            {/* Policies */}
            {(currentSettings.session_rescheduling_policy || currentSettings.cancellation_policy) && (
              <div>
                <h3 className="text-lg font-medium mb-3">Policies</h3>
                <div className="space-y-3">
                  {currentSettings.session_rescheduling_policy && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Rescheduling Policy</p>
                      <p className="text-sm text-muted-foreground mt-1">{currentSettings.session_rescheduling_policy}</p>
                    </div>
                  )}
                  {currentSettings.cancellation_policy && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Cancellation Policy</p>
                      <p className="text-sm text-muted-foreground mt-1">{currentSettings.cancellation_policy}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingSettings(currentSettings);
                  setShowEditDialog(true);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Settings
              </Button>
            </div>
          </div>
        )}

        {/* Edit Settings Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Ongoing Support Settings</DialogTitle>
            </DialogHeader>
            {editingSettings && (
              <div className="space-y-6">
                {/* Check-in Schedule */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Check-in Schedule</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Frequency</Label>
                      <Select
                        value={editingSettings.check_in_frequency}
                        onValueChange={(value) => setEditingSettings({ ...editingSettings, check_in_frequency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {frequencyOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Preferred Day</Label>
                      <Select
                        value={editingSettings.check_in_day}
                        onValueChange={(value) => setEditingSettings({ ...editingSettings, check_in_day: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {dayOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Preferred Time</Label>
                      <Input
                        type="time"
                        value={editingSettings.check_in_time || ''}
                        onChange={(e) => setEditingSettings({ ...editingSettings, check_in_time: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Duration (minutes)</Label>
                      <Input
                        type="number"
                        value={editingSettings.check_in_duration || 30}
                        onChange={(e) => setEditingSettings({ ...editingSettings, check_in_duration: parseInt(e.target.value) || 30 })}
                      />
                    </div>
                  </div>
                </div>

                {/* Communication Preferences */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Communication</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Preferred Channel</Label>
                      <Select
                        value={editingSettings.preferred_communication_channel}
                        onValueChange={(value) => setEditingSettings({ ...editingSettings, preferred_communication_channel: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {communicationChannelOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Response Time (hours)</Label>
                      <Input
                        type="number"
                        value={editingSettings.trainer_response_time_hours || 24}
                        onChange={(e) => setEditingSettings({ ...editingSettings, trainer_response_time_hours: parseInt(e.target.value) || 24 })}
                      />
                    </div>
                  </div>
                </div>

                {/* Policies */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Policies & Expectations</h3>
                  <div>
                    <Label>Client Response Expectations</Label>
                    <Textarea
                      value={editingSettings.client_response_expectations || ''}
                      onChange={(e) => setEditingSettings({ ...editingSettings, client_response_expectations: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Session Rescheduling Policy</Label>
                    <Textarea
                      value={editingSettings.session_rescheduling_policy || ''}
                      onChange={(e) => setEditingSettings({ ...editingSettings, session_rescheduling_policy: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Cancellation Policy</Label>
                    <Textarea
                      value={editingSettings.cancellation_policy || ''}
                      onChange={(e) => setEditingSettings({ ...editingSettings, cancellation_policy: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditSettings}>
                    Update Settings
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}