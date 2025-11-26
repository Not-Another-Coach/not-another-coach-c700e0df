/**
 * @deprecated This context has been replaced by UserProfileContext
 * This file now re-exports from the unified provider for backwards compatibility
 * Please update imports to use UserProfileContext directly
 */

export { 
  UserProfileProvider as ClientProfileProvider,
  useClientProfileContext 
} from './UserProfileContext';
