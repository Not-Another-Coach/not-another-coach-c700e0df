import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Upload,
  X,
  Save,
  Send,
  Image as ImageIcon,
  Video,
  FileText,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface HighlightSubmissionFormProps {
  existingSubmission?: any;
  onSuccess: () => void;
}

export function HighlightSubmissionForm({ 
  existingSubmission, 
  onSuccess 
}: HighlightSubmissionFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_type: '',
    media_urls: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [mediaUploading, setMediaUploading] = useState(false);

  useEffect(() => {
    if (existingSubmission) {
      setFormData({
        title: existingSubmission.title || '',
        description: existingSubmission.description || '',
        content_type: existingSubmission.content_type || '',
        media_urls: existingSubmission.media_urls || [],
      });
    }
  }, [existingSubmission]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setMediaUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('highlights-media')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('highlights-media')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setFormData(prev => ({
        ...prev,
        media_urls: [...prev.media_urls, ...uploadedUrls]
      }));

      toast({
        title: "Success",
        description: `${uploadedUrls.length} file(s) uploaded successfully`,
      });
    } catch (error) {
      console.error('Error uploading media:', error);
      toast({
        title: "Error",
        description: "Failed to upload media files",
        variant: "destructive"
      });
    } finally {
      setMediaUploading(false);
    }
  };

  const removeMedia = (index: number) => {
    setFormData(prev => ({
      ...prev,
      media_urls: prev.media_urls.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (asDraft: boolean = false) => {
    if (!user) return;

    if (!asDraft && (!formData.title.trim() || !formData.description.trim() || !formData.content_type)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const submissionData = {
        trainer_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        content_type: formData.content_type,
        media_urls: formData.media_urls,
        submission_status: asDraft ? 'draft' : 'submitted'
      };

      if (existingSubmission) {
        // Update existing submission
        const { error } = await supabase
          .from('highlights_submissions')
          .update(submissionData)
          .eq('id', existingSubmission.id);

        if (error) throw error;
      } else {
        // Create new submission
        const { error } = await supabase
          .from('highlights_submissions')
          .insert(submissionData);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Submission ${asDraft ? 'saved as draft' : 'submitted for review'} successfully`,
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving submission:', error);
      toast({
        title: "Error",
        description: "Failed to save submission",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const contentTypes = [
    { value: 'transformation', label: 'Transformation Story', icon: '✨', description: 'Client success stories and before/after transformations' },
    { value: 'motivational', label: 'Motivational Content', icon: '💪', description: 'Inspiring messages and motivational content' },
    { value: 'article', label: 'Educational Article', icon: '📖', description: 'In-depth articles about fitness, nutrition, or wellness' },
    { value: 'tip', label: 'Training Tip', icon: '💡', description: 'Quick tips, techniques, or form corrections' }
  ];

  const selectedContentType = contentTypes.find(ct => ct.value === formData.content_type);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Content Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Content Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {contentTypes.map((type) => (
              <div
                key={type.value}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.content_type === type.value 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => handleInputChange('content_type', type.value)}
              >
                <div className="flex items-start gap-3">
                  <div className="text-xl">{type.icon}</div>
                  <div>
                    <h4 className="font-medium">{type.label}</h4>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {selectedContentType && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedContentType.icon}</span>
                <Badge variant="secondary">{selectedContentType.label}</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Details */}
      <Card>
        <CardHeader>
          <CardTitle>Content Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter a compelling title for your content"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide a detailed description of your content"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="mt-1 min-h-24"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Media Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Media Files (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="media">Upload Images or Videos</Label>
            <div className="mt-1 flex items-center gap-4">
              <Input
                id="media"
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleMediaUpload}
                disabled={mediaUploading}
                className="flex-1"
              />
              <Button variant="outline" disabled={mediaUploading} asChild>
                <label htmlFor="media" className="cursor-pointer">
                  {mediaUploading ? 'Uploading...' : 'Browse Files'}
                </label>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Supported formats: Images (JPG, PNG, GIF) and Videos (MP4, MOV). Max 10MB per file.
            </p>
          </div>

          {formData.media_urls.length > 0 && (
            <div className="space-y-2">
              <Label>Uploaded Media</Label>
              <div className="grid gap-2 md:grid-cols-2">
                {formData.media_urls.map((url, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      {url.includes('video') ? (
                        <Video className="h-4 w-4" />
                      ) : (
                        <ImageIcon className="h-4 w-4" />
                      )}
                      <span className="text-sm truncate">
                        {url.includes('video') ? 'Video' : 'Image'} {index + 1}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMedia(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Submission Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Content should be original and created by you</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Ensure client consent for transformation stories</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Keep content professional and appropriate</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>High-quality images and videos preferred</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Review will be completed within 24-48 hours</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => handleSubmit(true)}
          disabled={loading}
        >
          <Save className="h-4 w-4 mr-2" />
          Save as Draft
        </Button>
        <Button
          onClick={() => handleSubmit(false)}
          disabled={loading || !formData.title.trim() || !formData.description.trim() || !formData.content_type}
        >
          <Send className="h-4 w-4 mr-2" />
          Submit for Review
        </Button>
      </div>
    </div>
  );
}