import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useTrainerProfile } from '@/hooks/useTrainerProfile';

interface TrainerProfileContextType {
  profile: any;
  loading: boolean;
  updateProfile: (updates: any) => Promise<any>;
  refetchProfile: () => Promise<void>;
}

const TrainerProfileContext = createContext<TrainerProfileContextType | undefined>(undefined);

export const TrainerProfileProvider = ({ children }: { children: ReactNode }) => {
  const { profile, loading, updateProfile, refetchProfile } = useTrainerProfile();

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      profile,
      loading,
      updateProfile,
      refetchProfile,
    }),
    [profile, loading, updateProfile, refetchProfile]
  );

  return (
    <TrainerProfileContext.Provider value={value}>
      {children}
    </TrainerProfileContext.Provider>
  );
};

export const useTrainerProfileContext = () => {
  const context = useContext(TrainerProfileContext);
  if (context === undefined) {
    throw new Error('useTrainerProfileContext must be used within a TrainerProfileProvider');
  }
  return context;
};
