import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Image, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useStatusFeedbackContext } from '@/contexts/StatusFeedbackContext';

interface ImageUploadSectionProps {
  onImageUpload: (imageUrl: string, type: 'before' | 'after') => void;
  existingImages?: { before?: string; after?: string };
}

export const ImageUploadSection = ({ onImageUpload, existingImages }: ImageUploadSectionProps) => {
  const { showSuccess, showError } = useStatusFeedbackContext();
  const [uploading, setUploading] = useState<{ before: boolean; after: boolean }>({
    before: false,
    after: false
  });

  const handleImageUpload = async (type: 'before' | 'after') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError("File too large: Please select an image smaller than 5MB");
        return;
      }

      setUploading(prev => ({ ...prev, [type]: true }));

      try {
        console.log(`Uploading ${type} image`);
        
        // Create unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${type}.${fileExt}`;
        const filePath = `client-photos/${fileName}`;

        // Upload to Supabase storage
        const { data, error } = await supabase.storage
          .from('client-photos')
          .upload(filePath, file);

        if (error) {
          throw error;
        }

        // Get signed URL for private access
        const { data: signed } = await supabase.storage
          .from('client-photos')
          .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 days

        onImageUpload(signed?.signedUrl || '', type);
        
        showSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} image has been uploaded`);

      } catch (error) {
        console.error('Upload error:', error);
        showError("Upload failed: There was an error uploading your image. Please try again");
      } finally {
        setUploading(prev => ({ ...prev, [type]: false }));
      }
    };

    input.click();
  };

  const removeImage = (type: 'before' | 'after') => {
    onImageUpload('', type);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Before Image */}
      <Card className="border-dashed">
        <CardContent className="p-4 text-center">
          {existingImages?.before ? (
            <div className="space-y-2">
              <img 
                src={existingImages.before} 
                alt="Before" 
                className="w-full h-32 object-cover rounded border"
              />
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleImageUpload('before')}
                  disabled={uploading.before}
                >
                  <Image className="h-4 w-4 mr-2" />
                  Replace
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => removeImage('before')}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium mb-2">Before Image</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleImageUpload('before')}
                disabled={uploading.before}
              >
                <Image className="h-4 w-4 mr-2" />
                {uploading.before ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* After Image */}
      <Card className="border-dashed">
        <CardContent className="p-4 text-center">
          {existingImages?.after ? (
            <div className="space-y-2">
              <img 
                src={existingImages.after} 
                alt="After" 
                className="w-full h-32 object-cover rounded border"
              />
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleImageUpload('after')}
                  disabled={uploading.after}
                >
                  <Image className="h-4 w-4 mr-2" />
                  Replace
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => removeImage('after')}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium mb-2">After Image</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleImageUpload('after')}
                disabled={uploading.after}
              >
                <Image className="h-4 w-4 mr-2" />
                {uploading.after ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};