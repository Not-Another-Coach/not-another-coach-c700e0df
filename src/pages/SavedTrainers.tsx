import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SavedTrainers() {
  const navigate = useNavigate();

  // Redirect to client dashboard saved tab
  useEffect(() => {
    navigate('/client/dashboard');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}