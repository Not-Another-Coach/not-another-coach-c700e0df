import React from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Bell, CheckCircle, FileText } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

interface TermsAndNotificationsSectionProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

export function TermsAndNotificationsSection({ formData, updateFormData }: TermsAndNotificationsSectionProps) {
  return (
    <div className="space-y-6">
      <SectionHeader 
        icons={[Bell, FileText]}
        title="T&Cs and Notifications"
        description="Configure your preferences and complete your profile setup"
      />

      {/* Notification Preferences */}
      <Card className="border-muted bg-muted/20">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <Label className="text-lg font-semibold">Notification Preferences</Label>
          </div>
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


      {/* Final Agreement */}
      <Card className="border-muted bg-muted/20">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <Label className="text-lg font-semibold">Final Agreement</Label>
          </div>
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

          {/* Ready to Go Live */}
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
        </CardContent>
      </Card>
    </div>
  );
}