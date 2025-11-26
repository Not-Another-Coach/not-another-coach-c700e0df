import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Shield } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface ProfileSectionProps {
  formData: any;
  updateFormData: (updates: any) => void;
  errors?: { [key: string]: string };
  clearFieldError?: (field: string) => void;
}

const genderOptions = [
  { value: "prefer_not_to_say", label: "Prefer not to say" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non_binary", label: "Non-binary" },
  { value: "other", label: "Other" }
];

// Common timezones - can be expanded
const timezoneOptions = [
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "America/New_York", label: "New York (EST)" },
  { value: "America/Chicago", label: "Chicago (CST)" },
  { value: "America/Denver", label: "Denver (MST)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PST)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Asia/Kolkata", label: "Mumbai/Delhi (IST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Australia/Sydney", label: "Sydney (AEDT)" },
];

export function ProfileSection({ formData, updateFormData, errors, clearFieldError }: ProfileSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/profile-photo.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      updateFormData({ profile_photo_url: publicUrl });
      clearFieldError?.('profile_photo_url');

      toast({
        title: "Photo uploaded",
        description: "Your profile photo has been updated"
      });
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your image",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = () => {
    const firstName = formData.first_name || '';
    const lastName = formData.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';
  };

  const detectTimezone = () => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    updateFormData({ timezone: detected });
    clearFieldError?.('timezone');
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Profile Picture</h2>
        <p className="text-muted-foreground">
          Let's start with some basic information to help coaches know who they'll be working with
        </p>
      </div>

      {/* Profile Photo */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Avatar className="h-32 w-32 border-4 border-border">
            <AvatarImage src={formData.profile_photo_url} alt="Profile" />
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <label htmlFor="photo-upload" className="absolute bottom-0 right-0 cursor-pointer">
            <div className="bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90 transition-colors">
              {isUploading ? (
                <div className="animate-spin h-5 w-5 border-2 border-background border-t-transparent rounded-full" />
              ) : (
                <Camera className="h-5 w-5" />
              )}
            </div>
          </label>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={isUploading}
          />
        </div>
        <div className="text-center">
          <Label className="text-sm text-muted-foreground">Profile Photo (Optional now, required when engaging a coach)</Label>
          {errors?.profile_photo_url && (
            <p className="text-sm text-destructive mt-1">{errors.profile_photo_url}</p>
          )}
        </div>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            value={formData.first_name || ''}
            onChange={(e) => {
              updateFormData({ first_name: e.target.value });
              clearFieldError?.('first_name');
            }}
            placeholder="Enter your first name"
            className={errors?.first_name ? 'border-destructive' : ''}
          />
          {errors?.first_name && (
            <p className="text-sm text-destructive">{errors.first_name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name *</Label>
          <Input
            id="last_name"
            value={formData.last_name || ''}
            onChange={(e) => {
              updateFormData({ last_name: e.target.value });
              clearFieldError?.('last_name');
            }}
            placeholder="Enter your last name"
            className={errors?.last_name ? 'border-destructive' : ''}
          />
          {errors?.last_name && (
            <p className="text-sm text-destructive">{errors.last_name}</p>
          )}
        </div>
      </div>

      {/* Gender Preference */}
      <div className="space-y-2">
        <Label htmlFor="gender_preference">Gender Preference *</Label>
        <p className="text-sm text-muted-foreground">
          This helps us personalize your experience
        </p>
        <Select 
          value={formData.gender_preference || ""} 
          onValueChange={(value) => {
            updateFormData({ gender_preference: value });
            clearFieldError?.('gender_preference');
          }}
        >
          <SelectTrigger className={errors?.gender_preference ? 'border-destructive' : ''}>
            <SelectValue placeholder="Select gender preference" />
          </SelectTrigger>
          <SelectContent>
            {genderOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.gender_preference && (
          <p className="text-sm text-destructive">{errors.gender_preference}</p>
        )}
      </div>

      {/* Timezone */}
      <div className="space-y-2">
        <Label htmlFor="timezone">Timezone (Optional)</Label>
        <p className="text-sm text-muted-foreground">
          Helps coaches schedule sessions at convenient times
        </p>
        <div className="flex gap-2">
          <Select 
            value={formData.timezone || ""} 
            onValueChange={(value) => {
              updateFormData({ timezone: value });
              clearFieldError?.('timezone');
            }}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select your timezone" />
            </SelectTrigger>
            <SelectContent>
              {timezoneOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            onClick={detectTimezone}
            className="whitespace-nowrap"
          >
            Auto-detect
          </Button>
        </div>
      </div>

      {/* Phone Number */}
      <div className="space-y-2">
        <Label htmlFor="phone_number">Mobile Number (Optional)</Label>
        <p className="text-sm text-muted-foreground">
          Include country code, e.g., +44 7700 900000
        </p>
        <Input
          id="phone_number"
          type="tel"
          value={formData.phone_number || ''}
          onChange={(e) => {
            updateFormData({ phone_number: e.target.value });
            clearFieldError?.('phone_number');
          }}
          placeholder="+44 7700 900000"
        />
      </div>

      {/* Privacy Note */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <h4 className="font-semibold text-sm">Your Privacy Matters</h4>
              <p className="text-sm text-muted-foreground">
                Your details are only shared with the coach you choose. No spam. No public profile.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
