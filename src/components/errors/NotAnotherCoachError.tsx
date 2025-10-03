/**
 * Not Another Coach - Branded Error/Fallback Component
 * 
 * Displays branded error screens for 404, 500, 403, and offline scenarios
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

type ErrorCode = '404' | '500' | '403' | 'offline';

interface NotAnotherCoachErrorProps {
  code?: ErrorCode;
  homeHref?: string;
  loginHref?: string;
  supportHref?: string;
  onRetry?: () => void;
  className?: string;
}

// Error variants configuration
const ERROR_VARIANTS = {
  '404': {
    headline: "Looks like this play isn't in the playbook.",
    body: "The page you're after doesn't exist. Let's get you back where you belong.",
    primaryAction: 'home',
    secondaryAction: 'support',
    icon: 'whistle',
  },
  '500': {
    headline: "Coach is calling a timeout.",
    body: "Something went wrong on our side. We'll regroup and be back stronger.",
    primaryAction: 'retry',
    secondaryAction: 'home',
    icon: 'stopwatch',
  },
  '403': {
    headline: "Not in the squad (yet).",
    body: "You don't have permission to view this page. You may need to sign in or request access.",
    primaryAction: 'login',
    secondaryAction: 'support',
    icon: 'lock',
  },
  'offline': {
    headline: "We've dropped the connection, not the ball.",
    body: "Your page didn't load properly. Refresh when you're back online and we'll get you moving.",
    primaryAction: 'retry',
    secondaryAction: 'home',
    icon: 'wifi',
  },
} as const;

// Inline SVG icons
const Icons = {
  whistle: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M32 8C18.745 8 8 18.745 8 32s10.745 24 24 24 24-10.745 24-24S45.255 8 32 8zm0 4c11.046 0 20 8.954 20 20s-8.954 20-20 20-20-8.954-20-20S20.954 12 32 12z" fill="currentColor" opacity="0.2"/>
      <circle cx="32" cy="32" r="8" fill="currentColor"/>
      <path d="M32 20v8M32 36v8M20 32h8M36 32h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  stopwatch: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="32" cy="36" r="20" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.2"/>
      <circle cx="32" cy="36" r="16" fill="currentColor" opacity="0.1"/>
      <path d="M32 36V24M28 8h8M32 12V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="32" cy="36" r="2" fill="currentColor"/>
    </svg>
  ),
  lock: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="16" y="28" width="32" height="24" rx="4" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.2"/>
      <rect x="20" y="32" width="24" height="16" rx="2" fill="currentColor" opacity="0.1"/>
      <path d="M22 28V20a10 10 0 0 1 20 0v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="32" cy="40" r="3" fill="currentColor"/>
    </svg>
  ),
  wifi: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M8 24c13.255-10 34.745-10 48 0M16 32c8.837-6 22.163-6 32 0M24 40c4.418-3 11.582-3 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.2"/>
      <circle cx="32" cy="48" r="3" fill="currentColor"/>
      <path d="M20 40l4 4M44 40l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
};

export function NotAnotherCoachError({
  code = '404',
  homeHref = '/',
  loginHref,
  supportHref,
  onRetry,
  className = '',
}: NotAnotherCoachErrorProps) {
  const navigate = useNavigate();
  const variant = ERROR_VARIANTS[code];
  const icon = Icons[variant.icon];

  // Analytics tracking
  useEffect(() => {
    const track = (name: string, props: Record<string, any>) => {
      if (typeof window !== 'undefined' && (window as any).analytics?.track) {
        (window as any).analytics.track(name, props);
      }
    };

    track('error_page_view', {
      code,
      path: window.location.pathname,
      referrer: document.referrer,
    });
  }, [code]);

  const handlePrimaryClick = () => {
    const track = (name: string, props: Record<string, any>) => {
      if (typeof window !== 'undefined' && (window as any).analytics?.track) {
        (window as any).analytics.track(name, props);
      }
    };

    track('error_primary_click', { code, action: variant.primaryAction });

    switch (variant.primaryAction) {
      case 'home':
        navigate(homeHref);
        break;
      case 'retry':
        if (onRetry) {
          onRetry();
        } else {
          window.location.reload();
        }
        break;
      case 'login':
        if (loginHref) {
          navigate(loginHref);
        } else {
          navigate(homeHref);
        }
        break;
    }
  };

  const handleSecondaryClick = () => {
    const track = (name: string, props: Record<string, any>) => {
      if (typeof window !== 'undefined' && (window as any).analytics?.track) {
        (window as any).analytics.track(name, props);
      }
    };

    track('error_secondary_click', { code, action: variant.secondaryAction });

    switch (variant.secondaryAction) {
      case 'home':
        navigate(homeHref);
        break;
      case 'support':
        if (supportHref) {
          navigate(supportHref);
        } else {
          navigate(homeHref);
        }
        break;
    }
  };

  const getPrimaryButtonText = () => {
    switch (variant.primaryAction) {
      case 'home': return 'Return Home';
      case 'retry': return 'Try Again';
      case 'login': return 'Log In';
      default: return 'Return Home';
    }
  };

  const getSecondaryButtonText = () => {
    switch (variant.secondaryAction) {
      case 'home': return 'Back Home';
      case 'support': return 'Contact Support';
      default: return 'Back Home';
    }
  };

  return (
    <main 
      role="main" 
      aria-labelledby="error-title"
      className={`min-h-screen flex items-center justify-center p-4 bg-background ${className}`}
    >
      <div className="w-full max-w-2xl">
        <div className="bg-card rounded-3xl border border-border shadow-lg p-8 md:p-12 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6 text-accent">
            {icon}
          </div>

          {/* Headline */}
          <h1 
            id="error-title"
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            {variant.headline}
          </h1>

          {/* Body text */}
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            {variant.body}
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={handlePrimaryClick}
              className="w-full sm:w-auto min-w-[160px]"
            >
              {getPrimaryButtonText()}
            </Button>

            {(variant.secondaryAction === 'support' && supportHref) || variant.secondaryAction === 'home' ? (
              <Button
                size="lg"
                variant="outline"
                onClick={handleSecondaryClick}
                className="w-full sm:w-auto min-w-[160px]"
              >
                {getSecondaryButtonText()}
              </Button>
            ) : null}
          </div>

          {/* Safety link - only show if no home button exists */}
          {variant.primaryAction !== 'home' && variant.secondaryAction !== 'home' && (
            <a
              href={homeHref}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline mt-6 block"
              onClick={(e) => {
                e.preventDefault();
                navigate(homeHref);
              }}
            >
              Go to Home
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
