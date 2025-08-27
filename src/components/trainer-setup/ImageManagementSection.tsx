import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Instagram, Image, Trash2, Check, X, Settings, Eye, EyeOff, Camera } from 'lucide-react';
import { useTrainerImages } from '@/hooks/useTrainerImages';
import { useInstagramIntegration } from '@/hooks/useInstagramIntegration';
import { toast } from '@/hooks/use-toast';
import { SectionHeader } from './SectionHeader';

interface ImageManagementSectionProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export const ImageManagementSection = ({ formData, updateFormData }: ImageManagementSectionProps) => {
  const {
    uploadedImages,
    instagramSelections,
    imagePreferences,
    loading,
    uploading,
    uploadImage,
    deleteUploadedImage,
    toggleImageSelection,
    updateImagePreferences,
    getImageUrl,
    getSelectedImagesForDisplay
  } = useTrainerImages();

  const { 
    connection,
    selectedMedia, 
    getInstagramAuthUrl,
    handleOAuthCallback,
    fetchInstagramMedia,
    disconnectInstagram
  } = useInstagramIntegration();

  const [activeTab, setActiveTab] = useState<'upload' | 'instagram' | 'settings'>('upload');
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file",
          description: `${file.name} is not a valid image file.`,
          variant: "destructive",
        });
        continue;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 5MB.`,
          variant: "destructive",
        });
        continue;
      }

      await uploadImage(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const selectedImagesCount = getSelectedImagesForDisplay().length;
  
  const handleConnectInstagram = () => {
    const redirectUri = `${window.location.origin}/trainer/profile-setup?tab=images&instagram=callback`;
    const authUrl = getInstagramAuthUrl(redirectUri);
    window.location.href = authUrl;
  };

  const handleSyncMedia = async () => {
    try {
      const media = await fetchInstagramMedia();
      toast({
        title: "Success",
        description: `Synced ${media.length} Instagram posts.`,
      });
    } catch (error) {
      console.error('Error syncing Instagram media:', error);
      toast({
        title: "Error",
        description: "Failed to sync Instagram media. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
      <SectionHeader
        icons={[Camera, Instagram]}
        title="Image Management"
        description="Upload your own images and sync with Instagram to showcase your training content."
      />
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <SectionHeader
          icons={[Camera, Instagram]}
          title="Image Management"
          description="Upload your own images and sync with Instagram to showcase your training content on your profile cards."
        />

      {/* Summary Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="font-medium">{selectedImagesCount}</span> images selected for display
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary">
                  {uploadedImages.filter(img => img.is_selected_for_display).length} Uploaded
                </Badge>
                <Badge variant="secondary">
                  {instagramSelections.filter(sel => sel.is_selected_for_display).length} Instagram
                </Badge>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Max: {imagePreferences?.max_images_per_view || 6} per view
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'upload' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('upload')}
        >
          <Upload className="h-4 w-4 inline mr-2" />
          Upload Images
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'instagram' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('instagram')}
        >
          <Instagram className="h-4 w-4 inline mr-2" />
          Instagram Sync
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'settings' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings className="h-4 w-4 inline mr-2" />
          Settings
        </button>
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          {/* Upload Area */}
          <Card>
            <CardContent className="p-6">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">Upload your training images</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop images here, or click to select files
                </p>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  id="image-upload"
                  disabled={uploading}
                />
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <Button variant="outline" disabled={uploading} asChild>
                    <span>
                      {uploading ? 'Uploading...' : 'Select Images'}
                    </span>
                  </Button>
                </Label>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports: JPG, PNG, WebP (max 5MB each)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Images Grid */}
          {uploadedImages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Uploaded Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uploadedImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img
                          src={getImageUrl(image.file_path)}
                          alt={image.file_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant={image.is_selected_for_display ? "default" : "secondary"}
                          onClick={() => toggleImageSelection(image.id, 'uploaded')}
                        >
                          {image.is_selected_for_display ? (
                            <><EyeOff className="h-3 w-3 mr-1" /> Hide</>
                          ) : (
                            <><Eye className="h-3 w-3 mr-1" /> Show</>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteUploadedImage(image.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Selection indicator */}
                      {image.is_selected_for_display && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Instagram Tab */}
      {activeTab === 'instagram' && (
        <div className="space-y-6">
          {!connection ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Instagram className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">Connect your Instagram</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Sync your Instagram posts to showcase your training content
                </p>
                <Button onClick={handleConnectInstagram}>
                  <Instagram className="h-4 w-4 mr-2" />
                  Connect Instagram
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Instagram Media</CardTitle>
                    <Button variant="outline" onClick={handleSyncMedia}>
                      <Instagram className="h-4 w-4 mr-2" />
                      Sync New Posts
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {instagramSelections.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {instagramSelections.map((selection) => (
                        <div key={selection.id} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                            <img
                              src={selection.thumbnail_url || selection.media_url}
                              alt={selection.caption || 'Instagram post'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Button
                              size="sm"
                              variant={selection.is_selected_for_display ? "default" : "secondary"}
                              onClick={() => toggleImageSelection(selection.id, 'instagram')}
                            >
                              {selection.is_selected_for_display ? (
                                <><EyeOff className="h-3 w-3 mr-1" /> Hide</>
                              ) : (
                                <><Eye className="h-3 w-3 mr-1" /> Show</>
                              )}
                            </Button>
                          </div>

                          {/* Selection indicator */}
                          {selection.is_selected_for_display && (
                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                              <Check className="h-3 w-3" />
                            </div>
                          )}

                          {/* Media type indicator */}
                          {selection.media_type === 'VIDEO' && (
                            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              Video
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Instagram className="h-8 w-8 mx-auto mb-2" />
                      <p>No Instagram posts synced yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Display Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="max-images">Maximum images per card view</Label>
                <Select
                  value={(imagePreferences?.max_images_per_view || 6).toString()}
                  onValueChange={(value) => updateImagePreferences({ max_images_per_view: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 images</SelectItem>
                    <SelectItem value="6">6 images</SelectItem>
                    <SelectItem value="8">8 images</SelectItem>
                    <SelectItem value="9">9 images</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-sync">Auto-sync Instagram</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically sync new Instagram posts
                  </p>
                </div>
                <Switch
                  id="auto-sync"
                  checked={imagePreferences?.auto_sync_instagram || false}
                  onCheckedChange={(checked) => updateImagePreferences({ auto_sync_instagram: checked })}
                />
              </div>

              {imagePreferences?.auto_sync_instagram && (
                <div>
                  <Label htmlFor="sync-frequency">Sync frequency</Label>
                  <Select
                    value={imagePreferences?.instagram_sync_frequency || 'weekly'}
                    onValueChange={(value) => updateImagePreferences({ instagram_sync_frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="manual">Manual only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-4">
                This is how your selected images will appear on your profile cards:
              </div>
              <div className="grid grid-cols-3 gap-2 max-w-sm">
                {getSelectedImagesForDisplay().slice(0, imagePreferences?.max_images_per_view || 6).map((image, index) => (
                  <div key={image.id} className="aspect-square rounded bg-muted overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.type === 'uploaded' ? image.fileName : image.caption}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {selectedImagesCount === 0 && (
                  <div className="col-span-3 text-center py-8 text-muted-foreground">
                    <Image className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No images selected</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};