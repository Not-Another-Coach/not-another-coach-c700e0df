import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Shield } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface ProfilePhotoEnforcementModalProps {
  open: boolean;
  onClose: () => void;
  onPhotoUploaded: (photoUrl: string) => void;
  currentPhotoUrl?: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Modal that enforces profile photo upload before engaging with coaches.
 * Use this when a user tries to start a conversation or send a coach selection request
 * without having a profile photo.
 * 
 * Example usage:
 * ```tsx
 * const [showPhotoModal, setShowPhotoModal] = useState(false);
 * 
 * const handleSendMessage = () => {
 *   if (!profile.profile_photo_url) {
 *     setShowPhotoModal(true);
 *     return;
 *   }
 *   // Continue with message sending
 * };
 * 
 * <ProfilePhotoEnforcementModal
 *   open={showPhotoModal}
 *   onClose={() => setShowPhotoModal(false)}
 *   onPhotoUploaded={(url) => {
 *     updateProfile({ profile_photo_url: url });
 *     setShowPhotoModal(false);
 *     // Continue with the action
 *   }}
 *   currentPhotoUrl={profile.profile_photo_url}
 *   firstName={profile.first_name}
 *   lastName={profile.last_name}
 * />
 * ```
 */
export function ProfilePhotoEnforcementModal({
  open,
  onClose,
  onPhotoUploaded,
  currentPhotoUrl,
  firstName,
  lastName
}: ProfilePhotoEnforcementModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(currentPhotoUrl);

  const getInitials = () => {
    const first = firstName || '';
    const last = lastName || '';
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || '?';
  };

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

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      setPhotoUrl(publicUrl);

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

  const handleContinue = () => {
    if (!photoUrl) {
      toast({
        title: "Photo required",
        description: "Please upload a profile photo to continue",
        variant: "destructive"
      });
      return;
    }

    onPhotoUploaded(photoUrl);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Your Profile Photo</DialogTitle>
          <DialogDescription>
            Before you can engage with coaches, please add a profile photo. This helps coaches recognize you and builds trust.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-4">
          {/* Profile Photo Display */}
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-border">
              <AvatarImage src={photoUrl} alt="Profile" />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <label htmlFor="photo-upload-modal" className="absolute bottom-0 right-0 cursor-pointer">
              <div className="bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90 transition-colors">
                {isUploading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-background border-t-transparent rounded-full" />
                ) : (
                  <Camera className="h-5 w-5" />
                )}
              </div>
            </label>
            <input
              id="photo-upload-modal"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isUploading}
            />
          </div>

          {/* Privacy Note */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 w-full">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">Your Privacy Matters</h4>
                <p className="text-sm text-muted-foreground">
                  Your photo is only visible to coaches you engage with. It won't be shown publicly.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!photoUrl || isUploading}
              className="flex-1"
            >
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
