import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useClientProfile } from '@/hooks/useClientProfile';

interface ClientProfileContextType {
  profile: any;
  loading: boolean;
  updateProfile: (updates: any) => Promise<any>;
  refetchProfile: () => Promise<void>;
}

const ClientProfileContext = createContext<ClientProfileContextType | undefined>(undefined);

export const ClientProfileProvider = ({ children }: { children: ReactNode }) => {
  const { profile, loading, updateProfile, refetchProfile } = useClientProfile();

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
    <ClientProfileContext.Provider value={value}>
      {children}
    </ClientProfileContext.Provider>
  );
};

export const useClientProfileContext = () => {
  const context = useContext(ClientProfileContext);
  if (context === undefined) {
    throw new Error('useClientProfileContext must be used within a ClientProfileProvider');
  }
  return context;
};
