import React, { useState } from 'react';
import { useAppLogo } from '@/hooks/useAppLogo';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppLogo } from '@/components/ui/app-logo';
import { Upload, Trash2, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function LogoManagement() {
  const { logoSettings, updateLogoSettings, refetch } = useAppLogo();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localSettings, setLocalSettings] = useState(logoSettings);

  // Update local settings when logoSettings changes
  React.useEffect(() => {
    setLocalSettings(logoSettings);
  }, [logoSettings]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPEG, PNG, WebP, or SVG image.',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB.',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);

    try {
      // Delete existing logo if it exists
      if (logoSettings.logo_url) {
        const oldPath = logoSettings.logo_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('logos')
            .remove([oldPath]);
        }
      }

      // Upload new logo
      const fileExt = file.name.split('.').pop();
      const fileName = `app-logo-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('logos')
        .getPublicUrl(data.path);

      const newSettings = {
        ...localSettings,
        logo_url: publicUrlData.publicUrl
      };

      const success = await updateLogoSettings(newSettings);
      
      if (success) {
        toast({
          title: 'Logo uploaded successfully',
          description: 'Your new logo is now being used throughout the app.'
        });
        refetch();
      } else {
        throw new Error('Failed to update logo settings');
      }

    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your logo. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      // Clear the input
      event.target.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    if (!logoSettings.logo_url) return;

    setUploading(true);
    try {
      // Delete from storage
      const fileName = logoSettings.logo_url.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('logos')
          .remove([fileName]);
      }

      // Update settings
      const newSettings = {
        ...localSettings,
        logo_url: null
      };

      const success = await updateLogoSettings(newSettings);
      
      if (success) {
        toast({
          title: 'Logo removed',
          description: 'The logo has been removed and the fallback text will be used.'
        });
        refetch();
      } else {
        throw new Error('Failed to remove logo');
      }

    } catch (error) {
      console.error('Error removing logo:', error);
      toast({
        title: 'Error',
        description: 'There was an error removing the logo. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const success = await updateLogoSettings(localSettings);
      
      if (success) {
        toast({
          title: 'Settings saved',
          description: 'App logo settings have been updated.'
        });
      } else {
        throw new Error('Failed to save settings');
      }

    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'There was an error saving the settings. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>App Logo Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Current Logo Preview */}
          <div className="space-y-4">
            <Label>Current Logo</Label>
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/20">
              <AppLogo size="lg" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  This is how the logo appears throughout the application
                </p>
              </div>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="space-y-4">
            <Label>Upload New Logo</Label>
            <div className="flex items-center gap-4">
              <Label htmlFor="logo-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg hover:bg-muted/50 transition-colors">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm">
                    {uploading ? 'Uploading...' : 'Choose Image'}
                  </span>
                </div>
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </Label>
              
              {logoSettings.logo_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveLogo}
                  disabled={uploading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Logo
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Supported formats: JPEG, PNG, WebP, SVG. Max size: 5MB. 
              Recommended: Square images work best (e.g., 512x512px).
            </p>
          </div>

          {/* Text Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="app-name">App Name</Label>
              <Input
                id="app-name"
                value={localSettings.app_name}
                onChange={(e) => setLocalSettings(prev => ({
                  ...prev,
                  app_name: e.target.value
                }))}
                placeholder="Your Journey"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fallback-text">Fallback Text</Label>
              <Input
                id="fallback-text"
                value={localSettings.fallback_text}
                onChange={(e) => setLocalSettings(prev => ({
                  ...prev,
                  fallback_text: e.target.value
                }))}
                placeholder="FQ"
                maxLength={3}
              />
              <p className="text-xs text-muted-foreground">
                Used when logo image is not available (max 3 characters)
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSaveSettings}
              disabled={saving || (
                localSettings.app_name === logoSettings.app_name &&
                localSettings.fallback_text === logoSettings.fallback_text
              )}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}