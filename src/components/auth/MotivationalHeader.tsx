import React from 'react';

interface MotivationalHeaderProps {
  context: 'login' | 'signup' | 'trainer-signup' | 'forgot' | 'reset';
  userType?: 'client' | 'trainer';
  userName?: string;
  onTaglineClick?: () => void;
}

export const MotivationalHeader: React.FC<MotivationalHeaderProps> = ({ context, userType, userName, onTaglineClick }) => {
  const getHeadline = () => {
    switch (context) {
      case 'login':
        return userName ? `Welcome back, ${userName}` : "Welcome back";
      case 'signup':
        if (userType === 'trainer') {
          return "Your transformation starts here";
        } else if (userType === 'client') {
          return "Ready to transform your fitness?";
        }
        return null;
      case 'trainer-signup':
        return "Join our coaching community";
      case 'forgot':
        return "Let's get you back on track";
      case 'reset':
        return "Create your new beginning";
      default:
        return null;
    }
  };

  const getSubtext = () => {
    switch (context) {
      case 'login':
        return null;
      case 'signup':
        if (userType === 'trainer') {
          return "Find your perfect trainer match";
        } else if (userType === 'client') {
          return "Connect with coaches who understand your journey";
        }
        return null;
      case 'trainer-signup':
        return "Help others achieve their fitness goals";
      case 'forgot':
        return "We'll help you reset your password";
      case 'reset':
        return "Choose a strong password to secure your account";
      default:
        return null;
    }
  };

  const getTagline = () => {
    return "Not another app. Not another coach. This is personal.";
  };

  const headline = getHeadline();
  const subtext = getSubtext();

  return (
    <div className="text-center mb-8">
      {/* Main Tagline - Hero Style */}
      <h1 
        className={`text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2 ${
          onTaglineClick ? 'cursor-pointer hover:opacity-75 transition-opacity' : ''
        }`}
        onClick={onTaglineClick}
      >
        {getTagline()}
      </h1>
      
      {/* Context Headline */}
      {headline && (
        <h2 className="text-xl font-semibold text-card-foreground mb-2">
          {headline}
        </h2>
      )}
      
      {/* Supporting Subtext */}
      {subtext && (
        <p className="text-sm text-muted-foreground">
          {subtext}
        </p>
      )}
    </div>
  );
};