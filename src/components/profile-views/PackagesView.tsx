import React, { useState, useEffect } from 'react';
import { AnyTrainer } from '@/types/trainer';
import { PackageComparisonSection } from './PackageComparisonSection';
import { useContentVisibility } from '@/hooks/useContentVisibility';
import { useEngagementStage } from '@/hooks/useEngagementStage';
import { useAuth } from '@/hooks/useAuth';
import { PackageWaysOfWorking } from '@/hooks/usePackageWaysOfWorking';
import { supabase } from '@/integrations/supabase/client';

interface PackagesViewProps {
  trainer: AnyTrainer;
}

export const PackagesView = ({ trainer }: PackagesViewProps) => {
  const { user } = useAuth();
  const { stage: engagementStage, isGuest } = useEngagementStage(trainer.id, !user);
  const { getVisibility } = useContentVisibility({
    engagementStage: engagementStage || 'browsing',
    isGuest
  });
  
  const [packageWorkflows, setPackageWorkflows] = useState<PackageWaysOfWorking[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchWorkflows = async () => {
      if (!trainer.id) return;
      
      try {
        const { data, error } = await supabase
          .from('package_ways_of_working')
          .select('*')
          .eq('trainer_id', trainer.id);
        
        if (error) throw error;
        
        // Filter by package IDs that exist in trainer's packages
        const trainerPackages = (trainer as any).packages || [];
        const trainerPackageIds = trainerPackages.map((p: any) => p.id) || [];
        const filtered = (data || []).filter(w => 
          trainerPackageIds.includes(w.package_id)
        );
        
        setPackageWorkflows(filtered as any);
      } catch (error) {
        console.error('Error fetching package workflows:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkflows();
  }, [trainer.id]);
  
  const packageWaysOfWorkingVisible = getVisibility('package_ways_of_working') === 'visible';
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Training Packages</h2>
        <p className="text-muted-foreground">
          Choose the package that best fits your goals and training needs
        </p>
      </div>
      
      <PackageComparisonSection
        packages={(trainer as any).packages || []}
        packageWorkflows={packageWaysOfWorkingVisible ? packageWorkflows : undefined}
      />
    </div>
  );
};
