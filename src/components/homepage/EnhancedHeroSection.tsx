import { Target, Dumbbell, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-fitness-lifestyle.jpg";

interface EnhancedHeroSectionProps {
  onFindMatch: () => void;
  onBrowseAll: () => void;
}

export const EnhancedHeroSection = ({ onFindMatch, onBrowseAll }: EnhancedHeroSectionProps) => {
  return (
    <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage}
          alt="Personal trainer working with client"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/50" />
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
            Discover expert trainers, compare coaching styles, and book your perfect match — no signup needed.
          </p>
          
          {/* CTA Buttons with Hierarchy */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in [animation-delay:0.4s]">
            <Button
              onClick={onFindMatch}
              variant="hero"
              size="lg"
              className="bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-4 text-lg shadow-accent hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Find My Match
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              onClick={onBrowseAll}
              variant="outline"
              size="lg"
              className="border-2 border-white bg-white/10 text-white hover:bg-white hover:text-primary backdrop-blur-sm px-8 py-4 text-lg font-semibold transition-all duration-300 hover:shadow-lg"
            >
              Browse All Trainers
            </Button>
          </div>
          
          {/* Feature highlights with animations */}
          <div className="flex flex-wrap justify-center gap-8 text-white/80 animate-fade-in [animation-delay:0.6s]">
            <div className="flex items-center gap-3 hover:text-white transition-colors duration-300">
              <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
                <Target className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">Personalized Matching</span>
            </div>
            <div className="flex items-center gap-3 hover:text-white transition-colors duration-300">
              <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
                <Dumbbell className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">Certified Professionals</span>
            </div>
            <div className="flex items-center gap-3 hover:text-white transition-colors duration-300">
              <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
                <Users className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">Trusted by 1000+ Users</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};