/**
 * Centralized React Query configuration for consistent caching behavior
 * across the application
 */
export const queryConfig = {
  user: {
    staleTime: 5 * 60 * 1000,    // 5 min - profile data is stable
    gcTime: 10 * 60 * 1000,       // Keep in cache for 10 minutes
  },
  verification: {
    staleTime: 2 * 60 * 1000,    // 2 min - may update during session
    gcTime: 5 * 60 * 1000,
  },
  availability: {
    staleTime: 5 * 60 * 1000,    // 5 min - stable unless editing
    gcTime: 10 * 60 * 1000,
  },
  lists: {
    staleTime: 1 * 60 * 1000,    // 1 min - lists may change more often
    gcTime: 5 * 60 * 1000,
  },
};

/**
 * Standard query key patterns:
 * - ['user-profile', userId]
 * - ['trainer-verification', trainerId]
 * - ['coach-availability', coachId]
 * - ['waitlist-entries', coachId]
 */
