import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function EncodedUrlHandler({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const pathname = location.pathname;
    
    // Check for encoded query separators in pathname (%3F = ?, %26 = &, %3D = =)
    const hasEncodedChars = 
      pathname.includes('%3F') || pathname.includes('%3f') || 
      pathname.includes('%26') || pathname.includes('%3D') || pathname.includes('%3d');
    
    if (hasEncodedChars) {
      const decoded = decodeURIComponent(pathname);
      
      // If decoded pathname contains '?', split into path and search
      if (decoded.includes('?')) {
        const [path, search] = decoded.split('?');
        console.log('EncodedUrlHandler: Fixing malformed URL', pathname, '→', `${path}?${search}`);
        navigate(`${path}?${search}`, { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  return <>{children}</>;
}
