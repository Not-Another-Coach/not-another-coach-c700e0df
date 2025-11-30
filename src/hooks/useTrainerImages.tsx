import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { FileUploadService } from '@/services';
import { toast } from '@/hooks/use-toast';
import { useTrainerImagesData } from './data/useTrainerImagesData';
import type { TrainerUploadedImage, TrainerInstagramSelection, TrainerImagePreferences } from './data/useTrainerImagesData';

// Single source of truth for grid size calculation - exported for reuse
export const getRecommendedGridSizeForCount = (count: number) => {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 1; // 2-3 images: show 1 (hero)
  if (count <= 5) return 4; // 4-5 images: show 4 (2x2)
  if (count <= 8) return 6; // 6-8 images: show 6 (3x2)
  if (count <= 11) return 9; // 9-11 images: show 9 (3x3)
  return 12; // 12+ images: show 12 (4x3)
};

export const getGridLabel = (gridSize: number) => {
  const labels = {
    1: '1 image (Hero)',
    4: '4 images (2×2)',
    6: '6 images (3×2)',
    9: '9 images (3×3)',
    12: '12 images (4×3)'
  };
  return labels[gridSize as keyof typeof labels] || `${gridSize} images`;
};

// Re-export types from data hook
export type { TrainerUploadedImage, TrainerInstagramSelection, TrainerImagePreferences };

export const useTrainerImages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Use data hook for fetching
  const { data, isLoading } = useTrainerImagesData();

  const uploadedImages = data?.uploadedImages || [];
  const instagramSelections = data?.instagramSelections || [];
  const imagePreferences = data?.imagePreferences || null;

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) throw new Error('No user authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const uploadResult = await FileUploadService.uploadFile(
        'trainer-images',
        filePath,
        file
      );

      if (uploadResult.error) {
        throw new Error(uploadResult.error.message);
      }

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
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-images', user?.id] });
      toast({
        title: "Success",
        description: "Image uploaded successfully!",
      });
    },
    onError: (error) => {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (imageId: string) => {
      if (!user?.id) throw new Error('No user authenticated');

      const image = uploadedImages.find(img => img.id === imageId);
      if (!image) throw new Error('Image not found');

      const deleteResult = await FileUploadService.deleteFile(
        'trainer-images',
        image.file_path
      );

      if (deleteResult.error) {
        throw new Error(deleteResult.error.message);
      }

      const { error: dbError } = await supabase
        .from('trainer_uploaded_images')
        .delete()
        .eq('id', imageId);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-images', user?.id] });
      toast({
        title: "Success",
        description: "Image deleted successfully!",
      });
    },
    onError: (error) => {
      console.error('Error deleting image:', error);
      toast({
        title: "Error",
        description: "Failed to delete image. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Toggle selection mutation
  const toggleSelectionMutation = useMutation({
    mutationFn: async ({ imageId, type }: { imageId: string; type: 'uploaded' | 'instagram' }) => {
      if (!user?.id) throw new Error('No user authenticated');

      if (type === 'uploaded') {
        const image = uploadedImages.find(img => img.id === imageId);
        if (!image) throw new Error('Image not found');

        const { error } = await supabase
          .from('trainer_uploaded_images')
          .update({ is_selected_for_display: !image.is_selected_for_display })
          .eq('id', imageId);

        if (error) throw error;
      } else {
        const selection = instagramSelections.find(sel => sel.id === imageId);
        if (!selection) throw new Error('Selection not found');

        const { error } = await supabase
          .from('trainer_instagram_selections')
          .update({ is_selected_for_display: !selection.is_selected_for_display })
          .eq('id', imageId);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-images', user?.id] });
      toast({
        title: "Success",
        description: "Image selection updated!",
      });
    },
    onError: (error) => {
      console.error('Error toggling image selection:', error);
      toast({
        title: "Error",
        description: "Failed to update selection. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences: Partial<TrainerImagePreferences>) => {
      if (!user?.id) throw new Error('No user authenticated');

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
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-images', user?.id] });
      toast({
        title: "Success",
        description: "Preferences updated successfully!",
      });
    },
    onError: (error) => {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Get public URL for uploaded image (synchronous version for JSX usage)
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

  // Validation helpers
  const getSelectedImagesCount = () => {
    return uploadedImages.filter(img => img.is_selected_for_display).length +
           instagramSelections.filter(sel => sel.is_selected_for_display).length;
  };

  const getGridCapacity = (gridSize: number) => gridSize;

  const getRecommendedGridSize = () => {
    const selectedCount = getSelectedImagesCount();
    return getRecommendedGridSizeForCount(selectedCount);
  };

  const handleExcessImages = async (maxImages: number) => {
    const selectedImages = getSelectedImagesForDisplay();
    const excessCount = selectedImages.length - maxImages;
    
    if (excessCount <= 0) return;

    const imagesToDeselect = selectedImages.slice(maxImages);
    
    for (const image of imagesToDeselect) {
      await toggleSelectionMutation.mutateAsync({ imageId: image.id, type: image.type });
    }

    toast({
      title: "Auto-adjusted",
      description: `Automatically deselected ${excessCount} excess image${excessCount > 1 ? 's' : ''} to fit ${getGridLabel(maxImages)} layout`,
    });
  };

  const getValidationStatus = () => {
    const selectedCount = getSelectedImagesCount();
    
    if (selectedCount === 0) {
      return { status: 'incomplete', message: 'No images selected for display' };
    }
    
    const recommendedGridSize = getRecommendedGridSize();
    
    return { 
      status: 'complete', 
      message: `${selectedCount} image${selectedCount > 1 ? 's' : ''} selected - Using ${getGridLabel(recommendedGridSize)} layout` 
    };
  };

  return {
    uploadedImages,
    instagramSelections,
    imagePreferences,
    loading: isLoading,
    uploading: uploadMutation.isPending,
    fetchTrainerImages: () => queryClient.invalidateQueries({ queryKey: ['trainer-images', user?.id] }),
    uploadImage: uploadMutation.mutateAsync,
    deleteUploadedImage: deleteMutation.mutate,
    toggleImageSelection: (imageId: string, type: 'uploaded' | 'instagram') => 
      toggleSelectionMutation.mutate({ imageId, type }),
    updateImagePreferences: updatePreferencesMutation.mutate,
    getImageUrl,
    getSelectedImagesForDisplay,
    // Validation helpers
    getSelectedImagesCount,
    getRecommendedGridSize,
    getValidationStatus,
    getGridLabel
  };
};
