import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface TrainerUploadedImage {
  id: string;
  trainer_id: string;
  file_path: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  is_selected_for_display: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface TrainerInstagramSelection {
  id: string;
  trainer_id: string;
  instagram_media_id: string;
  media_url: string;
  media_type: string;
  thumbnail_url?: string;
  caption?: string;
  is_selected_for_display: boolean;
  display_order: number;
  synced_at: string;
  created_at: string;
  updated_at: string;
}

export interface TrainerImagePreferences {
  id: string;
  trainer_id: string;
  max_images_per_view: number;
  auto_sync_instagram: boolean;
  instagram_sync_frequency: string;
  last_instagram_sync?: string;
  created_at: string;
  updated_at: string;
}

export const useTrainerImages = () => {
  const { user } = useAuth();
  const [uploadedImages, setUploadedImages] = useState<TrainerUploadedImage[]>([]);
  const [instagramSelections, setInstagramSelections] = useState<TrainerInstagramSelection[]>([]);
  const [imagePreferences, setImagePreferences] = useState<TrainerImagePreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Fetch all trainer images and preferences
  const fetchTrainerImages = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Fetch uploaded images
      const { data: uploadedData, error: uploadedError } = await supabase
        .from('trainer_uploaded_images')
        .select('*')
        .eq('trainer_id', user.id)
        .order('display_order', { ascending: true });

      if (uploadedError) throw uploadedError;

      // Fetch Instagram selections
      const { data: instagramData, error: instagramError } = await supabase
        .from('trainer_instagram_selections')
        .select('*')
        .eq('trainer_id', user.id)
        .order('display_order', { ascending: true });

      if (instagramError) throw instagramError;

      // Fetch preferences
      const { data: preferencesData, error: preferencesError } = await supabase
        .from('trainer_image_preferences')
        .select('*')
        .eq('trainer_id', user.id)
        .single();

      if (preferencesError && preferencesError.code !== 'PGRST116') {
        throw preferencesError;
      }

      setUploadedImages(uploadedData || []);
      setInstagramSelections(instagramData || []);
      setImagePreferences(preferencesData || null);
    } catch (error) {
      console.error('Error fetching trainer images:', error);
      toast({
        title: "Error",
        description: "Failed to load images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Upload new image
  const uploadImage = async (file: File): Promise<TrainerUploadedImage | null> => {
    if (!user?.id) return null;

    try {
      setUploading(true);

      // Create file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('trainer-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save to database
      const { data, error: dbError } = await supabase
        .from('trainer_uploaded_images')
        .insert({
          trainer_id: user.id,
          file_path: filePath,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          display_order: uploadedImages.length
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Update local state
      setUploadedImages(prev => [...prev, data]);

      toast({
        title: "Success",
        description: "Image uploaded successfully!",
      });

      return data;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Delete uploaded image
  const deleteUploadedImage = async (imageId: string) => {
    if (!user?.id) return;

    try {
      // Find the image
      const image = uploadedImages.find(img => img.id === imageId);
      if (!image) return;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('trainer-images')
        .remove([image.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('trainer_uploaded_images')
        .delete()
        .eq('id', imageId);

      if (dbError) throw dbError;

      // Update local state
      setUploadedImages(prev => prev.filter(img => img.id !== imageId));

      toast({
        title: "Success",
        description: "Image deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Error",
        description: "Failed to delete image. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Toggle image selection for display
  const toggleImageSelection = async (imageId: string, type: 'uploaded' | 'instagram') => {
    if (!user?.id) return;

    try {
      if (type === 'uploaded') {
        const image = uploadedImages.find(img => img.id === imageId);
        if (!image) return;

        const { error } = await supabase
          .from('trainer_uploaded_images')
          .update({ is_selected_for_display: !image.is_selected_for_display })
          .eq('id', imageId);

        if (error) throw error;

        setUploadedImages(prev => 
          prev.map(img => 
            img.id === imageId 
              ? { ...img, is_selected_for_display: !img.is_selected_for_display }
              : img
          )
        );
      } else {
        const selection = instagramSelections.find(sel => sel.id === imageId);
        if (!selection) return;

        const { error } = await supabase
          .from('trainer_instagram_selections')
          .update({ is_selected_for_display: !selection.is_selected_for_display })
          .eq('id', imageId);

        if (error) throw error;

        setInstagramSelections(prev => 
          prev.map(sel => 
            sel.id === imageId 
              ? { ...sel, is_selected_for_display: !sel.is_selected_for_display }
              : sel
          )
        );
      }

      toast({
        title: "Success",
        description: "Image selection updated!",
      });
    } catch (error) {
      console.error('Error toggling image selection:', error);
      toast({
        title: "Error",
        description: "Failed to update selection. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Update image preferences
  const updateImagePreferences = async (preferences: Partial<TrainerImagePreferences>) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('trainer_image_preferences')
        .upsert({
          trainer_id: user.id,
          ...preferences
        }, {
          onConflict: 'trainer_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) throw error;

      setImagePreferences(data);

      toast({
        title: "Success",
        description: "Preferences updated successfully!",
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get public URL for uploaded image
  const getImageUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('trainer-images')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };

  // Get all selected images for display (combined uploaded + Instagram)
  const getSelectedImagesForDisplay = () => {
    const selectedUploaded = uploadedImages
      .filter(img => img.is_selected_for_display)
      .map(img => ({
        id: img.id,
        type: 'uploaded' as const,
        url: getImageUrl(img.file_path),
        displayOrder: img.display_order,
        fileName: img.file_name
      }));

    const selectedInstagram = instagramSelections
      .filter(sel => sel.is_selected_for_display)
      .map(sel => ({
        id: sel.id,
        type: 'instagram' as const,
        url: sel.media_url,
        displayOrder: sel.display_order,
        caption: sel.caption
      }));

    return [...selectedUploaded, ...selectedInstagram]
      .sort((a, b) => a.displayOrder - b.displayOrder);
  };

  useEffect(() => {
    fetchTrainerImages();
  }, [user?.id]);

  // Validation helpers
  const getSelectedImagesCount = () => {
    return uploadedImages.filter(img => img.is_selected_for_display).length +
           instagramSelections.filter(sel => sel.is_selected_for_display).length;
  };

  const getGridCapacity = (gridSize: number) => gridSize;

  const getCompatibleGridSizes = () => {
    const selectedCount = getSelectedImagesCount();
    const gridOptions = [
      { value: 1, label: '1 image (Hero)', capacity: 1 },
      { value: 4, label: '4 images (2×2)', capacity: 4 },
      { value: 6, label: '6 images (3×2)', capacity: 6 },
      { value: 9, label: '9 images (3×3)', capacity: 9 },
      { value: 12, label: '12 images (4×3)', capacity: 12 }
    ];
    
    // Only show grid sizes that can be filled with selected images (no empty spaces)
    return gridOptions.filter(option => selectedCount === 0 || option.capacity <= selectedCount || option.capacity === selectedCount);
  };

  const getRecommendedGridSize = () => {
    const selectedCount = getSelectedImagesCount();
    if (selectedCount === 0) return 6;
    if (selectedCount === 1) return 1;
    if (selectedCount <= 4) return 4;
    if (selectedCount <= 6) return 6;
    if (selectedCount <= 9) return 9;
    return 12;
  };

  const isGridSizeValid = () => {
    const selectedCount = getSelectedImagesCount();
    const currentGridSize = imagePreferences?.max_images_per_view || 6;
    return selectedCount <= currentGridSize;
  };

  const getValidationStatus = () => {
    const selectedCount = getSelectedImagesCount();
    const currentGridSize = imagePreferences?.max_images_per_view || 6;
    
    if (selectedCount === 0) {
      return { status: 'incomplete', message: 'No images selected for display' };
    }
    
    if (selectedCount > currentGridSize) {
      return { 
        status: 'error', 
        message: `${selectedCount} images selected but grid only shows ${currentGridSize}` 
      };
    }
    
    if (selectedCount < currentGridSize) {
      return { 
        status: 'warning', 
        message: `${selectedCount} images selected, ${currentGridSize - selectedCount} more needed to fill grid` 
      };
    }
    
    return { status: 'complete', message: `Perfect! ${selectedCount} images selected` };
  };

  const autoAdjustToGridSize = async (targetGridSize: number) => {
    const selectedImages = getSelectedImagesForDisplay();
    const excessCount = selectedImages.length - targetGridSize;
    
    if (excessCount <= 0) return;

    // Deselect excess images (starting from the end)
    const imagesToDeselect = selectedImages.slice(targetGridSize);
    
    for (const image of imagesToDeselect) {
      await toggleImageSelection(image.id, image.type);
    }

    toast({
      title: "Auto-adjusted",
      description: `Deselected ${excessCount} excess images to fit ${targetGridSize}-image grid`,
    });
  };

  return {
    uploadedImages,
    instagramSelections,
    imagePreferences,
    loading,
    uploading,
    fetchTrainerImages,
    uploadImage,
    deleteUploadedImage,
    toggleImageSelection,
    updateImagePreferences,
    getImageUrl,
    getSelectedImagesForDisplay,
    // Validation helpers
    getSelectedImagesCount,
    getGridCapacity,
    getCompatibleGridSizes,
    getRecommendedGridSize,
    isGridSizeValid,
    getValidationStatus,
    autoAdjustToGridSize
  };
};