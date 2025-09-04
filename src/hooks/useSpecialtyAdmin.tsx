import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { SpecialtyCategory, Specialty, TrainingType, CustomSpecialtyRequest } from './useSpecialties';

// Admin hook for managing specialty categories
export function useSpecialtyCategoryAdmin() {
  const [loading, setLoading] = useState(false);

  const createCategory = async (categoryData: Omit<SpecialtyCategory, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('specialty_categories')
        .insert([categoryData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Specialty category created successfully"
      });

      return data;
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Error",
        description: "Failed to create specialty category",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: string, updates: Partial<SpecialtyCategory>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('specialty_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Specialty category updated successfully"
      });

      return data;
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update specialty category",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('specialty_categories')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Specialty category deactivated successfully"
      });
    } catch (error) {
      console.error('Error deactivating category:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate specialty category",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const reorderCategories = async (categoryIds: string[]) => {
    setLoading(true);
    try {
      const updates = categoryIds.map((id, index) => ({ id, display_order: index + 1 }));
      
      for (const update of updates) {
        await supabase
          .from('specialty_categories')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }

      toast({
        title: "Success",
        description: "Category order updated successfully"
      });
    } catch (error) {
      console.error('Error reordering categories:', error);
      toast({
        title: "Error",
        description: "Failed to update category order",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories
  };
}

// Admin hook for managing specialties
export function useSpecialtyAdmin() {
  const [loading, setLoading] = useState(false);

  const createSpecialty = async (specialtyData: Omit<Specialty, 'id' | 'created_at' | 'updated_at' | 'category'>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('specialties')
        .insert([specialtyData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Specialty created successfully"
      });

      return data;
    } catch (error) {
      console.error('Error creating specialty:', error);
      toast({
        title: "Error",
        description: "Failed to create specialty",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSpecialty = async (id: string, updates: Partial<Specialty>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('specialties')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Specialty updated successfully"
      });

      return data;
    } catch (error) {
      console.error('Error updating specialty:', error);
      toast({
        title: "Error",
        description: "Failed to update specialty",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteSpecialty = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('specialties')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Specialty deactivated successfully"
      });
    } catch (error) {
      console.error('Error deactivating specialty:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate specialty",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createSpecialty,
    updateSpecialty,
    deleteSpecialty
  };
}

// Admin hook for managing training types
export function useTrainingTypeAdmin() {
  const [loading, setLoading] = useState(false);

  const createTrainingType = async (trainingTypeData: Omit<TrainingType, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('training_types')
        .insert([trainingTypeData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Training type created successfully"
      });

      return data;
    } catch (error) {
      console.error('Error creating training type:', error);
      toast({
        title: "Error",
        description: "Failed to create training type",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTrainingType = async (id: string, updates: Partial<TrainingType>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('training_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Training type updated successfully"
      });

      return data;
    } catch (error) {
      console.error('Error updating training type:', error);
      toast({
        title: "Error",
        description: "Failed to update training type",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteTrainingType = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('training_types')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Training type deactivated successfully"
      });
    } catch (error) {
      console.error('Error deactivating training type:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate training type",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createTrainingType,
    updateTrainingType,
    deleteTrainingType
  };
}

// Admin hook for managing custom specialty requests
export function useCustomSpecialtyRequestAdmin() {
  const [loading, setLoading] = useState(false);

  const reviewRequest = async (
    id: string, 
    status: 'approved' | 'rejected', 
    adminNotes?: string,
    promoteToSpecialty?: boolean,
    categoryId?: string
  ) => {
    setLoading(true);
    try {
      // Update request status
      const { data: request, error: updateError } = await supabase
        .from('custom_specialty_requests')
        .update({
          status,
          admin_notes: adminNotes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // If approved and should be promoted to specialty, create the specialty
      if (status === 'approved' && promoteToSpecialty) {
        const { error: specialtyError } = await supabase
          .from('specialties')
          .insert([{
            name: request.requested_name,
            category_id: categoryId || request.category_id,
            description: request.description,
            display_order: 999 // Will be reordered by admin later
          }]);

        if (specialtyError) throw specialtyError;
      }

      toast({
        title: "Success",
        description: `Request ${status} successfully${promoteToSpecialty ? ' and added as specialty' : ''}`
      });

      return request;
    } catch (error) {
      console.error('Error reviewing request:', error);
      toast({
        title: "Error",
        description: "Failed to review request",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    reviewRequest
  };
}