import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Search, Calendar, Package, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSavedTrainers } from '@/hooks/useSavedTrainers';
import { useConversations } from '@/hooks/useConversations';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface MetricsData {
  savedTrainers: number;
  discoveryViewedToday: number;
  nextCall: {
    date: string | null;
    trainerName: string | null;
  };
  activePackages: number;
}

interface MetricsSnapshotProps {
  onTabChange: (tab: string) => void;
}

export function MetricsSnapshot({ onTabChange }: MetricsSnapshotProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { savedTrainers } = useSavedTrainers();
  const { conversations } = useConversations();
  const [metrics, setMetrics] = useState<MetricsData>({
    savedTrainers: 0,
    discoveryViewedToday: 0,
    nextCall: { date: null, trainerName: null },
    activePackages: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, [user, savedTrainers]);

  const loadMetrics = async () => {
    if (!user) return;

    try {
      // Get discovery calls data
      const { data: discoveryCalls } = await supabase
        .from('discovery_calls')
        .select(`
          id,
          scheduled_for,
          status,
          profiles!discovery_calls_trainer_id_fkey(first_name, last_name)
        `)
        .eq('client_id', user.id)
        .eq('status', 'scheduled')
        .order('scheduled_for', { ascending: true })
        .limit(1);

      // For MVP: Set mock values for discovery views and packages
      // In production, these would come from actual tracking tables
      const today = new Date().toISOString().split('T')[0];
      
      setMetrics({
        savedTrainers: savedTrainers.length,
        discoveryViewedToday: Math.floor(Math.random() * 15) + 5, // Mock data
        nextCall: {
          date: discoveryCalls?.[0]?.scheduled_for || null,
          trainerName: discoveryCalls?.[0]?.profiles ? 
            `${discoveryCalls[0].profiles.first_name} ${discoveryCalls[0].profiles.last_name}` : null
        },
        activePackages: 0 // Mock data for now
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToMyTrainers = (filter: 'all' | 'saved' | 'shortlisted' | 'discovery') => {
    onTabChange('my-trainers');
    setTimeout(() => {
      const event = new CustomEvent('setMyTrainersFilter', { 
        detail: { filter } 
      });
      window.dispatchEvent(event);
      window.dispatchEvent(new CustomEvent('refreshMyTrainersData'));
    }, 100);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">My Snapshot</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">My Snapshot</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Saved Trainers */}
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200"
          onClick={() => navigateToMyTrainers('saved')}
        >
          <CardContent className="p-3 flex flex-col items-center text-center">
            <div className="p-2 rounded-full bg-primary-500/10 mb-2">
              <Heart className="h-4 w-4 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-primary-700 font-medium mb-1">Saved</p>
              <p className="text-xl font-bold text-primary-800">{metrics.savedTrainers}</p>
            </div>
          </CardContent>
        </Card>

        {/* Discovery Viewed Today */}
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-secondary-50 to-secondary-100 border-secondary-200"
          onClick={() => onTabChange('explore')}
        >
          <CardContent className="p-3 flex flex-col items-center text-center">
            <div className="p-2 rounded-full bg-secondary-500/10 mb-2">
              <Search className="h-4 w-4 text-secondary-600" />
            </div>
            <div>
              <p className="text-xs text-secondary-700 font-medium mb-1">Viewed</p>
              <p className="text-xl font-bold text-secondary-800">{metrics.discoveryViewedToday}</p>
              <p className="text-xs text-secondary-600">today</p>
            </div>
          </CardContent>
        </Card>

        {/* Calls Booked */}
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-accent-50 to-accent-100 border-accent-200"
          onClick={() => navigateToMyTrainers('discovery')}
        >
          <CardContent className="p-3 flex flex-col items-center text-center">
            <div className="p-2 rounded-full bg-accent-500/10 mb-2">
              <Calendar className="h-4 w-4 text-accent-600" />
            </div>
            <div>
              <p className="text-xs text-accent-700 font-medium mb-1">Calls</p>
              {metrics.nextCall.date ? (
                <>
                  <p className="text-sm font-bold text-accent-800">
                    {format(new Date(metrics.nextCall.date), 'EEE')}
                  </p>
                  <p className="text-xs text-accent-600 truncate">
                    {format(new Date(metrics.nextCall.date), 'h:mm a')}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xl font-bold text-accent-800">0</p>
                  <p className="text-xs text-accent-600">upcoming</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Packages Active */}
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-success-50 to-success-100 border-success-200"
          onClick={() => onTabChange('payments')}
        >
          <CardContent className="p-3 flex flex-col items-center text-center">
            <div className="p-2 rounded-full bg-success-500/10 mb-2">
              <Package className="h-4 w-4 text-success-600" />
            </div>
            <div>
              <p className="text-xs text-success-700 font-medium mb-1">Packages</p>
              <p className="text-xl font-bold text-success-800">{metrics.activePackages}</p>
              <p className="text-xs text-success-600">active</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}