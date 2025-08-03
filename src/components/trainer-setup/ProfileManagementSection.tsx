import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Bell, Eye, CheckCircle, AlertTriangle, Users, Clock, Pause } from "lucide-react";

interface ProfileManagementSectionProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

export function ProfileManagementSection({ formData, updateFormData }: ProfileManagementSectionProps) {
  const handleStatusChange = (status: 'open' | 'waitlist' | 'paused') => {
    updateFormData({ client_status: status });
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'open':
        return {
          label: 'Accepting Clients',
          description: 'Your profile is visible and you\'re actively taking new clients',
          color: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200',
          icon: CheckCircle
        };
      case 'waitlist':
        return {
          label: 'Waitlist Only', 
          description: 'Your profile is visible but clients can only join a waitlist',
          color: 'text-amber-600',
          bgColor: 'bg-amber-50 border-amber-200',
          icon: Clock
        };
      case 'paused':
        return {
          label: 'Not Available',
          description: 'Your profile is hidden from client searches',
          color: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200',
          icon: Pause
        };
      default:
        return {
          label: 'Unknown',
          description: '',
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          icon: AlertTriangle
        };
    }
  };

  const currentStatus = getStatusInfo(formData.client_status || 'open');

  return (
    <div className="space-y-6">
      {/* Current Status Display */}
      <Card className={`${currentStatus.bgColor}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <currentStatus.icon className={`h-5 w-5 ${currentStatus.color}`} />
            <div>
              <p className={`font-medium ${currentStatus.color}`}>
                Current Status: {currentStatus.label}
              </p>
              <p className="text-sm text-muted-foreground">
                {currentStatus.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Selection */}
      <div className="space-y-4">
        <Label>Profile Availability Status</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className={`cursor-pointer transition-colors ${
              formData.client_status === 'open' ? 'border-green-500 bg-green-50' : 'hover:border-green-200'
            }`}
            onClick={() => handleStatusChange('open')}
          >
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="font-medium">Accepting Clients</p>
              <p className="text-xs text-muted-foreground mt-1">
                Visible to all potential clients
              </p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-colors ${
              formData.client_status === 'waitlist' ? 'border-amber-500 bg-amber-50' : 'hover:border-amber-200'
            }`}
            onClick={() => handleStatusChange('waitlist')}
          >
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-amber-600" />
              <p className="font-medium">Waitlist Only</p>
              <p className="text-xs text-muted-foreground mt-1">
                Clients can join your waitlist
              </p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-colors ${
              formData.client_status === 'paused' ? 'border-red-500 bg-red-50' : 'hover:border-red-200'
            }`}
            onClick={() => handleStatusChange('paused')}
          >
            <CardContent className="p-4 text-center">
              <Pause className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <p className="font-medium">Not Available</p>
              <p className="text-xs text-muted-foreground mt-1">
                Hidden from searches
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="space-y-4">
        <Label>Notification Preferences</Label>
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Profile Views</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when potential clients view your profile
                </p>
              </div>
              <Switch
                checked={formData.notify_profile_views || false}
                onCheckedChange={(checked) => updateFormData({ notify_profile_views: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New Messages</p>
                <p className="text-sm text-muted-foreground">
                  Instant notifications for new client inquiries
                </p>
              </div>
              <Switch
                checked={formData.notify_messages || true}
                onCheckedChange={(checked) => updateFormData({ notify_messages: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Match Insights</p>
                <p className="text-sm text-muted-foreground">
                  Weekly summary of profile performance and matches
                </p>
              </div>
              <Switch
                checked={formData.notify_insights || true}
                onCheckedChange={(checked) => updateFormData({ notify_insights: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Preview */}
      <div className="space-y-2">
        <Label>Profile Preview</Label>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Eye className="h-5 w-5 text-blue-600" />
              <p className="font-medium text-blue-900">Preview Your Profile</p>
            </div>
            <p className="text-sm text-blue-700 mb-3">
              See how your profile appears to potential clients before going live.
            </p>
            <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
              <Eye className="h-4 w-4 mr-2" />
              Preview Profile
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Terms Agreement */}
      <div className="space-y-4">
        <Label>Final Agreement</Label>
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={formData.terms_agreed || false}
                onCheckedChange={(checked) => updateFormData({ terms_agreed: checked })}
              />
              <div className="space-y-1 leading-none">
                <Label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the Terms of Service and Community Guidelines *
                </Label>
                <p className="text-xs text-muted-foreground">
                  By completing your profile, you agree to provide accurate information and maintain professional standards.
                  <Button variant="link" className="h-auto p-0 text-xs ml-1">
                    Read full terms
                  </Button>
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="accuracy"
                checked={formData.accuracy_confirmed || false}
                onCheckedChange={(checked) => updateFormData({ accuracy_confirmed: checked })}
              />
              <div className="space-y-1 leading-none">
                <Label
                  htmlFor="accuracy"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Information Accuracy Confirmation *
                </Label>
                <p className="text-xs text-muted-foreground">
                  I confirm that all information provided is accurate and up-to-date.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completion Summary */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-green-900 mb-2">
                🎉 Ready to Go Live!
              </p>
              <div className="space-y-1 text-sm text-green-700">
                <p>✅ Profile information complete</p>
                <p>✅ Qualifications verified (pending admin review)</p>
                <p>✅ Rates and availability set</p>
                <p>✅ Terms agreed</p>
              </div>
              <p className="text-xs text-green-600 mt-2">
                Once you complete this step, your profile will be live and visible to potential clients!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}