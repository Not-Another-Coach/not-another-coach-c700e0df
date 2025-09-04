import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Image, Trash2, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface EnhancedImageUploadProps {
  onImageUpload: (imageUrl: string, type: 'before' | 'after') => void;
  existingImages?: { before?: string; after?: string };
}

export const EnhancedImageUpload = ({ onImageUpload, existingImages }: EnhancedImageUploadProps) => {
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
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive"
        });
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
        
        toast({
          title: "Image uploaded successfully",
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} image has been uploaded`,
        });

      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: "Upload failed",
          description: "There was an error uploading your image. Please try again.",
          variant: "destructive"
        });
      } finally {
        setUploading(prev => ({ ...prev, [type]: false }));
      }
    };

    input.click();
  };

  const removeImage = (type: 'before' | 'after') => {
    onImageUpload('', type);
  };

  const ImageUploadCard = ({ type, title }: { type: 'before' | 'after', title: string }) => {
    const existingImage = existingImages?.[type];
    const isUploading = uploading[type];

    return (
      <Card className="border-2 border-dashed hover:border-primary/50 transition-colors">
        <CardContent className="p-6">
          {existingImage ? (
            // Show existing image prominently
            <div className="space-y-4">
              <div className="relative group">
                <img 
                  src={existingImage} 
                  alt={`${title} transformation`}
                  className="w-full h-48 object-cover rounded-lg bg-muted"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleImageUpload(type)}
                      disabled={isUploading}
                      className="bg-white/90 hover:bg-white"
                    >
                      <Camera className="h-4 w-4 mr-1" />
                      Change
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeImage(type)}
                      className="bg-red-500/90 hover:bg-red-500"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <h4 className="font-medium text-sm">{title} Image</h4>
                <p className="text-xs text-muted-foreground">
                  Hover to change or remove
                </p>
              </div>
            </div>
          ) : (
            // Show upload interface
            <div className="text-center space-y-4">
              <div className="bg-muted/50 rounded-lg p-8 border-2 border-dashed border-muted-foreground/20">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h4 className="font-medium mb-2">{title} Image</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a clear photo showing the client's {type} transformation
                </p>
                <Button 
                  variant="outline"
                  onClick={() => handleImageUpload(type)}
                  disabled={isUploading}
                  className="w-full"
                >
                  <Image className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : `Upload ${title}`}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ImageUploadCard type="before" title="Before" />
      <ImageUploadCard type="after" title="After" />
    </div>
  );
};