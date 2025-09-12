import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AppLogo } from '@/components/ui/app-logo';
import { ArrowLeft } from 'lucide-react';

interface EnhancedAuthLayoutProps {
  children: React.ReactNode;
}

export const EnhancedAuthLayout: React.FC<EnhancedAuthLayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Lifestyle Background with Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-gradient-hero"
        style={{
          backgroundImage: `linear-gradient(135deg, hsl(210, 60%, 25% / 0.9), hsl(190, 75%, 50% / 0.8), hsl(145, 65%, 45% / 0.9))`,
          backgroundColor: 'hsl(210, 60%, 25%)'
        }}
      />
      
      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          {/* Glass-effect Card */}
          <Card className="w-full backdrop-blur-lg bg-card/95 border border-white/20 shadow-2xl">
            <div className="p-6">
              {/* Header with Back Button and Logo */}
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/')}
                  className="p-2 text-card-foreground/70 hover:text-card-foreground hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <AppLogo size="lg" showText={false} />
                <div className="w-10"></div> {/* Spacer for centering */}
              </div>
              
              {/* Content */}
              <CardContent className="p-0">
                {children}
              </CardContent>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};