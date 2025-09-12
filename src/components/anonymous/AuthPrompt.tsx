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
import { MessageCircle, Calendar, Lock, Users, Star, Zap } from "lucide-react";

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
          description: "Start a conversation to discuss your fitness goals and see if you're a good match.",
        };
      case 'book':
        return {
          icon: Calendar,
          title: `Book with ${trainerName}`,
          description: "Schedule your discovery call or first session to get started on your fitness journey.",
        };
      case 'profile':
        return {
          icon: Star,
          title: `View ${trainerName}'s Profile`,
          description: "Access their full profile with detailed experience, certifications, and client reviews.",
        };
      default:
        return {
          icon: Lock,
          title: "Take the next step",
          description: "Create your account to unlock full trainer profiles and booking capabilities.",
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
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
            <span>Direct messaging with trainers</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Book discovery calls and sessions</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Star className="h-4 w-4 text-muted-foreground" />
            <span>Access full trainer profiles & reviews</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>Personalized trainer recommendations</span>
          </div>
        </div>

        <DialogFooter className="flex-col gap-3">
          <Button onClick={handleCreateAccount} className="w-full">
            <Zap className="h-4 w-4 mr-2" />
            Create Free Account
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
            Come and find your perfect coach!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};