import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle, Calendar, Lock, Users, Star, Zap, EyeOff, Check } from "lucide-react";

interface AuthPromptProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: 'message' | 'book' | 'save' | 'profile';
  trainerName: string;
}

export const AuthPrompt = ({ 
  isOpen, 
  onClose, 
  actionType,
  trainerName 
}: AuthPromptProps) => {
  const navigate = useNavigate();

  const getActionConfig = () => {
    switch (actionType) {
      case 'message':
        return {
          icon: MessageCircle,
          title: `Message ${trainerName}`,
          description: "Get instant access to direct messaging and start planning your fitness journey together!",
        };
      case 'book':
        return {
          icon: Calendar,
          title: `Book with ${trainerName}`,
          description: "Unlock booking capabilities and schedule your discovery call in seconds!",
        };
      case 'profile':
        return {
          icon: EyeOff,
          title: "🔒 Profiles are locked for members only",
          description: "👀 No peeking! Full trainer details are for members only — unlock free.",
        };
      default:
        return {
          icon: Lock,
          title: "Unlock full trainer profiles & reviews",
          description: "Get instant access to trainer bios, reviews, and discovery calls. Don't miss out!",
        };
    }
  };

  const config = getActionConfig();
  const Icon = config.icon;

  const handleCreateAccount = () => {
    navigate('/auth?signup=true');
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>{config.title}</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        {/* Account Benefits */}
        <div className="space-y-3 py-4">
          <div className="flex items-center gap-3 text-sm">
            <Check className="h-4 w-4 text-primary" />
            <span>Direct message trainers</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Check className="h-4 w-4 text-primary" />
            <span>Book sessions instantly</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Check className="h-4 w-4 text-primary" />
            <span>Read client reviews</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Check className="h-4 w-4 text-primary" />
            <span>Get personalized matches</span>
          </div>
        </div>

        <DialogFooter className="flex-col gap-3">
          <Button onClick={handleCreateAccount} className="w-full animate-pulse">
            🔑 Unlock My Free Account
          </Button>
          
          <div className="flex items-center gap-2 w-full">
            <div className="flex-1 border-t"></div>
            <span className="text-xs text-muted-foreground px-2">or</span>
            <div className="flex-1 border-t"></div>
          </div>
          
          <Button variant="outline" onClick={handleSignIn} className="w-full">
            Sign In
          </Button>
        </DialogFooter>

        {/* Trust signals */}
        <div className="text-center pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Takes 30 seconds. No credit card needed.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};