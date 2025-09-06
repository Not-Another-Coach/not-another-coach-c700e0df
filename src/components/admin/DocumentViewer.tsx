import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DocumentViewerProps {
  fileUrl: string;
  filename?: string;
  fileSize?: number;
  fileType?: string;
  className?: string;
}

export const DocumentViewer = ({ 
  fileUrl, 
  filename, 
  fileSize, 
  fileType, 
  className 
}: DocumentViewerProps) => {
  const handleViewDocument = async () => {
    try {
      // Extract the file path correctly
      let filePath = fileUrl;
      
      // If the URL includes the bucket name, remove it
      if (filePath.startsWith('trainer-verification-documents/')) {
        filePath = filePath.substring('trainer-verification-documents/'.length);
      }
      
      console.log('Attempting to access file:', filePath);
      
      const { data, error } = await supabase.storage
        .from('trainer-verification-documents')
        .createSignedUrl(filePath, 300); // 5 minutes expiry
      
      if (error) {
        console.error('Storage error:', error);
        throw error;
      }
      
      if (!data?.signedUrl) {
        throw new Error('No signed URL returned');
      }
      
      console.log('Successfully generated signed URL');
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Error accessing document:', error);
      toast.error('Unable to access document. Please check if the file exists.');
    }
  };

  return (
    <div className={className}>
      <p className="text-sm font-medium text-blue-800 mb-2">Document:</p>
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs"
        onClick={handleViewDocument}
      >
        <FileText className="h-3 w-3 mr-1" />
        {filename || 'View Document'}
      </Button>
      {(fileType || fileSize) && (
        <p className="text-xs text-muted-foreground mt-1">
          {fileType && fileType}
          {fileType && fileSize && ' • '}
          {fileSize && `${Math.round(fileSize / 1024)} KB`}
        </p>
      )}
    </div>
  );
};