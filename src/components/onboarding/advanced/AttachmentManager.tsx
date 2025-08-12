import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileText, 
  Image, 
  Link, 
  Trash2, 
  Download,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAdvancedOnboarding } from '@/hooks/useAdvancedOnboarding';
import { toast } from 'sonner';

interface AttachmentFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploaded_at: string;
}

interface AttachmentManagerProps {
  templateId: string;
  sectionType: string;
  allowedTypes?: string[];
  maxSizePerFile?: number; // in MB
  maxFiles?: number;
  attachments?: AttachmentFile[];
  onAttachmentsChange?: (attachments: AttachmentFile[]) => void;
  uploadInstructions?: string;
}

export function AttachmentManager({
  templateId,
  sectionType,
  allowedTypes = ['image', 'document', 'link'],
  maxSizePerFile = 10,
  maxFiles = 5,
  attachments = [],
  onAttachmentsChange,
  uploadInstructions
}: AttachmentManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkName, setLinkName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadAttachment, deleteAttachment } = useAdvancedOnboarding();

  const isFileTypeAllowed = (file: File): boolean => {
    const fileType = file.type;
    
    if (allowedTypes.includes('image') && fileType.startsWith('image/')) return true;
    if (allowedTypes.includes('document') && (
      fileType === 'application/pdf' ||
      fileType === 'application/msword' ||
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType === 'text/plain'
    )) return true;
    
    return false;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type === 'link') return <Link className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (attachments.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        if (!isFileTypeAllowed(file)) {
          toast.error(`File type not allowed: ${file.name}`);
          return null;
        }

        if (file.size > maxSizePerFile * 1024 * 1024) {
          toast.error(`File too large: ${file.name} (max ${maxSizePerFile}MB)`);
          return null;
        }

        const url = await uploadAttachment(templateId, file, sectionType);
        
        // Update progress
        setUploadProgress(((index + 1) / files.length) * 100);
        
        return {
          id: `${Date.now()}-${index}`,
          name: file.name,
          url,
          size: file.size,
          type: file.type,
          uploaded_at: new Date().toISOString()
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      const validFiles = uploadedFiles.filter(file => file !== null) as AttachmentFile[];
      
      const newAttachments = [...attachments, ...validFiles];
      onAttachmentsChange?.(newAttachments);
      
      toast.success(`${validFiles.length} file(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [templateId, sectionType, maxFiles, maxSizePerFile, attachments, onAttachmentsChange, uploadAttachment]);

  const handleAddLink = () => {
    if (!linkUrl || !linkName) {
      toast.error('Please provide both URL and name for the link');
      return;
    }

    const newLink: AttachmentFile = {
      id: `link-${Date.now()}`,
      name: linkName,
      url: linkUrl,
      size: 0,
      type: 'link',
      uploaded_at: new Date().toISOString()
    };

    const newAttachments = [...attachments, newLink];
    onAttachmentsChange?.(newAttachments);
    setLinkUrl('');
    setLinkName('');
    toast.success('Link added successfully');
  };

  const handleDeleteAttachment = async (attachment: AttachmentFile) => {
    try {
      if (attachment.type !== 'link') {
        // Extract file path from URL for storage deletion
        const urlParts = attachment.url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        await deleteAttachment(fileName);
      }

      const newAttachments = attachments.filter(a => a.id !== attachment.id);
      onAttachmentsChange?.(newAttachments);
      
      toast.success('Attachment removed successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to remove attachment');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Attachments ({attachments.length}/{maxFiles})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {uploadInstructions && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{uploadInstructions}</AlertDescription>
          </Alert>
        )}

        {/* Upload Area */}
        <div
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            Drag and drop files here, or click to browse
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-3">
            {allowedTypes.map(type => (
              <Badge key={type} variant="outline" className="text-xs">
                {type}
              </Badge>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={uploading || attachments.length >= maxFiles}
            onClick={() => fileInputRef.current?.click()}
          >
            Select Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            accept={allowedTypes.includes('image') ? 'image/*' : undefined}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Max {maxSizePerFile}MB per file
          </p>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Add Link Section */}
        {allowedTypes.includes('link') && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-sm font-medium">Add Link</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Link Name</Label>
                <Input
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                  placeholder="e.g., Company Website"
                />
              </div>
              <div>
                <Label className="text-xs">URL</Label>
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
            <Button
              onClick={handleAddLink}
              disabled={!linkUrl || !linkName || attachments.length >= maxFiles}
              className="w-full"
            >
              Add Link
            </Button>
          </div>
        )}

        {/* Attachments List */}
        {attachments.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <h4 className="text-sm font-medium">Current Attachments</h4>
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-2 border rounded-lg"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getFileIcon(attachment.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {attachment.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {attachment.type === 'link' ? 'Link' : formatFileSize(attachment.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {attachment.type !== 'link' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(attachment.url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAttachment(attachment)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}