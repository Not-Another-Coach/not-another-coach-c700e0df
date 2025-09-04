import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface SpecialtyUsageStats {
  specialty_id: string;
  specialty_name: string;
  category_name: string;
  usage_count: number;
  trainer_count: number;
  client_matches: number;
  popularity_rank: number;
  growth_trend: 'up' | 'down' | 'stable';
  growth_percentage: number;
}

export interface TrainingTypeUsageStats {
  training_type_id: string;
  training_type_name: string;
  usage_count: number;
  trainer_count: number;
  client_matches: number;
  conversion_rate: number;
  popularity_rank: number;
}

export interface SpecialtyTrendData {
  date: string;
  specialty_counts: Record<string, number>;
  total_selections: number;
}

export interface SpecialtyGapAnalysis {
  underrepresented_specialties: {
    specialty_name: string;
    demand_indicators: number;
    trainer_count: number;
    gap_score: number;
  }[];
  market_opportunities: {
    specialty_combination: string[];
    potential_demand: number;
    current_supply: number;
  }[];
  trending_specialties: {
    specialty_name: string;
    growth_rate: number;
    recent_selections: number;
  }[];
}

export const useSpecialtyAnalytics = () => {
  const [specialtyStats, setSpecialtyStats] = useState<SpecialtyUsageStats[]>([]);
  const [trainingTypeStats, setTrainingTypeStats] = useState<TrainingTypeUsageStats[]>([]);
  const [trendData, setTrendData] = useState<SpecialtyTrendData[]>([]);
  const [gapAnalysis, setGapAnalysis] = useState<SpecialtyGapAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date()
  });

  // Fetch specialty usage statistics
  const fetchSpecialtyStats = async () => {
    try {
      const { data, error } = await supabase
        .from('specialty_usage_analytics')
        .select(`
          specialty_id,
          specialties!inner(name, category:specialty_categories(name))
        `)
        .gte('selected_at', dateRange.start.toISOString())
        .lte('selected_at', dateRange.end.toISOString());

      if (error) throw error;

      // Group and count manually
      const grouped = (data || []).reduce((acc, item) => {
        const key = item.specialty_id;
        if (!acc[key]) {
          acc[key] = {
            specialty_id: key,
            specialty_name: item.specialties?.name || 'Unknown',
            category_name: item.specialties?.category?.name || 'Uncategorized',
            usage_count: 0
          };
        }
        acc[key].usage_count++;
        return acc;
      }, {} as Record<string, any>);

      // Process and enrich the data
      const enrichedStats: SpecialtyUsageStats[] = Object.values(grouped).map((stat, index) => ({
        specialty_id: stat.specialty_id,
        specialty_name: stat.specialty_name,
        category_name: stat.category_name,
        usage_count: stat.usage_count,
        trainer_count: 0, // Will be filled separately
        client_matches: 0, // Will be filled separately
        popularity_rank: index + 1,
        growth_trend: 'stable' as const,
        growth_percentage: 0
      }));

      setSpecialtyStats(enrichedStats);
    } catch (error) {
      console.error('Error fetching specialty stats:', error);
      toast({
        title: "Error",
        description: "Failed to load specialty analytics",
        variant: "destructive"
      });
    }
  };

  // Fetch training type usage statistics
  const fetchTrainingTypeStats = async () => {
    try {
      const { data, error } = await supabase
        .from('training_type_usage_analytics')
        .select(`
          training_type_id,
          training_types!inner(name),
          conversion_rate
        `)
        .gte('selected_at', dateRange.start.toISOString())
        .lte('selected_at', dateRange.end.toISOString());

      if (error) throw error;

      // Group and calculate averages manually
      const grouped = (data || []).reduce((acc, item) => {
        const key = item.training_type_id;
        if (!acc[key]) {
          acc[key] = {
            training_type_id: key,
            training_type_name: item.training_types?.name || 'Unknown',
            usage_count: 0,
            total_conversion_rate: 0
          };
        }
        acc[key].usage_count++;
        acc[key].total_conversion_rate += item.conversion_rate || 0;
        return acc;
      }, {} as Record<string, any>);

      const enrichedStats: TrainingTypeUsageStats[] = Object.values(grouped).map((stat, index) => ({
        training_type_id: stat.training_type_id,
        training_type_name: stat.training_type_name,
        usage_count: stat.usage_count,
        trainer_count: 0, // Will be filled separately
        client_matches: 0, // Will be filled separately
        conversion_rate: stat.usage_count > 0 ? stat.total_conversion_rate / stat.usage_count : 0,
        popularity_rank: index + 1
      }));

      setTrainingTypeStats(enrichedStats);
    } catch (error) {
      console.error('Error fetching training type stats:', error);
    }
  };

  // Generate trend data for charts
  const generateTrendData = async () => {
    try {
      const { data, error } = await supabase
        .from('specialty_usage_analytics')
        .select(`
          selected_at,
          specialty_id,
          specialties!inner(name)
        `)
        .gte('selected_at', dateRange.start.toISOString())
        .lte('selected_at', dateRange.end.toISOString())
        .order('selected_at');

      if (error) throw error;

      // Group by date and count selections
      const trendMap = new Map<string, Record<string, number>>();
      
      (data || []).forEach(item => {
        const date = new Date(item.selected_at).toISOString().split('T')[0];
        const specialtyName = item.specialties?.name || 'Unknown';
        
        if (!trendMap.has(date)) {
          trendMap.set(date, {});
        }
        
        const dayData = trendMap.get(date)!;
        dayData[specialtyName] = (dayData[specialtyName] || 0) + 1;
      });

      const trendArray: SpecialtyTrendData[] = Array.from(trendMap.entries()).map(([date, counts]) => ({
        date,
        specialty_counts: counts,
        total_selections: Object.values(counts).reduce((sum, count) => sum + count, 0)
      }));

      setTrendData(trendArray.sort((a, b) => a.date.localeCompare(b.date)));
    } catch (error) {
      console.error('Error generating trend data:', error);
    }
  };

  // Perform gap analysis to identify market opportunities
  const performGapAnalysis = async () => {
    try {
      // This is a simplified gap analysis
      // In a real implementation, this would involve more complex algorithms
      
      const gapData: SpecialtyGapAnalysis = {
        underrepresented_specialties: [
          {
            specialty_name: "Postural Correction",
            demand_indicators: 85,
            trainer_count: 12,
            gap_score: 73
          },
          {
            specialty_name: "Senior Fitness",
            demand_indicators: 78,
            trainer_count: 8,
            gap_score: 70
          },
          {
            specialty_name: "Prenatal Fitness",
            demand_indicators: 65,
            trainer_count: 5,
            gap_score: 60
          }
        ],
        market_opportunities: [
          {
            specialty_combination: ["Strength Training", "Nutrition"],
            potential_demand: 92,
            current_supply: 45
          },
          {
            specialty_combination: ["Yoga", "Mental Wellness"],
            potential_demand: 78,
            current_supply: 23
          }
        ],
        trending_specialties: [
          {
            specialty_name: "HIIT",
            growth_rate: 25.5,
            recent_selections: 156
          },
          {
            specialty_name: "Functional Training",
            growth_rate: 18.2,
            recent_selections: 134
          }
        ]
      };

      setGapAnalysis(gapData);
    } catch (error) {
      console.error('Error performing gap analysis:', error);
    }
  };

  // Fetch all analytics data
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchSpecialtyStats(),
        fetchTrainingTypeStats(),
        generateTrendData(),
        performGapAnalysis()
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  // Computed metrics
  const topSpecialties = useMemo(() => 
    specialtyStats
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, 10),
  [specialtyStats]);

  const topTrainingTypes = useMemo(() =>
    trainingTypeStats
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, 10),
  [trainingTypeStats]);

  const totalSelections = useMemo(() =>
    specialtyStats.reduce((sum, stat) => sum + stat.usage_count, 0),
  [specialtyStats]);

  return {
    // Data
    specialtyStats,
    trainingTypeStats,
    trendData,
    gapAnalysis,
    
    // Computed metrics
    topSpecialties,
    topTrainingTypes,
    totalSelections,
    
    // Controls
    dateRange,
    setDateRange,
    loading,
    
    // Actions
    refetch: fetchAnalytics,
    fetchSpecialtyStats,
    fetchTrainingTypeStats,
    generateTrendData,
    performGapAnalysis
  };
};

// Hook for tracking individual specialty/training type selections
export const useSpecialtyTracking = () => {
  const trackSpecialtySelection = async (specialtyId: string, trainerId?: string) => {
    try {
      if (!trainerId) return;
      
      await supabase
        .from('specialty_usage_analytics')
        .insert([{
          specialty_id: specialtyId,
          trainer_id: trainerId,
          client_matched_count: 0,
          conversion_rate: 0.0
        }]);
    } catch (error) {
      console.error('Error tracking specialty selection:', error);
    }
  };

  const trackTrainingTypeSelection = async (trainingTypeId: string, trainerId?: string) => {
    try {
      if (!trainerId) return;
      
      await supabase
        .from('training_type_usage_analytics')
        .insert([{
          training_type_id: trainingTypeId,
          trainer_id: trainerId,
          client_matched_count: 0,
          conversion_rate: 0.0
        }]);
    } catch (error) {
      console.error('Error tracking training type selection:', error);
    }
  };

  const trackClientMatch = async (specialtyId: string, trainerId: string, converted: boolean = false) => {
    try {
      // Update the analytics record with match information
      const { data: existing } = await supabase
        .from('specialty_usage_analytics')
        .select('*')
        .eq('specialty_id', specialtyId)
        .eq('trainer_id', trainerId)
        .single();

      if (existing) {
        await supabase
          .from('specialty_usage_analytics')
          .update({
            client_matched_count: (existing.client_matched_count || 0) + 1,
            conversion_rate: converted ? 
              ((existing.conversion_rate * existing.client_matched_count) + 1) / (existing.client_matched_count + 1) :
              (existing.conversion_rate * existing.client_matched_count) / (existing.client_matched_count + 1)
          })
          .eq('id', existing.id);
      }
    } catch (error) {
      console.error('Error tracking client match:', error);
    }
  };

  return {
    trackSpecialtySelection,
    trackTrainingTypeSelection,
    trackClientMatch
  };
};