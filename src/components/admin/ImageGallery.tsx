import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Image, ExternalLink, X } from 'lucide-react';

interface ImageGalleryProps {
  images: Array<{
    url: string;
    caption?: string;
    type?: string;
  }>;
  title: string;
}

export const ImageGallery = ({ images, title }: ImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-4">
        <Image className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No images uploaded</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{title}</h4>
        <Badge variant="outline">{images.length} image{images.length !== 1 ? 's' : ''}</Badge>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={index} className="space-y-2">
            <div 
              className="relative aspect-square rounded-lg overflow-hidden border cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setSelectedImage(image.url)}
            >
              <img
                src={image.url}
                alt={image.caption || `${title} ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
              {image.type && (
                <Badge className="absolute top-2 right-2 text-xs">
                  {image.type}
                </Badge>
              )}
            </div>
            {image.caption && (
              <p className="text-xs text-muted-foreground text-center">{image.caption}</p>
            )}
          </div>
        ))}
      </div>

      {/* Full-size image modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-4 h-4" />
            </Button>
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Full size"
                className="w-full max-h-[80vh] object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};