import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Upload, Instagram, Image, Trash2, Check, X, Eye, EyeOff, Camera, CheckCircle, Info } from 'lucide-react';
import { useTrainerImages } from '@/hooks/useTrainerImages';
import { useInstagramIntegration } from '@/hooks/useInstagramIntegration';
import { useInstagramConnection } from '@/hooks/useInstagramConnection';
import { useStatusFeedbackContext } from '@/contexts/StatusFeedbackContext';
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
    getSelectedImagesForDisplay,
    getSelectedImagesCount,
    getRecommendedGridSize,
    getValidationStatus,
    getGridLabel
  } = useTrainerImages();

  const { 
    connection,
    selectedMedia, 
    getInstagramAuthUrl,
    handleOAuthCallback,
    fetchInstagramMedia,
    disconnectInstagram
  } = useInstagramIntegration();

  const { isConnected } = useInstagramConnection();
  const { showSuccess, showError } = useStatusFeedbackContext();

  const [activeTab, setActiveTab] = useState<'upload' | 'instagram'>('upload');
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showError(`${file.name} is not a valid image file`);
        continue;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        showError(`${file.name} is larger than 5MB`);
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

  const selectedImagesCount = getSelectedImagesCount();
  const validationStatus = getValidationStatus();
  const recommendedGridSize = getRecommendedGridSize();
  
  const handleConnectInstagram = () => {
    const redirectUri = `${window.location.origin}/trainer/profile-setup?tab=images&instagram=callback`;
    const authUrl = getInstagramAuthUrl(redirectUri);
    window.location.href = authUrl;
  };

  const handleSyncMedia = async () => {
    try {
      const media = await fetchInstagramMedia();
      showSuccess(`Synced ${media.length} Instagram posts`);
    } catch (error) {
      console.error('Error syncing Instagram media:', error);
      showError("Failed to sync Instagram media. Please try again");
    }
  };

  if (loading) {
    console.log('ImageManagementSection: Loading state');
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
                  <span className="font-medium">{selectedImagesCount}</span> images selected
                  {selectedImagesCount > recommendedGridSize && (
                    <span className="text-muted-foreground ml-1">
                      (showing {recommendedGridSize})
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">
                    {uploadedImages.length} Uploaded
                  </Badge>
                  <Badge variant="secondary">
                    {instagramSelections.filter(sel => sel.is_selected_for_display).length} Instagram
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Grid: {getGridLabel(recommendedGridSize)}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="inline-flex items-center justify-center">
                        <Info className="h-3 w-3 hover:text-foreground transition-colors" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <div className="space-y-1 text-xs">
                        <div className="font-medium mb-2">Auto-Selection Rules:</div>
                        <div className="flex justify-between">
                          <span>1-3 images</span>
                          <span>→ Hero layout (1 image)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>4-5 images</span>
                          <span>→ 2×2 grid (4 images max)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>6-8 images</span>
                          <span>→ 3×2 grid (6 images max)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>9-11 images</span>
                          <span>→ 3×3 grid (9 images max)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>12+ images</span>
                          <span>→ 4×3 grid (12 images max)</span>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'upload' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('upload')}
        >
          <Upload className="h-4 w-4" />
          Upload Images
          {uploadedImages.some(img => img.is_selected_for_display) && (
            <CheckCircle className="h-3 w-3 text-green-500" />
          )}
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'instagram' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          } ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => isConnected && setActiveTab('instagram')}
          disabled={!isConnected}
        >
          <Instagram className="h-4 w-4" />
          Instagram Sync
          {isConnected && instagramSelections.some(sel => sel.is_selected_for_display) && (
            <CheckCircle className="h-3 w-3 text-green-500" />
          )}
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

          {/* Validation Status */}
          <Card>
            <CardContent className="p-4">
              <div className={`p-3 rounded-lg border flex items-start gap-3 ${
                validationStatus.status === 'complete' 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}>
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{validationStatus.message}</p>
                  <p className="text-xs mt-1 opacity-75">
                    Grid size is automatically selected based on your image count
                  </p>
                </div>
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
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted relative">
                        <img
                          src={getImageUrl(image.file_path)}
                          alt={image.file_name}
                          className={`w-full h-full object-cover ${!image.is_selected_for_display ? 'opacity-50' : ''}`}
                        />
                        {!image.is_selected_for_display && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-0.5 bg-red-500 transform rotate-12"></div>
                          </div>
                        )}
                      </div>
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant={image.is_selected_for_display ? "default" : "outline"}
                          onClick={() => toggleImageSelection(image.id, 'uploaded')}
                          className="flex items-center justify-center w-8 h-8 p-0"
                        >
                          {image.is_selected_for_display ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
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
                          <div className="aspect-square rounded-lg overflow-hidden bg-muted relative">
                            <img
                              src={selection.thumbnail_url || selection.media_url}
                              alt={selection.caption || 'Instagram post'}
                              className={`w-full h-full object-cover ${!selection.is_selected_for_display ? 'opacity-50' : ''}`}
                            />
                            {!selection.is_selected_for_display && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-full h-0.5 bg-red-500 transform rotate-12"></div>
                              </div>
                            )}
                          </div>
                          
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Button
                              size="sm"
                              variant={selection.is_selected_for_display ? "default" : "outline"}
                              onClick={() => toggleImageSelection(selection.id, 'instagram')}
                              className="flex items-center justify-center w-8 h-8 p-0"
                            >
                              {selection.is_selected_for_display ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
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

              {/* Instagram Settings */}
              {connection && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Instagram Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-sync">Auto-sync Instagram</Label>
                        <p className="text-xs text-muted-foreground">
                          Automatically sync new Instagram posts
                        </p>
                      </div>
                      <Switch
                        id="auto-sync"
                        checked={imagePreferences?.auto_sync_instagram || false}
                        onCheckedChange={(checked) => 
                          updateImagePreferences({ auto_sync_instagram: checked })
                        }
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
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};