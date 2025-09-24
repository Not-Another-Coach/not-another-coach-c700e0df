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
    
    const cachedValue = cache.get(key);
    if (cachedValue) return cachedValue;
    
    // For gallery_images, default to visible for browsing scenarios (but hidden for guests)
    if (contentType === 'gallery_images' && ['browsing', 'liked', 'shortlisted'].includes(stageGroup)) {
      console.log('VisibilityConfigService: Using visible default for gallery_images', { contentType, stageGroup });
      return 'visible';
    }
    
    // Default visible content types (not admin-editable, always visible)
    if (['stats_ratings'].includes(contentType)) {
      return 'visible';
    }

    // Content that should be visible by default for better UX
    if (['description_bio', 'specializations', 'certifications_qualifications', 'professional_journey', 'professional_milestones'].includes(contentType)) {
      return 'visible';
    }
    
    // For guest users, provide appropriate defaults
    if (stageGroup === 'guest') {
      if (['profile_image', 'basic_information'].includes(contentType)) {
        return 'visible';
      }
      if (contentType === 'pricing_discovery_call') {
        return 'blurred';
      }
      // Gallery images and testimonials can be visible for guests if admin sets them
      if (['gallery_images', 'testimonial_images'].includes(contentType)) {
        return 'visible'; // Let admin override this in DB
      }
      return 'hidden';
    }
    
    return 'hidden'; // Safe default for other cases
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