import { supabase } from '@/integrations/supabase/client';
import { ContentType, EngagementStageGroup, VisibilityState } from '@/hooks/useVisibilityMatrix';

export interface SystemVisibilityConfig {
  contentType: ContentType;
  stageGroup: EngagementStageGroup;
  visibilityState: VisibilityState;
}

class VisibilityConfigServiceClass {
  private cache: Map<string, VisibilityState> = new Map();
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes in dev, will be 1hr in prod

  private getCacheKey(contentType: ContentType, stageGroup: EngagementStageGroup): string {
    return `${contentType}_${stageGroup}`;
  }

  private isCacheValid(): boolean {
    return Date.now() - this.cacheTimestamp < this.CACHE_TTL;
  }

  async getSystemDefaults(): Promise<Map<string, VisibilityState>> {
    if (this.isCacheValid() && this.cache.size > 0) {
      return this.cache;
    }

    try {
      const { data, error } = await supabase.rpc('get_system_default_visibility');
      
      if (error) {
        console.error('Error fetching system defaults:', error);
        return this.cache; // Return existing cache on error
      }

      // Clear and rebuild cache
      this.cache.clear();
      
      if (Array.isArray(data)) {
        data.forEach((item: any) => {
          const key = this.getCacheKey(item.content_type, item.stage_group);
          this.cache.set(key, item.visibility_state);
        });
      }
      
      this.cacheTimestamp = Date.now();
      return this.cache;
    } catch (error) {
      console.error('Error loading system visibility defaults:', error);
      return this.cache;
    }
  }

  async getDefaultVisibility(contentType: ContentType, stageGroup: EngagementStageGroup): Promise<VisibilityState> {
    const cache = await this.getSystemDefaults();
    const key = this.getCacheKey(contentType, stageGroup);
    return cache.get(key) || 'hidden'; // Safe default
  }

  invalidateCache(): void {
    this.cache.clear();
    this.cacheTimestamp = 0;
  }

  // For admin to push changes immediately in dev/testing
  async refreshCache(): Promise<void> {
    this.invalidateCache();
    await this.getSystemDefaults();
  }
}

export const VisibilityConfigService = new VisibilityConfigServiceClass();