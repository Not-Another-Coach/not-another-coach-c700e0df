import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserCheck, Target, Eye } from 'lucide-react';

interface UserIntentModalProps {
  isOpen: boolean;
  onSelectIntent: (intent: 'client' | 'trainer' | 'browse') => void;
}

export function UserIntentModal({ isOpen, onSelectIntent }: UserIntentModalProps) {
  const intentOptions = [
    {
      id: 'client',
      title: "I'm looking for a coach",
      description: "Find your perfect fitness mentor to achieve your goals",
      icon: Target,
      gradient: "bg-gradient-primary",
      shadowClass: "shadow-primary"
    },
    {
      id: 'trainer',
      title: "I'm a coach ready to help others",
      description: "Join our platform to connect with clients and grow your business",
      icon: UserCheck,
      gradient: "bg-gradient-energy",
      shadowClass: "shadow-success"
    },
    {
      id: 'browse',
      title: "Just browsing",
      description: "Explore our platform and see what we offer",
      icon: Eye,
      gradient: "bg-gradient-accent",
      shadowClass: "shadow-accent"
    }
  ] as const;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-2xl border-0 bg-card/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="text-center pb-6">
          <DialogTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            How can we help you today?
          </DialogTitle>
          <p className="text-muted-foreground text-lg mt-2">
            Choose your path to get started with a personalized experience
          </p>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {intentOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <Card 
                key={option.id}
                className={`group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:${option.shadowClass} border-border/50`}
                onClick={() => onSelectIntent(option.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${option.gradient} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                        {option.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        {option.description}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button variant="outline" size="sm">
                        Choose
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="text-center pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            We'll remember your choice for future visits
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}