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
        
        // Align workflows to trainer's packages by id or by name (fallback)
        const trainerPackages = (trainer as any).package_options || (trainer as any).packages || [];
        const trainerPackageIds: string[] = trainerPackages.map((p: any) => String(p.id));
        const nameToId = new Map<string, string>(
          trainerPackages.map((p: any) => [String(p.name).trim().toLowerCase(), String(p.id)])
        );

        const normalized = (str?: string | null) => String(str ?? '').trim().toLowerCase();

        const adjusted = (data || []).map((w: any) => {
          const wId = String(w.package_id);
          if (!trainerPackageIds.includes(wId)) {
            const mappedId = nameToId.get(normalized(w.package_name));
            if (mappedId) {
              return { ...w, package_id: mappedId };
            }
          }
          return w;
        });

        const filtered = adjusted.filter((w: any) => trainerPackageIds.includes(String(w.package_id)));
        
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
  
  const trainerPackages = (trainer as any).package_options || (trainer as any).packages || [];
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Training Packages</h2>
        <p className="text-muted-foreground">
          Choose the package that best fits your goals and training needs
        </p>
      </div>
      
      {trainerPackages.length > 0 ? (
        <PackageComparisonSection
          packages={trainerPackages}
          packageWorkflows={packageWaysOfWorkingVisible ? packageWorkflows : undefined}
        />
      ) : (
        <div className="text-center py-12 px-4">
          <p className="text-muted-foreground mb-2">
            No training packages have been set up yet.
          </p>
          <p className="text-sm text-muted-foreground">
            Check back later or contact the trainer for package details.
          </p>
        </div>
      )}
    </div>
  );
};
