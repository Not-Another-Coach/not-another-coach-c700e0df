import { Target, Dumbbell, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-fitness-lifestyle.jpg";

interface EnhancedHeroSectionProps {
  onFindMatch: () => void;
  showFindMatchButton?: boolean;
}

export const EnhancedHeroSection = ({ onFindMatch, showFindMatchButton = true }: EnhancedHeroSectionProps) => {
  return (
    <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background with Gradient Hero */}
      <div className="absolute inset-0">
        <img 
          src={heroImage}
          alt="Personal trainer working with client"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>
      
      {/* Floating decorative elements */}
      <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-white/10 blur-xl animate-pulse" />
      <div className="absolute bottom-10 left-10 w-24 h-24 rounded-full bg-accent/20 blur-xl animate-pulse [animation-delay:1s]" />
      <div className="absolute top-1/3 left-1/4 w-16 h-16 rounded-full bg-secondary/20 blur-lg animate-pulse [animation-delay:2s]" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in">
            Find Your Perfect
            <span className="block bg-gradient-to-r from-accent to-energy bg-clip-text text-transparent">
              Coach
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8 font-medium animate-fade-in [animation-delay:0.2s]">
            Discover expert trainers, compare coaching styles, and book your perfect match — explore coaches with no commitment.
          </p>
          
          {/* CTA Button */}
          {showFindMatchButton && (
            <div className="flex justify-center animate-fade-in [animation-delay:0.4s]">
              <Button
                onClick={onFindMatch}
                variant="hero"
                size="lg"
                className="bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-4 text-lg shadow-accent hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Find My Match
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};