import React from 'react';

interface MotivationalHeaderProps {
  context: 'login' | 'signup' | 'trainer-signup' | 'forgot' | 'reset';
  userType?: 'client' | 'trainer';
  onTaglineClick?: () => void;
}

export const MotivationalHeader: React.FC<MotivationalHeaderProps> = ({ context, userType, onTaglineClick }) => {
  const getHeadline = () => {
    switch (context) {
      case 'login':
        return "Welcome back";
      case 'signup':
        return userType === 'trainer' ? "Ready to change lives?" : "Your transformation starts here";
      case 'trainer-signup':
        return "Join our coaching community";
      case 'forgot':
        return "Let's get you back on track";
      case 'reset':
        return "Create your new beginning";
      default:
        return "Your transformation starts here";
    }
  };

  const getSubtext = () => {
    switch (context) {
      case 'login':
        return "Good to see you again";
      case 'signup':
        return userType === 'trainer' ? "Start inspiring others today" : "Find your perfect trainer match";
      case 'trainer-signup':
        return "Help others achieve their fitness goals";
      case 'forgot':
        return "We'll help you reset your password";
      case 'reset':
        return "Choose a strong password to secure your account";
      default:
        return "Find your perfect trainer match";
    }
  };

  const getTagline = () => {
    return "Not another app. Not another coach. This is personal.";
  };

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
      <h2 className="text-xl font-semibold text-card-foreground mb-2">
        {getHeadline()}
      </h2>
      
      {/* Supporting Subtext */}
      <p className="text-sm text-muted-foreground">
        {getSubtext()}
      </p>
    </div>
  );
};