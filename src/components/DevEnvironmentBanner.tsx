import { useState } from 'react';
import { X } from 'lucide-react';

const DEV_SUPABASE_PROJECT_ID = 'zkzahqnsfjnvskfywbvg';

export const DevEnvironmentBanner = () => {
  const [isDismissed, setIsDismissed] = useState(() => {
    return sessionStorage.getItem('dev-banner-dismissed') === 'true';
  });

  const isDev = import.meta.env.VITE_SUPABASE_PROJECT_ID === DEV_SUPABASE_PROJECT_ID;

  if (!isDev || isDismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem('dev-banner-dismissed', 'true');
    setIsDismissed(true);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-amber-950 text-center py-1.5 text-sm font-medium flex items-center justify-center gap-2">
      <span>🚧 Development Environment - Dev Database</span>
      <button
        onClick={handleDismiss}
        className="absolute right-2 p-0.5 hover:bg-amber-600 rounded transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
