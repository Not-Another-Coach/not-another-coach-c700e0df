import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { AuthService } from '@/services';

export const useTrainer4FixStatus = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fixTrainer4Status = useCallback(async () => {
    setLoading(true);
    try {
      // Use the actual UUID for Trainer4 
      const trainerId = '1051dd7c-ee79-48fd-b287-2cbe7483f9f7';

      // First check if trainer has approved publication request
      const { data: publicationData, error: publicationError } = await supabase
        .from('profile_publication_requests')
        .select('*')
        .eq('trainer_id', trainerId)
        .eq('status', 'approved')
        .single();

      let hasPublicationRequest = !!publicationData;

      // If no approved publication request, create one as admin
      if (!hasPublicationRequest) {
        const userResponse = await AuthService.getCurrentUser();
        
        // Create publication request
        const { error: requestError } = await supabase
          .from('profile_publication_requests')
          .insert({
            trainer_id: trainerId,
            status: 'approved',
            reviewed_by: userResponse.data?.id,
            reviewed_at: new Date().toISOString(),
            admin_notes: 'Auto-approved for trainer with completed verification'
          });

        if (requestError) throw requestError;
        hasPublicationRequest = true;
      }

      // Now check verification status and trigger auto-publication if needed
      const { data: verificationOverview } = await supabase
        .from('trainer_verification_overview')
        .select('overall_status, display_preference')
        .eq('trainer_id', trainerId)
        .single();

      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_published, verification_status')
        .eq('id', trainerId)
        .single();

      if (verificationOverview?.overall_status === 'verified' && hasPublicationRequest && !profile?.profile_published) {
        // Auto-publish the profile
        const { error: publishError } = await supabase
          .from('profiles')
          .update({ profile_published: true })
          .eq('id', trainerId);

        if (publishError) throw publishError;

        // Create success notification
        await supabase.from('alerts').insert({
          alert_type: 'profile_auto_published',
          title: 'Profile Published!',
          content: 'Your verification is complete and your trainer profile is now published and visible to clients!',
          target_audience: { trainers: [trainerId] },
          metadata: {
            trainer_id: trainerId,
            published_at: new Date().toISOString(),
            auto_published_on_verification: true,
            fixed_by_admin: true
          },
          is_active: true
        });

        toast({
          title: "Profile Published",
          description: `Trainer ${trainerId} profile has been published successfully.`
        });
      } else {
        toast({
          title: "Status Check Complete", 
          description: `Trainer ${trainerId} status: Published: ${profile?.profile_published}, Verified: ${verificationOverview?.overall_status}`
        });
      }

      return {
        published: profile?.profile_published,
        verified: verificationOverview?.overall_status,
        hasPublicationRequest
      };
    } catch (error: any) {
      console.error('Error fixing trainer status:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to fix trainer status',
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    fixTrainer4Status,
    loading
  };
};